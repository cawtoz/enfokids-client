"use client"

import * as React from "react"
import type { CRUDService } from "@/lib/generic-crud-service"
import { toast } from "sonner"

export interface UseCRUDOptions<T> {
  service: CRUDService<T, any>
  onError?: (error: Error, action: string) => void
}

export interface UseCRUDReturn<T, TCreateUpdate> {
  // Data state
  items: T[]
  isLoading: boolean
  
  // Modal state
  isCreateOpen: boolean
  isEditOpen: boolean
  editingItem: T | null
  isSubmitting: boolean
  
  // Handlers
  handleCreateOpen: () => void
  handleCreateClose: () => void
  handleEditOpen: (item: T) => void
  handleEditClose: () => void
  handleCreate: (data: TCreateUpdate) => Promise<void>
  handleEdit: (data: TCreateUpdate) => Promise<void>
  handleDelete: (id: number | string) => Promise<void>
  
  // Utilities
  refresh: () => Promise<void>
}

export function useCRUD<T extends { id: number | string }, TCreateUpdate = Omit<T, 'id'>>(
  options: UseCRUDOptions<T>
): UseCRUDReturn<T, TCreateUpdate> {
  const { service, onError } = options
  
  const [items, setItems] = React.useState<T[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [editingItem, setEditingItem] = React.useState<T | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [urlParamsProcessed, setUrlParamsProcessed] = React.useState(false)

  // Fetch items
  const fetchItems = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await service.getAll()
      setItems(data)
    } catch (error) {
      console.error("Error fetching items:", error)
      onError?.(error as Error, "fetch")
    } finally {
      setIsLoading(false)
    }
  }, [service, onError])

  React.useEffect(() => {
    fetchItems()
  }, [fetchItems])

  // Handle URL params for auto-opening modals (only once on mount)
  React.useEffect(() => {
    if (typeof window === "undefined" || urlParamsProcessed || items.length === 0) return
    
    const params = new URLSearchParams(window.location.search)
    const action = params.get("action")
    const id = params.get("id")

    if (action === "crear") {
      setIsCreateOpen(true)
      setUrlParamsProcessed(true)
    } else if (action === "editar" && id) {
      const item = items.find((item) => String(item.id) === id)
      if (item) {
        setEditingItem(item)
        setIsEditOpen(true)
        setUrlParamsProcessed(true)
      }
    }
  }, [items, urlParamsProcessed])

  // Clean URL params
  const cleanUrlParams = React.useCallback(() => {
    if (typeof window === "undefined") return
    
    const url = new URL(window.location.href)
    url.searchParams.delete("action")
    url.searchParams.delete("id")
    window.history.replaceState({}, "", url.toString())
  }, [])

  // Update URL params
  const updateUrlParams = React.useCallback((params: Record<string, string>) => {
    if (typeof window === "undefined") return
    
    const url = new URL(window.location.href)
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
    window.history.pushState({}, "", url.toString())
  }, [])

  // Handlers
  const handleCreateOpen = React.useCallback(() => {
    setIsCreateOpen(true)
    updateUrlParams({ action: "crear" })
  }, [updateUrlParams])

  const handleCreateClose = React.useCallback(() => {
    setIsCreateOpen(false)
    setUrlParamsProcessed(false)
    cleanUrlParams()
  }, [cleanUrlParams])

  const handleEditOpen = React.useCallback((item: T) => {
    setEditingItem(item)
    setIsEditOpen(true)
    setUrlParamsProcessed(true)
    updateUrlParams({ action: "editar", id: String(item.id) })
  }, [updateUrlParams])

  const handleEditClose = React.useCallback(() => {
    setIsEditOpen(false)
    setEditingItem(null)
    setUrlParamsProcessed(false)
    cleanUrlParams()
  }, [cleanUrlParams])

  const handleCreate = React.useCallback(async (data: TCreateUpdate) => {
    setIsSubmitting(true)
    try {
      await service.create(data)
      await fetchItems()
      handleCreateClose()
      toast.success("Registro creado exitosamente")
    } catch (error) {
      console.error("Error creating item:", error)
      toast.error("Error al crear el registro")
      onError?.(error as Error, "create")
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }, [service, fetchItems, handleCreateClose, onError])

  const handleEdit = React.useCallback(async (data: TCreateUpdate) => {
    if (!editingItem) return

    setIsSubmitting(true)
    try {
      await service.update(editingItem.id, data)
      await fetchItems()
      handleEditClose()
      toast.success("Registro actualizado exitosamente")
    } catch (error) {
      console.error("Error updating item:", error)
      toast.error("Error al actualizar el registro")
      onError?.(error as Error, "update")
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }, [editingItem, service, fetchItems, handleEditClose, onError])

  const handleDelete = React.useCallback(async (id: number | string) => {
    try {
      await service.delete(id)
      await fetchItems()
      toast.success("Registro eliminado exitosamente")
    } catch (error: any) {
      console.error("Error deleting item:", error)
      const errorMessage = error.response?.data?.message || error.message || "Error al eliminar el registro"
      toast.error(errorMessage)
      onError?.(error as Error, "delete")
    }
  }, [service, fetchItems, onError])

  return {
    items,
    isLoading,
    isCreateOpen,
    isEditOpen,
    editingItem,
    isSubmitting,
    handleCreateOpen,
    handleCreateClose,
    handleEditOpen,
    handleEditClose,
    handleCreate,
    handleEdit,
    handleDelete,
    refresh: fetchItems,
  }
}

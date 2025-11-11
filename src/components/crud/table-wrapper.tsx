"use client"

import * as React from "react"
import type { CRUDService } from "@/lib/generic-crud-service"
import { useCRUD } from "@/hooks/use-crud"
import { TableCRUD, type ColumnDef } from "./table-crud"

export interface TableWrapperProps<T, TCreateUpdate> {
  service: CRUDService<T, TCreateUpdate>
  columns: ColumnDef<T>[] | ((onEdit: (item: T) => void, onDelete: (id: number | string) => void) => ColumnDef<T>[])
  FormComponent: React.ComponentType<{
    onSubmit: (data: TCreateUpdate) => Promise<void>
    initialData?: T
    isSubmitting?: boolean
  }>
  title: string
  description?: string
  createButtonLabel?: string
  onError?: (error: Error, action: string) => void
  searchColumn?: string
  searchPlaceholder?: string
}

export function TableWrapper<T extends { id: number | string }, TCreateUpdate = Omit<T, 'id'>>({
  service,
  columns: columnsOrFactory,
  FormComponent,
  title,
  description,
  createButtonLabel = "Crear",
  onError,
  searchColumn,
  searchPlaceholder,
}: TableWrapperProps<T, TCreateUpdate>) {
  const crud = useCRUD<T, TCreateUpdate>({ service, onError })
  const [deleteId, setDeleteId] = React.useState<number | string | null>(null)

  const handleDeleteRequest = React.useCallback((id: number | string) => {
    setDeleteId(id)
  }, [])

  const handleDeleteConfirm = React.useCallback(async () => {
    if (!deleteId) return
    await crud.handleDelete(deleteId)
    setDeleteId(null)
  }, [deleteId, crud.handleDelete])

  const columns = typeof columnsOrFactory === 'function'
    ? columnsOrFactory(crud.handleEditOpen, handleDeleteRequest)
    : columnsOrFactory

  return (
    <TableCRUD
      title={title}
      description={description}
      createButtonLabel={createButtonLabel}
      columns={columns}
      data={crud.items}
      isLoading={crud.isLoading}
      isCreateOpen={crud.isCreateOpen}
      isEditOpen={crud.isEditOpen}
      onCreateOpen={crud.handleCreateOpen}
      onCreateClose={crud.handleCreateClose}
      onEditOpen={crud.handleEditOpen}
      onEditClose={crud.handleEditClose}
      onDelete={handleDeleteConfirm}
      deleteId={deleteId}
      onDeleteCancel={() => setDeleteId(null)}
      searchColumn={searchColumn}
      searchPlaceholder={searchPlaceholder}
      createForm={
        <FormComponent
          onSubmit={crud.handleCreate}
          isSubmitting={crud.isSubmitting}
        />
      }
      editForm={
        crud.editingItem ? (
          <FormComponent
            onSubmit={crud.handleEdit}
            initialData={crud.editingItem}
            isSubmitting={crud.isSubmitting}
          />
        ) : null
      }
    />
  )
}

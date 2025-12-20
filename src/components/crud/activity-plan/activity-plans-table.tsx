"use client"

import * as React from "react"
import { ActivityPlanManager } from "./activity-plan-manager"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { GenericCRUDService } from "@/lib/generic-crud-service"
import type { ActivityPlan, CreateActivityPlanRequest } from "@/types/activity-plan"
import type { PlanDetail } from "@/types/plan-detail"
import type { ColumnDef } from "@/components/crud/table-crud"
import { TableCRUD } from "@/components/crud/table-crud"
import { useCRUD } from "@/hooks/use-crud"
import { ArrowUpDown, Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import axios from "axios"

const activityPlansService = new GenericCRUDService<ActivityPlan, CreateActivityPlanRequest>(
  "/api",
  "activity-plans"
)

function ActivitiesPreview({ planId }: { planId: number }) {
  const [activities, setActivities] = React.useState<PlanDetail[]>([])
  const [loading, setLoading] = React.useState(false)
  const [open, setOpen] = React.useState(false)

  const fetchActivities = async () => {
    try {
      setLoading(true)
      const response = await axios.get<PlanDetail[]>(`/api/activity-plans/${planId}/activities`)
      setActivities(response.data)
    } catch (error) {
      console.error("Error cargando actividades del plan:", error)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    if (open) {
      fetchActivities()
    }
  }, [open, planId])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4 mr-2" />
          Ver Actividades
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Actividades del Plan</DialogTitle>
          <DialogDescription>
            Lista de actividades asociadas a este plan
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {loading ? (
            <p className="text-center text-muted-foreground py-4">Cargando...</p>
          ) : activities.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No hay actividades en este plan
            </p>
          ) : (
            <ul className="space-y-2">
              {activities.map((detail) => (
                <li key={detail.id} className="flex items-start justify-between gap-4 py-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{detail.activityTitle}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {detail.estimatedDuration} min • {detail.repetitions} rep • {detail.frequencyCount}x {detail.frequencyUnit === "DAY" ? "Diaria" : detail.frequencyUnit === "WEEK" ? "Semanal" : "Mensual"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="outline">{detail.frequencyCount}x</Badge>
                    <Badge variant="outline">{detail.repetitions} rep</Badge>
                    <Badge variant="outline">{detail.estimatedDuration} min</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function ActivityPlansTable() {
  const crud = useCRUD<ActivityPlan, CreateActivityPlanRequest>({ service: activityPlansService })
  const [deleteId, setDeleteId] = React.useState<number | string | null>(null)
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [editingItem, setEditingItem] = React.useState<ActivityPlan | undefined>()

  const handleEditOpen = React.useCallback((item: ActivityPlan) => {
    setEditingItem(item)
    setIsFormOpen(true)
  }, [])

  const handleCreateOpen = React.useCallback(() => {
    setEditingItem(undefined)
    setIsFormOpen(true)
  }, [])

  const handleFormClose = React.useCallback(() => {
    setIsFormOpen(false)
    setEditingItem(undefined)
  }, [])

  const handleFormSuccess = React.useCallback(() => {
    crud.refresh()
    handleFormClose()
  }, [crud, handleFormClose])

  const handleDeleteRequest = React.useCallback((id: number | string) => {
    setDeleteId(id)
  }, [])

  const handleDeleteConfirm = React.useCallback(async () => {
    if (!deleteId) return
    await crud.handleDelete(deleteId)
    setDeleteId(null)
  }, [deleteId, crud.handleDelete])

  const columns: ColumnDef<ActivityPlan>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Título
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "description",
      header: "Descripción",
      cell: ({ row }) => (
        <span className="max-w-xs truncate block">
          {row.getValue("description")}
        </span>
      ),
    },
    {
      accessorKey: "therapistName",
      header: "Terapeuta",
    },
    {
      id: "activities",
      header: "Actividades",
      cell: ({ row }) => {
        const plan = row.original
        return <ActivitiesPreview planId={plan.id} />
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const item = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleEditOpen(item)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDeleteRequest(item.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <>
      <TableCRUD
        title="Planes de Actividades"
        description="Gestiona los planes de actividades del sistema"
        createButtonLabel="Crear Plan"
        columns={columns}
        data={crud.items}
        isLoading={crud.isLoading}
        isCreateOpen={isFormOpen && !editingItem}
        isEditOpen={isFormOpen && !!editingItem}
        onCreateOpen={handleCreateOpen}
        onCreateClose={handleFormClose}
        onEditOpen={handleEditOpen}
        onEditClose={handleFormClose}
        onDelete={handleDeleteConfirm}
        deleteId={deleteId}
        onDeleteCancel={() => setDeleteId(null)}
        searchColumn="title"
        searchPlaceholder="Buscar por título..."
        createForm={
          <ActivityPlanManager
            onSuccess={handleFormSuccess}
            onClose={handleFormClose}
          />
        }
        editForm={
          editingItem ? (
            <ActivityPlanManager
              initialData={editingItem}
              onSuccess={handleFormSuccess}
              onClose={handleFormClose}
            />
          ) : null
        }
      />
    </>
  )
}

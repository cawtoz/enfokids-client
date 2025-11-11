"use client"

import * as React from "react"
import { TableWrapper } from "@/components/crud/table-wrapper"
import { ActivityForm } from "@/components/crud/activity/activity-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { GenericCRUDService } from "@/lib/generic-crud-service"
import type { Activity, CreateActivityRequest } from "@/types/activity"
import type { ColumnDef } from "@/components/crud/table-crud"
import { MoreHorizontal, Pencil, Trash2, ArrowUpDown } from "lucide-react"

const activitiesService = new GenericCRUDService<Activity, CreateActivityRequest>(
  "/api",
  "activities"
)

// Helper para crear columnas de acciones
export function createActionsColumn<T extends { id: number | string }>(
  onEdit: (item: T) => void,
  onDelete: (id: number | string) => void
): ColumnDef<T> {
  return {
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
            <DropdownMenuItem onClick={() => onEdit(item)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(item.id)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  }
}

export function ActivitiesTable() {
  return (
    <TableWrapper
      service={activitiesService}
      FormComponent={ActivityForm}
      title="Actividades"
      description="Gestiona las actividades del sistema"
      createButtonLabel="Crear Actividad"
      searchColumn="title"
      searchPlaceholder="Buscar por título..."
      columns={(onEdit, onDelete) => [
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
          accessorKey: "type",
          header: "Tipo",
          cell: ({ row }) => {
            const type = row.getValue("type") as "DIGITAL" | "NON_DIGITAL"
            return (
              <Badge variant={type === "DIGITAL" ? "default" : "secondary"}>
                {type === "DIGITAL" ? "Digital" : "No Digital"}
              </Badge>
            )
          },
        },
        createActionsColumn(onEdit, onDelete),
      ]}
    />
  )
}

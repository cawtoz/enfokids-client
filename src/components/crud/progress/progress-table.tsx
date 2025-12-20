"use client"

import * as React from "react"
import { TableWrapper } from "@/components/crud/table-wrapper"
import { ProgressForm } from "@/components/crud/progress/progress-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GenericCRUDService } from "@/lib/generic-crud-service"
import type { Progress, CreateProgressRequest } from "@/types/progress"
import type { ColumnDef } from "@/components/crud/table-crud"
import { createActionsColumn } from "@/components/crud/activity/activities-table"
import { ArrowUpDown, CheckCircle2, XCircle } from "lucide-react"

const progressService = new GenericCRUDService<Progress, CreateProgressRequest>(
  "/api",
  "progress"
)

export function ProgressTable() {
  return (
    <TableWrapper
      service={progressService}
      FormComponent={ProgressForm}
      title="Progreso"
      description="Gestiona el progreso de las asignaciones"
      createButtonLabel="Registrar Progreso"
      searchColumn="notes"
      searchPlaceholder="Buscar en notas..."
      columns={(onEdit, onDelete) => [
        {
          accessorKey: "id",
          header: "ID",
        },
        {
          accessorKey: "assignmentId",
          header: "ID Asignación",
        },
        {
          accessorKey: "date",
          header: ({ column }) => {
            return (
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >
                Fecha
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            )
          },
          cell: ({ row }) => {
            const date = new Date(row.getValue("date"))
            return date.toLocaleString()
          },
        },
        {
          accessorKey: "notes",
          header: "Notas",
          cell: ({ row }) => (
            <span className="max-w-xs truncate block">
              {row.getValue("notes")}
            </span>
          ),
        },
        {
          accessorKey: "completed",
          header: "Completado",
          cell: ({ row }) => {
            const completed = row.getValue("completed") as boolean
            return completed ? (
              <Badge variant="default" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Sí
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <XCircle className="h-3 w-3" />
                No
              </Badge>
            )
          },
        },
        createActionsColumn(onEdit, onDelete),
      ]}
    />
  )
}

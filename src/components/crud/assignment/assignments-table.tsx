"use client"

import * as React from "react"
import { TableWrapper } from "@/components/crud/table-wrapper"
import { AssignmentForm } from "@/components/crud/assignment/assignment-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GenericCRUDService } from "@/lib/generic-crud-service"
import type { Assignment, CreateAssignmentRequest, AssignmentStatus } from "@/types/assignment"
import type { ColumnDef } from "@/components/crud/table-crud"
import { createActionsColumn } from "@/components/crud/activity/activities-table"
import { ArrowUpDown } from "lucide-react"

const assignmentsService = new GenericCRUDService<Assignment, CreateAssignmentRequest>(
  "/api",
  "assignments"
)

const statusMap: Record<AssignmentStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PENDING: { label: "Pendiente", variant: "outline" },
  IN_PROGRESS: { label: "En Progreso", variant: "default" },
  COMPLETED: { label: "Completado", variant: "secondary" },
  CANCELLED: { label: "Cancelado", variant: "destructive" },
}

export function AssignmentsTable() {
  return (
    <TableWrapper
      service={assignmentsService}
      FormComponent={AssignmentForm}
      title="Asignaciones"
      description="Gestiona las asignaciones del sistema"
      createButtonLabel="Crear Asignación"
      searchColumn="activityTitle"
      searchPlaceholder="Buscar por actividad..."
      columns={(onEdit, onDelete) => [
        {
          accessorKey: "id",
          header: "ID",
        },
        {
          accessorKey: "activityTitle",
          header: ({ column }) => {
            return (
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >
                Actividad
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            )
          },
        },
        {
          accessorKey: "childName",
          header: "Niño",
        },
        {
          accessorKey: "therapistName",
          header: "Terapeuta",
        },
        {
          accessorKey: "startDate",
          header: "Inicio",
          cell: ({ row }) => {
            const date = new Date(row.getValue("startDate"))
            return date.toLocaleDateString()
          },
        },
        {
          accessorKey: "endDate",
          header: "Fin",
          cell: ({ row }) => {
            const date = new Date(row.getValue("endDate"))
            return date.toLocaleDateString()
          },
        },
        {
          accessorKey: "status",
          header: "Estado",
          cell: ({ row }) => {
            const status = row.getValue("status") as AssignmentStatus
            const config = statusMap[status]
            return (
              <Badge variant={config.variant}>
                {config.label}
              </Badge>
            )
          },
        },
        createActionsColumn(onEdit, onDelete),
      ]}
    />
  )
}

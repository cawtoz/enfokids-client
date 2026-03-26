"use client"

import * as React from "react"
import { TableWrapper } from "@/components/crud/table-wrapper"
import { ChildForm } from "@/components/crud/child/child-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GenericCRUDService } from "@/lib/generic-crud-service"
import type { Child, CreateChildRequest } from "@/types/user"
import type { ColumnDef } from "@/components/crud/table-crud"
import { createActionsColumn } from "@/components/crud/activity/activities-table"
import { ChildAssignmentsSheet } from "@/components/crud/child/child-assignments-sheet"
import { ChildCaregiversSheet } from "@/components/crud/child/child-caregivers-sheet"
import { ArrowUpDown } from "lucide-react"

const childrenService = new GenericCRUDService<Child, CreateChildRequest>(
  "/api",
  "children"
)

export function ChildrenTable() {
  return (
    <TableWrapper
      service={childrenService}
      FormComponent={ChildForm}
      title="Niños"
      description="Gestiona los niños del sistema"
      createButtonLabel="Crear Niño"
      searchColumn="firstName"
      searchPlaceholder="Buscar por nombre..."
      columns={(onEdit, onDelete) => [
        {
          accessorKey: "id",
          header: "ID",
        },
        {
          accessorKey: "username",
          header: "Usuario",
        },
        {
          accessorKey: "firstName",
          header: ({ column }) => {
            return (
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >
                Nombre
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            )
          },
        },
        {
          accessorKey: "lastName",
          header: "Apellido",
        },
        {
          accessorKey: "email",
          header: "Email",
        },
        {
          accessorKey: "diagnosis",
          header: "Diagnóstico",
          cell: ({ row }) => (
            <span className="max-w-xs truncate block">
              {row.getValue("diagnosis")}
            </span>
          ),
        },
        {
          accessorKey: "therapist",
          header: "Terapeuta",
          cell: ({ row }) => {
            const therapist = row.getValue("therapist") as any
            return therapist ? (
              <span>{therapist.firstName} {therapist.lastName}</span>
            ) : (
              <Badge variant="outline">Sin asignar</Badge>
            )
          },
        },
        {
          id: "assignments",
          header: "Asignaciones",
          cell: ({ row }) => <ChildAssignmentsSheet child={row.original} />,
        },
        {
          id: "caregivers",
          header: "Cuidadores",
          cell: ({ row }) => <ChildCaregiversSheet child={row.original} />,
        },
        createActionsColumn(onEdit, onDelete),
      ]}
    />
  )
}

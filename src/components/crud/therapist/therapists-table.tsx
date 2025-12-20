"use client"

import * as React from "react"
import { TableWrapper } from "@/components/crud/table-wrapper"
import { TherapistForm } from "@/components/crud/therapist/therapist-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GenericCRUDService } from "@/lib/generic-crud-service"
import type { Therapist, CreateTherapistRequest } from "@/types/user"
import type { ColumnDef } from "@/components/crud/table-crud"
import { createActionsColumn } from "@/components/crud/activity/activities-table"
import { ArrowUpDown } from "lucide-react"

const therapistsService = new GenericCRUDService<Therapist, CreateTherapistRequest>(
  "/api",
  "therapists"
)

export function TherapistsTable() {
  return (
    <TableWrapper
      service={therapistsService}
      FormComponent={TherapistForm}
      title="Terapeutas"
      description="Gestiona los terapeutas del sistema"
      createButtonLabel="Crear Terapeuta"
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
          accessorKey: "speciality",
          header: "Especialidad",
          cell: ({ row }) => (
            <Badge variant="secondary">
              {row.getValue("speciality")}
            </Badge>
          ),
        },
        createActionsColumn(onEdit, onDelete),
      ]}
    />
  )
}

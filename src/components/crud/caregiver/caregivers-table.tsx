"use client"

import * as React from "react"
import { TableWrapper } from "@/components/crud/table-wrapper"
import { CaregiverForm } from "@/components/crud/caregiver/caregiver-form"
import { Button } from "@/components/ui/button"
import { GenericCRUDService } from "@/lib/generic-crud-service"
import type { Caregiver, CreateCaregiverRequest } from "@/types/user"
import type { ColumnDef } from "@/components/crud/table-crud"
import { createActionsColumn } from "@/components/crud/activity/activities-table"
import { CaregiverChildrenSheet } from "@/components/crud/caregiver/caregiver-children-sheet"
import { ArrowUpDown } from "lucide-react"

const caregiversService = new GenericCRUDService<Caregiver, CreateCaregiverRequest>(
  "/api",
  "caregivers"
)

export function CaregiversTable() {
  return (
    <TableWrapper
      service={caregiversService}
      FormComponent={CaregiverForm}
      title="Cuidadores"
      description="Gestiona los cuidadores del sistema"
      createButtonLabel="Crear Cuidador"
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
          id: "children",
          header: "Niños",
          cell: ({ row }) => <CaregiverChildrenSheet caregiver={row.original} />,
        },
        createActionsColumn(onEdit, onDelete),
      ]}
    />
  )
}

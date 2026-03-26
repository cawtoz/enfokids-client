"use client"

import * as React from "react"
import { TableWrapper } from "@/components/crud/table-wrapper"
import { ActivityPlanForm } from "@/components/crud/activity-plan/activity-plan-form"
import { ActivityPlanService } from "@/components/crud/activity-plan/activity-plan-service"
import { Button } from "@/components/ui/button"
import type { ActivityPlan } from "@/types/activity-plan"
import type { CreateActivityPlanWithActivitiesRequest } from "@/types/activity-plan"
import type { ColumnDef } from "@/components/crud/table-crud"
import { createActionsColumn } from "@/components/crud/activity/activities-table"
import { ActivityPlanDetailsSheet } from "@/components/crud/activity-plan/activity-plan-details-sheet"
import { ArrowUpDown } from "lucide-react"

const activityPlansService = new ActivityPlanService()

export function ActivityPlansTable() {
  return (
    <TableWrapper<ActivityPlan, CreateActivityPlanWithActivitiesRequest>
      service={activityPlansService}
      FormComponent={ActivityPlanForm}
      title="Planes de Actividades"
      description="Gestiona los planes de actividades del sistema"
      createButtonLabel="Crear Plan"
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
          accessorKey: "therapistName",
          header: "Terapeuta",
        },
        {
          id: "details",
          header: "Actividades",
          cell: ({ row }) => <ActivityPlanDetailsSheet plan={row.original} />,
        },
        createActionsColumn(onEdit, onDelete),
      ]}
    />
  )
}

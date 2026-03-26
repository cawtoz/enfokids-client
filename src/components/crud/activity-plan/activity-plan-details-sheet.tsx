"use client"

import * as React from "react"
import axios from "axios"
import { ListChecks } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { FrequencyUnit } from "@/types/assignment"
import type { PlanDetail } from "@/types/plan-detail"
import type { ActivityPlan } from "@/types/activity-plan"

const apiClient = axios.create({ baseURL: "/api", headers: { "Content-Type": "application/json" } })

const frequencyUnitLabel: Record<FrequencyUnit, string> = {
  [FrequencyUnit.DAY]:   "día",
  [FrequencyUnit.WEEK]:  "semana",
  [FrequencyUnit.MONTH]: "mes",
}

interface ActivityPlanDetailsSheetProps {
  plan: ActivityPlan
}

export function ActivityPlanDetailsSheet({ plan }: ActivityPlanDetailsSheetProps) {
  const [open, setOpen] = React.useState(false)
  const [details, setDetails] = React.useState<PlanDetail[]>([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (!open) return
    setLoading(true)
    apiClient
      .get<PlanDetail[]>(`activity-plans/${plan.id}/activities`)
      .then((res) => setDetails(res.data))
      .catch(() => setDetails([]))
      .finally(() => setLoading(false))
  }, [open, plan.id])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" title="Ver actividades del plan">
          <ListChecks className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-6">
        <SheetHeader>
          <SheetTitle>{plan.title}</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {plan.description && (
            <p className="text-sm text-muted-foreground">{plan.description}</p>
          )}

          <div className="flex items-center gap-2">
            <Badge variant="outline">{details.length} actividad(es)</Badge>
            <Badge variant="secondary">{plan.therapistName}</Badge>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Cargando...</p>
          ) : details.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Este plan no tiene actividades registradas.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Actividad</TableHead>
                  <TableHead>Frecuencia</TableHead>
                  <TableHead>Repeticiones</TableHead>
                  <TableHead>Duración</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {details.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.activityTitle}</TableCell>
                    <TableCell>
                      {d.frequencyCount}x {frequencyUnitLabel[d.frequencyUnit] ?? d.frequencyUnit}
                    </TableCell>
                    <TableCell>{d.repetitions}</TableCell>
                    <TableCell>
                      {d.estimatedDuration ? `${d.estimatedDuration} min` : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

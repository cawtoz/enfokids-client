"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import type { ActivityPlan } from "@/types/activity-plan"
import type { PlanDetail } from "@/types/plan-detail"
import type { Child } from "@/types/user"

const apiClient = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
})

const assignPlanSchema = z.object({
  therapistId: z.coerce.number().min(1, "Seleccione un terapeuta"),
  childId: z.coerce.number().min(1, "Seleccione un niño"),
  planId: z.coerce.number().min(1, "Seleccione un plan"),
  startDate: z.string().min(1, "Fecha de inicio requerida"),
  endDate: z.string().min(1, "Fecha de fin requerida"),
})

type AssignPlanFormValues = z.infer<typeof assignPlanSchema>

export interface AssignPlanFormProps {
  onSuccess: () => void
}

export function AssignPlanForm({ onSuccess }: AssignPlanFormProps) {
  const [children, setChildren] = React.useState<Child[]>([])
  const [plans, setPlans] = React.useState<ActivityPlan[]>([])
  const [planDetails, setPlanDetails] = React.useState<PlanDetail[]>([])
  const [isLoadingOptions, setIsLoadingOptions] = React.useState(true)
  const [isLoadingPlan, setIsLoadingPlan] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    async function loadOptions() {
      setIsLoadingOptions(true)
      try {
        const [c, p] = await Promise.all([
          apiClient.get<Child[]>("children"),
          apiClient.get<ActivityPlan[]>("activity-plans"),
        ])
        setChildren(c.data)
        setPlans(p.data)
      } catch (err) {
        console.error("Error cargando opciones:", err)
      } finally {
        setIsLoadingOptions(false)
      }
    }
    loadOptions()
  }, [])

  const form = useForm<AssignPlanFormValues>({
    resolver: zodResolver(assignPlanSchema) as any,
    defaultValues: {
      therapistId: 0,
      childId: 0,
      planId: 0,
      startDate: "",
      endDate: "",
    },
  })

  const selectedChildId = form.watch("childId")
  const selectedPlanId = form.watch("planId")

  // Auto-set therapistId from selected child
  React.useEffect(() => {
    if (!selectedChildId || selectedChildId === 0) return
    const child = children.find((c) => c.id === selectedChildId)
    if (child?.therapist?.id) {
      form.setValue("therapistId", child.therapist.id)
    }
  }, [selectedChildId, children, form])

  React.useEffect(() => {
    if (!selectedPlanId || selectedPlanId === 0) {
      setPlanDetails([])
      return
    }
    setIsLoadingPlan(true)
    apiClient
      .get<PlanDetail[]>(`activity-plans/${selectedPlanId}/activities`)
      .then((res) => setPlanDetails(res.data))
      .catch(() => setPlanDetails([]))
      .finally(() => setIsLoadingPlan(false))
  }, [selectedPlanId])

  const handleSubmit = async (data: AssignPlanFormValues) => {
    if (planDetails.length === 0) {
      toast.error("El plan seleccionado no tiene actividades")
      return
    }

    setIsSubmitting(true)
    try {
      await Promise.all(
        planDetails.map((detail) =>
          apiClient.post("assignments", {
            therapistId: data.therapistId,
            childId: data.childId,
            activityId: detail.activityId,
            startDate: data.startDate.includes("T") ? data.startDate : `${data.startDate}T00:00:00`,
            endDate: data.endDate.includes("T") ? data.endDate : `${data.endDate}T00:00:00`,
            status: "PENDING",
            frequencyUnit: detail.frequencyUnit,
            frequencyCount: detail.frequencyCount,
            repetitions: detail.repetitions,
            estimatedDuration: detail.estimatedDuration,
          })
        )
      )
      toast.success(`${planDetails.length} asignación(es) creadas correctamente`)
      onSuccess()
    } catch (err) {
      toast.error("Error al crear las asignaciones")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {isLoadingOptions ? (
          <div className="flex items-center gap-2 py-4">
            <Spinner className="h-4 w-4" />
            <span className="text-sm text-muted-foreground">Cargando datos...</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Child — therapist is auto-derived from child */}
              <FormField
                control={form.control}
                name="childId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Niño</FormLabel>
                    <Select
                      onValueChange={(val) => field.onChange(Number(val))}
                      defaultValue={field.value ? String(field.value) : undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un niño" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {children.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.firstName} {c.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Plan */}
              <FormField
                control={form.control}
                name="planId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan de Actividades</FormLabel>
                    <Select
                      onValueChange={(val) => field.onChange(Number(val))}
                      defaultValue={field.value ? String(field.value) : undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un plan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {plans.map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>
                            {p.title}
                            <span className="text-muted-foreground ml-1 text-xs">
                              — {p.therapistName}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Therapist read-only display */}
            {selectedChildId > 0 && (() => {
              const child = children.find((c) => c.id === selectedChildId)
              return child?.therapist ? (
                <p className="text-sm text-muted-foreground">
                  Terapeuta: <span className="font-medium text-foreground">{child.therapist.firstName} {child.therapist.lastName}</span>
                </p>
              ) : null
            })()} 

            {/* Plan activities preview */}
            {selectedPlanId > 0 && (
              <div className="rounded-md border p-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Actividades del plan
                </p>
                {isLoadingPlan ? (
                  <div className="flex items-center gap-2">
                    <Spinner className="h-3 w-3" />
                    <span className="text-xs text-muted-foreground">Cargando...</span>
                  </div>
                ) : planDetails.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">
                    Este plan no tiene actividades
                  </p>
                ) : (
                  <div className="space-y-1">
                    {planDetails.map((d) => (
                      <div key={d.id} className="flex items-center gap-2 text-sm flex-wrap">
                        <span className="flex-1 min-w-0 truncate font-medium">{d.activityTitle}</span>
                        <Badge variant="outline">
                          {d.frequencyCount}x/{d.frequencyUnit.toLowerCase()}
                        </Badge>
                        <Badge variant="secondary">{d.repetitions} rep.</Badge>
                        <Badge variant="outline">{d.estimatedDuration} min</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Inicio</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Fin</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        )}

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={isSubmitting || isLoadingOptions || isLoadingPlan || planDetails.length === 0}
          >
            {isSubmitting ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Asignando...
              </>
            ) : (
              `Asignar ${planDetails.length > 0 ? `(${planDetails.length} actividades)` : "Plan"}`
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}

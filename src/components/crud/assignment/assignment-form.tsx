"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AssignmentStatus, FrequencyUnit, type Assignment, type CreateAssignmentRequest } from "@/types/assignment"
import type { Child } from "@/types/user"
import type { Activity } from "@/types/activity"

const apiClient = axios.create({ baseURL: "/api", headers: { "Content-Type": "application/json" } })

const assignmentSchema = z.object({
  therapistId: z.coerce.number().min(1, "Terapeuta requerido"),
  childId: z.coerce.number().min(1, "Debe seleccionar un niño"),
  activityId: z.coerce.number().min(1, "Debe seleccionar una actividad"),
  startDate: z.string().min(1, "Fecha de inicio requerida"),
  endDate: z.string().min(1, "Fecha de fin requerida"),
  frequencyUnit: z.nativeEnum(FrequencyUnit),
  frequencyCount: z.coerce.number().min(1, "Debe ser al menos 1"),
  repetitions: z.coerce.number().min(1, "Debe ser al menos 1"),
  estimatedDuration: z.coerce.number().min(1, "Debe ser al menos 1 minuto"),
  status: z.nativeEnum(AssignmentStatus),
})

type AssignmentFormValues = z.infer<typeof assignmentSchema>

export interface AssignmentFormProps {
  initialData?: Assignment
  onSubmit: (data: CreateAssignmentRequest) => Promise<void>
  isSubmitting?: boolean
}

export function AssignmentForm({
  initialData,
  onSubmit,
  isSubmitting = false,
}: AssignmentFormProps) {
  const [children, setChildren] = React.useState<Child[]>([])
  const [activities, setActivities] = React.useState<Activity[]>([])

  React.useEffect(() => {
    Promise.all([
      apiClient.get<Child[]>("children"),
      apiClient.get<Activity[]>("activities"),
    ]).then(([c, a]) => {
      setChildren(c.data)
      setActivities(a.data)
    }).catch(() => {})
  }, [])

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema) as any,
    defaultValues: {
      therapistId: initialData?.therapistId ?? 0,
      childId: initialData?.childId ?? 0,
      activityId: initialData?.activityId ?? 0,
      startDate: initialData?.startDate?.split('T')[0] ?? (() => {
        const d = new Date();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${d.getFullYear()}-${month}-${day}`;
      })(),
      endDate: initialData?.endDate?.split('T')[0] ?? (() => {
        const d = new Date();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${d.getFullYear()}-${month}-${day}`;
      })(),
      frequencyUnit: initialData?.frequencyUnit ?? FrequencyUnit.DAY,
      frequencyCount: initialData?.frequencyCount ?? 1,
      repetitions: initialData?.repetitions ?? 1,
      estimatedDuration: initialData?.estimatedDuration ?? 30,
      status: initialData?.status ?? AssignmentStatus.PENDING,
    },
  })

  const selectedChildId = form.watch("childId")

  // Auto-set therapistId from the selected child
  React.useEffect(() => {
    if (!selectedChildId || selectedChildId === 0) return
    const child = children.find((c) => c.id === selectedChildId)
    if (child?.therapist?.id) {
      form.setValue("therapistId", child.therapist.id)
    }
  }, [selectedChildId, children, form])

  const selectedChild = children.find((c) => c.id === selectedChildId)

  const handleSubmit = async (data: AssignmentFormValues) => {
    await onSubmit({
      ...data,
      startDate: data.startDate.includes("T") ? data.startDate : `${data.startDate}T00:00:00`,
      endDate: data.endDate.includes("T") ? data.endDate : `${data.endDate}T00:00:00`,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Child */}
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

          {/* Activity */}
          <FormField
            control={form.control}
            name="activityId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Actividad</FormLabel>
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  defaultValue={field.value ? String(field.value) : undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una actividad" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {activities.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>
                        {a.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Therapist read-only derived from child */}
        {selectedChild?.therapist && (
          <p className="text-sm text-muted-foreground">
            Terapeuta: <span className="font-medium text-foreground">{selectedChild.therapist.firstName} {selectedChild.therapist.lastName}</span>
          </p>
        )}

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="frequencyUnit"
            render={({ field }) => (
              <FormItem className="h-full flex flex-col justify-between">
                <FormLabel>Unidad de Frecuencia</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona la unidad" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={FrequencyUnit.DAY}>Diaria</SelectItem>
                    <SelectItem value={FrequencyUnit.WEEK}>Semanal</SelectItem>
                    <SelectItem value={FrequencyUnit.MONTH}>Mensual</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="frequencyCount"
            render={({ field }) => (
              <FormItem className="h-full flex flex-col justify-between">
                <FormLabel>Frecuencia</FormLabel>
                <FormControl>
                  <Input type="number" min="1" placeholder="Cantidad" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="repetitions"
            render={({ field }) => (
              <FormItem className="h-full flex flex-col justify-between">
                <FormLabel>Repeticiones</FormLabel>
                <FormControl>
                  <Input type="number" min="1" placeholder="Repeticiones" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="estimatedDuration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duración Estimada (minutos)</FormLabel>
              <FormControl>
                <Input type="number" min="1" placeholder="Minutos" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el estado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={AssignmentStatus.PENDING}>Pendiente</SelectItem>
                  <SelectItem value={AssignmentStatus.IN_PROGRESS}>En progreso</SelectItem>
                  <SelectItem value={AssignmentStatus.COMPLETED}>Completado</SelectItem>
                  <SelectItem value={AssignmentStatus.CANCELLED}>Cancelado</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : initialData ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
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
import { FrequencyUnit, type Assignment, type CreateAssignmentRequest } from "@/types/assignment"

const assignmentSchema = z.object({
  therapistId: z.coerce.number().min(1, "Debe seleccionar un terapeuta"),
  childId: z.coerce.number().min(1, "Debe seleccionar un niño"),
  activityId: z.coerce.number().min(1, "Debe seleccionar una actividad"),
  startDate: z.string().min(1, "Fecha de inicio requerida"),
  endDate: z.string().min(1, "Fecha de fin requerida"),
  frequencyUnit: z.nativeEnum(FrequencyUnit),
  frequencyCount: z.coerce.number().min(1, "Debe ser al menos 1"),
  repetitions: z.coerce.number().min(1, "Debe ser al menos 1"),
  estimatedDuration: z.coerce.number().min(1, "Debe ser al menos 1 minuto"),
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
  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      therapistId: initialData?.therapistId ?? 0,
      childId: initialData?.childId ?? 0,
      activityId: initialData?.activityId ?? 0,
      startDate: initialData?.startDate?.split('T')[0] ?? "",
      endDate: initialData?.endDate?.split('T')[0] ?? "",
      frequencyUnit: initialData?.frequencyUnit ?? FrequencyUnit.DAY,
      frequencyCount: initialData?.frequencyCount ?? 1,
      repetitions: initialData?.repetitions ?? 1,
      estimatedDuration: initialData?.estimatedDuration ?? 30,
    },
  })

  const handleSubmit = async (data: AssignmentFormValues) => {
    await onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="therapistId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID del Terapeuta</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="ID del terapeuta" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="childId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID del Niño</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="ID del niño" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="activityId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID de la Actividad</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="ID de la actividad" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
                <FormDescription className="text-xs">
                  Veces por período
                </FormDescription>
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
            <FormItem className="h-full flex flex-col justify-between">
              <FormLabel>Duración Estimada (minutos)</FormLabel>
              <FormControl>
                <Input type="number" min="1" placeholder="Minutos" {...field} />
              </FormControl>
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

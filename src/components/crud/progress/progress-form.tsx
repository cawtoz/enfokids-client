"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import type { Progress, CreateProgressRequest } from "@/types/progress"

const progressSchema = z.object({
  assignmentId: z.coerce.number().min(1, "Debe seleccionar una asignación"),
  notes: z.string().min(3, "Las notas deben tener al menos 3 caracteres"),
  date: z.string().min(1, "Fecha requerida"),
  completed: z.boolean(),
})

type ProgressFormValues = z.infer<typeof progressSchema>

export interface ProgressFormProps {
  initialData?: Progress
  onSubmit: (data: CreateProgressRequest) => Promise<void>
  isSubmitting?: boolean
}

export function ProgressForm({
  initialData,
  onSubmit,
  isSubmitting = false,
}: ProgressFormProps) {
  const form = useForm<ProgressFormValues>({
    resolver: zodResolver(progressSchema),
    defaultValues: {
      assignmentId: initialData?.assignmentId ?? 0,
      notes: initialData?.notes ?? "",
      date: initialData?.date?.split('T')[0] ?? "",
      completed: initialData?.completed ?? false,
    },
  })

  const handleSubmit = async (data: ProgressFormValues) => {
    await onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="assignmentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID de Asignación</FormLabel>
              <FormControl>
                <Input type="number" placeholder="ID de la asignación" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Notas del progreso..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="completed"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Completado
                </FormLabel>
              </div>
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

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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ActivityType, type Activity, type CreateActivityRequest } from "@/types/activity"

const activitySchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  type: z.nativeEnum(ActivityType),
  imageUrl: z.url("Debe ser una URL válida").optional().or(z.literal("")),
  resourceUrl: z.url("Debe ser una URL válida").optional().or(z.literal("")),
})

type ActivityFormValues = z.infer<typeof activitySchema>

export interface ActivityFormProps {
  initialData?: Activity
  onSubmit: (data: CreateActivityRequest) => Promise<void>
  isSubmitting?: boolean
}

export function ActivityForm({
  initialData,
  onSubmit,
  isSubmitting = false,
}: ActivityFormProps) {
  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      type: initialData?.type ?? ActivityType.DIGITAL,
      imageUrl: initialData?.imageUrl ?? "",
      resourceUrl: initialData?.resourceUrl ?? "",
    },
  })

  const handleSubmit = async (data: ActivityFormValues) => {
    const submitData: CreateActivityRequest = {
      title: data.title,
      description: data.description,
      type: data.type as ActivityType,
      imageUrl: data.imageUrl || undefined,
      resourceUrl: data.resourceUrl || undefined,
    }
    
    await onSubmit(submitData)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Título de la actividad" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe la actividad..."
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
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={ActivityType.DIGITAL}>Digital</SelectItem>
                  <SelectItem value={ActivityType.NON_DIGITAL}>No Digital</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL de Imagen (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="https://ejemplo.com/imagen.jpg" {...field} />
              </FormControl>
              <FormDescription>
                URL de la imagen de la actividad
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="resourceUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL de Recurso (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="https://ejemplo.com/recurso" {...field} />
              </FormControl>
              <FormDescription>
                URL del recurso relacionado con la actividad
              </FormDescription>
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

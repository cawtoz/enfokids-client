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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { Child, CreateChildRequest, Therapist } from "@/types/user"

const apiClient = axios.create({ baseURL: "/api", headers: { "Content-Type": "application/json" } })

const childSchema = z.object({
  username: z.string().min(3, "El usuario debe tener al menos 3 caracteres"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  email: z.string().email("Email inválido"),
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  therapistId: z.coerce.number().min(1, "Debe seleccionar un terapeuta"),
  diagnosis: z.string().min(3, "El diagnóstico debe tener al menos 3 caracteres"),
})

type ChildFormValues = z.infer<typeof childSchema>

export interface ChildFormProps {
  initialData?: Child
  onSubmit: (data: CreateChildRequest) => Promise<void>
  isSubmitting?: boolean
}

export function ChildForm({
  initialData,
  onSubmit,
  isSubmitting = false,
}: ChildFormProps) {
  const [therapists, setTherapists] = React.useState<Therapist[]>([])

  React.useEffect(() => {
    apiClient.get<Therapist[]>("therapists").then((r) => setTherapists(r.data)).catch(() => {})
  }, [])

  const form = useForm<ChildFormValues>({
    resolver: zodResolver(childSchema) as any,
    defaultValues: {
      username: initialData?.username ?? "",
      password: "",
      email: initialData?.email ?? "",
      firstName: initialData?.firstName ?? "",
      lastName: initialData?.lastName ?? "",
      therapistId: initialData?.therapist?.id ?? 0,
      diagnosis: initialData?.diagnosis ?? "",
    },
  })

  const handleSubmit = async (data: ChildFormValues) => {
    await onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Usuario</FormLabel>
                <FormControl>
                  <Input placeholder="nombre_usuario" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@ejemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido</FormLabel>
                <FormControl>
                  <Input placeholder="Apellido" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="therapistId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Terapeuta</FormLabel>
              <Select
                onValueChange={(val) => field.onChange(Number(val))}
                defaultValue={field.value ? String(field.value) : undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un terapeuta" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {therapists.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.firstName} {t.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="diagnosis"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Diagnóstico</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Diagnóstico del niño..."
                  className="resize-none"
                  {...field}
                />
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

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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { PlusCircle, Trash2, Pencil, Check } from "lucide-react"
import { FrequencyUnit } from "@/types/assignment"
import type {
  ActivityPlan,
  CreateActivityPlanWithActivitiesRequest,
  PlanActivityEntry,
} from "@/types/activity-plan"
import type { PlanDetail } from "@/types/plan-detail"
import type { Therapist } from "@/types/user"
import type { Activity } from "@/types/activity"
import { activityPlanService } from "@/components/crud/activity-plan/activity-plan-service"

const apiClient = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
})

const activityPlanSchema = z.object({
  therapistId: z.coerce.number().min(1, "Seleccione un terapeuta"),
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
})

type ActivityPlanFormValues = z.infer<typeof activityPlanSchema>

// For creation: no detailId; for edit: detailId is the PlanDetail.id
interface ActivityEntry extends PlanActivityEntry {
  activityTitle: string
  detailId?: number
}

const defaultNewActivity = {
  activityId: 0,
  frequencyUnit: FrequencyUnit.DAY,
  frequencyCount: 1,
  repetitions: 1,
  estimatedDuration: 30,
}

export interface ActivityPlanFormProps {
  initialData?: ActivityPlan
  onSubmit: (data: CreateActivityPlanWithActivitiesRequest) => Promise<void>
  isSubmitting?: boolean
}

export function ActivityPlanForm({
  initialData,
  onSubmit,
  isSubmitting = false,
}: ActivityPlanFormProps) {
  const isEditing = !!initialData

  const [therapists, setTherapists] = React.useState<Therapist[]>([])
  const [activities, setActivities] = React.useState<Activity[]>([])
  const [isLoadingOptions, setIsLoadingOptions] = React.useState(true)
  const [planActivities, setPlanActivities] = React.useState<ActivityEntry[]>([])
  const [newActivity, setNewActivity] = React.useState(defaultNewActivity)
  const [isActivityLoading, setIsActivityLoading] = React.useState(false)
  // detailIds to delete when the user clicks "Actualizar Plan"
  const [pendingRemovals, setPendingRemovals] = React.useState<number[]>([])
  // index of the entry currently being edited inline (-1 = none)
  const [editingIndex, setEditingIndex] = React.useState<number>(-1)

  React.useEffect(() => {
    async function loadOptions() {
      setIsLoadingOptions(true)
      try {
        const requests: Promise<any>[] = [
          apiClient.get<Therapist[]>("therapists"),
          apiClient.get<Activity[]>("activities"),
        ]
        if (isEditing && initialData.id) {
          requests.push(activityPlanService.getActivities(initialData.id))
        }

        const results = await Promise.all(requests)
        setTherapists(results[0].data)
        setActivities(results[1].data)

        if (isEditing && results[2]) {
          const details: PlanDetail[] = results[2]
          setPlanActivities(
            details.map((d) => ({
              detailId: d.id,
              activityId: d.activityId,
              activityTitle: d.activityTitle,
              frequencyUnit: d.frequencyUnit,
              frequencyCount: d.frequencyCount,
              repetitions: d.repetitions,
              estimatedDuration: d.estimatedDuration,
            }))
          )
        }
      } catch (err) {
        console.error("Error cargando opciones:", err)
      } finally {
        setIsLoadingOptions(false)
      }
    }
    loadOptions()
  }, [])

  const form = useForm<ActivityPlanFormValues>({
    resolver: zodResolver(activityPlanSchema) as any,
    defaultValues: {
      therapistId: initialData?.therapistId ?? 0,
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
    },
  })

  const handleAddActivity = async () => {
    // If editing an existing entry, save changes back instead of adding
    if (editingIndex >= 0) {
      const activity = activities.find((a) => a.id === newActivity.activityId)
      if (!activity) return
      setPlanActivities((prev) =>
        prev.map((entry, i) =>
          i === editingIndex
            ? { ...entry, ...newActivity, activityTitle: activity.title }
            : entry
        )
      )
      setEditingIndex(-1)
      setNewActivity(defaultNewActivity)
      return
    }

    const activity = activities.find((a) => a.id === newActivity.activityId)
    if (!activity) return

    if (isEditing && initialData.id) {
      // In edit mode: persist immediately
      setIsActivityLoading(true)
      try {
        const detail = await activityPlanService.addActivity(initialData.id, newActivity)
        setPlanActivities((prev) => [
          ...prev,
          {
            detailId: detail.id,
            activityId: detail.activityId,
            activityTitle: detail.activityTitle,
            frequencyUnit: detail.frequencyUnit,
            frequencyCount: detail.frequencyCount,
            repetitions: detail.repetitions,
            estimatedDuration: detail.estimatedDuration,
          },
        ])
      } catch (err) {
        console.error("Error agregando actividad:", err)
      } finally {
        setIsActivityLoading(false)
      }
    } else {
      // In create mode: accumulate locally
      setPlanActivities((prev) => [
        ...prev,
        { ...newActivity, activityTitle: activity.title },
      ])
    }

    setNewActivity(defaultNewActivity)
  }

  const handleStartEdit = (index: number) => {
    const entry = planActivities[index]
    setNewActivity({
      activityId: entry.activityId,
      frequencyUnit: entry.frequencyUnit,
      frequencyCount: entry.frequencyCount,
      repetitions: entry.repetitions,
      estimatedDuration: entry.estimatedDuration,
    })
    setEditingIndex(index)
  }

  const handleCancelEdit = () => {
    setEditingIndex(-1)
    setNewActivity(defaultNewActivity)
  }

  const handleRemoveActivity = (index: number) => {
    const entry = planActivities[index]
    if (isEditing && entry.detailId) {
      // Queue for deletion on submit
      setPendingRemovals((prev) => [...prev, entry.detailId!])
    }
    setPlanActivities((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (data: ActivityPlanFormValues) => {
    // Apply pending removals before saving
    if (isEditing && initialData.id && pendingRemovals.length > 0) {
      await Promise.all(
        pendingRemovals.map((detailId) =>
          activityPlanService.removeActivity(initialData.id, detailId)
        )
      )
      setPendingRemovals([])
    }

    await onSubmit({
      therapistId: data.therapistId,
      title: data.title,
      description: data.description,
      // In edit mode, activities are already managed via the API
      activities: isEditing
        ? undefined
        : planActivities.map(({ activityTitle: _t, detailId: _d, ...rest }) => rest),
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Title + Therapist */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Input placeholder="Título del plan" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="therapistId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Terapeuta</FormLabel>
                {isLoadingOptions ? (
                  <div className="flex items-center gap-2 h-9">
                    <Spinner className="h-4 w-4" />
                    <span className="text-sm text-muted-foreground">Cargando...</span>
                  </div>
                ) : (
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
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe el plan de actividades..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Activities section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Actividades del Plan</h3>
            <div className="flex items-center gap-2">
              {isActivityLoading && <Spinner className="h-3 w-3" />}
              {!isEditing && (
                <span className="text-xs text-muted-foreground">Opcional</span>
              )}
            </div>
          </div>

          {/* Activities list */}
          {isLoadingOptions ? (
            <div className="flex items-center gap-2 py-2">
              <Spinner className="h-4 w-4" />
              <span className="text-sm text-muted-foreground">Cargando actividades...</span>
            </div>
          ) : (
            <>
              {planActivities.length > 0 && (
                <div className="border rounded-md divide-y">
                  {planActivities.map((entry, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 text-sm flex-wrap">
                      <span className="flex-1 font-medium min-w-0 truncate">{entry.activityTitle}</span>
                      <Badge variant="outline">
                        {entry.frequencyCount}x/{entry.frequencyUnit.toLowerCase()}
                      </Badge>
                      <Badge variant="secondary">{entry.repetitions} rep.</Badge>
                      <Badge variant="outline">{entry.estimatedDuration} min</Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        disabled={isActivityLoading}
                        onClick={() => handleStartEdit(i)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0 text-destructive"
                        disabled={isActivityLoading}
                        onClick={() => handleRemoveActivity(i)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add / edit activity inline form */}
              <div className="border rounded-md p-3 space-y-3 bg-muted/30">
                <p className="text-xs text-muted-foreground font-medium">
                  {editingIndex >= 0 ? `Editando: ${planActivities[editingIndex]?.activityTitle}` : "Agregar actividad"}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Select
                    value={newActivity.activityId ? String(newActivity.activityId) : ""}
                    onValueChange={(val) =>
                      setNewActivity((prev) => ({ ...prev, activityId: Number(val) }))
                    }
                    disabled={isActivityLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una actividad" />
                    </SelectTrigger>
                    <SelectContent>
                      {activities.map((a) => (
                        <SelectItem key={a.id} value={String(a.id)}>
                          {a.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={newActivity.frequencyUnit}
                    onValueChange={(val) =>
                      setNewActivity((prev) => ({ ...prev, frequencyUnit: val as FrequencyUnit }))
                    }
                    disabled={isActivityLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={FrequencyUnit.DAY}>Por día</SelectItem>
                      <SelectItem value={FrequencyUnit.WEEK}>Por semana</SelectItem>
                      <SelectItem value={FrequencyUnit.MONTH}>Por mes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Frecuencia</label>
                    <Input
                      type="number"
                      min={1}
                      value={newActivity.frequencyCount}
                      disabled={isActivityLoading}
                      onChange={(e) =>
                        setNewActivity((prev) => ({ ...prev, frequencyCount: Number(e.target.value) }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Repeticiones</label>
                    <Input
                      type="number"
                      min={1}
                      value={newActivity.repetitions}
                      disabled={isActivityLoading}
                      onChange={(e) =>
                        setNewActivity((prev) => ({ ...prev, repetitions: Number(e.target.value) }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Duración (min)</label>
                    <Input
                      type="number"
                      min={1}
                      value={newActivity.estimatedDuration}
                      disabled={isActivityLoading}
                      onChange={(e) =>
                        setNewActivity((prev) => ({
                          ...prev,
                          estimatedDuration: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddActivity}
                  disabled={!newActivity.activityId || isActivityLoading}
                >
                  {isActivityLoading ? (
                    <Spinner className="mr-2 h-4 w-4" />
                  ) : editingIndex >= 0 ? (
                    <Check className="mr-2 h-4 w-4" />
                  ) : (
                    <PlusCircle className="mr-2 h-4 w-4" />
                  )}
                  {editingIndex >= 0 ? "Guardar cambios" : "Agregar al plan"}
                </Button>
                {editingIndex >= 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelEdit}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isSubmitting || isActivityLoading}>
            {isSubmitting ? "Guardando..." : isEditing ? "Actualizar Plan" : "Crear Plan"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

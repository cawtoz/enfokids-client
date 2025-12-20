"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { apiClient } from "@/lib/api/client"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
// Use simple layout inside modal instead of Card components to save space and simplify styling
import type { ActivityPlan, CreateActivityPlanRequest } from "@/types/activity-plan"
import type { Activity, CreateActivityRequest, ActivityType } from "@/types/activity"
import type { Therapist } from "@/types/user"
import type { PlanDetail } from "@/types/plan-detail"
import { FrequencyUnit } from "@/types/assignment"
import { Plus, Trash2, Activity as ActivityIcon, Edit } from "lucide-react"
import { ActivityForm } from "../activity/activity-form"

const activityPlanSchema = z.object({
  therapistId: z.coerce.number().min(1, "Debe seleccionar un terapeuta"),
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
})

const planDetailSchema = z.object({
  activityId: z.coerce.number().min(1, "Debe seleccionar una actividad"),
  frequencyUnit: z.nativeEnum(FrequencyUnit),
  frequencyCount: z.coerce.number().min(1, "Debe ser al menos 1"),
  repetitions: z.coerce.number().min(1, "Debe ser al menos 1"),
  estimatedDuration: z.coerce.number().min(1, "Debe ser al menos 1 minuto"),
})

type ActivityPlanFormValues = z.infer<typeof activityPlanSchema>
type PlanDetailFormValues = z.infer<typeof planDetailSchema>

export interface PlanActivity {
  activity: Activity
  frequencyUnit: FrequencyUnit
  frequencyCount: number
  repetitions: number
  estimatedDuration: number
}

export interface ActivityPlanFormProps {
  initialData?: ActivityPlan
  onSubmit: (data: CreateActivityPlanRequest, planActivities?: PlanActivity[]) => Promise<void>
  isSubmitting?: boolean
}

export function ActivityPlanForm({
  initialData,
  onSubmit,
  isSubmitting = false,
}: ActivityPlanFormProps) {
  const [activities, setActivities] = React.useState<Activity[]>([])
  const [therapists, setTherapists] = React.useState<Therapist[]>([])
  const [planActivities, setPlanActivities] = React.useState<PlanActivity[]>([])
    React.useEffect(() => {
      console.log('🟢 selectedActivityIds:', selectedActivityIds)
      console.log('🟢 currentConfigActivityId:', currentConfigActivityId)
      const currentConfig = planActivities.find(p => p.activity.id === currentConfigActivityId)
      console.log('🟢 currentConfig:', currentConfig)
    }, [planActivities])
  const [loadingActivities, setLoadingActivities] = React.useState(false)
  const [loadingTherapists, setLoadingTherapists] = React.useState(false)
  const [showAddActivity, setShowAddActivity] = React.useState(false)
  const [creatingActivity, setCreatingActivity] = React.useState(false)
  const [activitiesLoaded, setActivitiesLoaded] = React.useState(false)
  const [showCreateNewActivity, setShowCreateNewActivity] = React.useState(false)
  const [editingActivityIndex, setEditingActivityIndex] = React.useState<number | null>(null)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedActivityId, setSelectedActivityId] = React.useState<number | null>(null)
  const [selectedActivityIds, setSelectedActivityIds] = React.useState<number[]>([])
  const [currentConfigActivityId, setCurrentConfigActivityId] = React.useState<number | null>(null)
  const [configuringMode, setConfiguringMode] = React.useState(false)
  const [configurarTodasIgual, setConfigurarTodasIgual] = React.useState(false)

  const form = useForm<ActivityPlanFormValues>({
    resolver: zodResolver(activityPlanSchema) as zodResolver<ActivityPlanFormValues>,
    defaultValues: {
      therapistId: initialData?.therapistId ?? 0,
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
    },
  })

  const detailForm = useForm<PlanDetailFormValues>({
    resolver: zodResolver(planDetailSchema) as zodResolver<PlanDetailFormValues>,
    defaultValues: {
      activityId: 0,
      frequencyUnit: FrequencyUnit.DAY,
      frequencyCount: 1,
      repetitions: 1,
      estimatedDuration: 30,
    },
  })

  // Cargar terapeutas
  React.useEffect(() => {
    const fetchTherapists = async () => {
      try {
        setLoadingTherapists(true)
        console.log('🔄 Cargando terapeutas...')
        const response = await apiClient.get<Therapist[]>("/api/therapists")
        console.log('✅ Terapeutas cargados:', response.data)
        setTherapists(response.data)
      } catch (error) {
        console.error("❌ Error cargando terapeutas:", error)
      } finally {
        setLoadingTherapists(false)
      }
    }
    fetchTherapists()
  }, [])

  // Cargar actividades existentes cuando se abre el modal
  React.useEffect(() => {
    const fetchActivities = async () => {
      if (showAddActivity && !activitiesLoaded) {
        try {
          setLoadingActivities(true)
          console.log('🔄 Cargando actividades...')
          const response = await apiClient.get<Activity[]>("/api/activities")
          console.log('✅ Actividades cargadas:', response.data)
          setActivities(response.data)
          setActivitiesLoaded(true)
        } catch (error) {
          console.error("❌ Error cargando actividades:", error)
        } finally {
          setLoadingActivities(false)
        }
      }
    }
    fetchActivities()
  }, [showAddActivity, activitiesLoaded])

  // Cuando cambie la selección, precargar el formulario de detalle
  React.useEffect(() => {
    if (selectedActivityId !== null) {
      const sel = activities.find((a) => a.id === selectedActivityId)
      if (sel) {
        detailForm.reset({
          activityId: sel.id,
          frequencyUnit: FrequencyUnit.DAY,
          frequencyCount: 1,
          repetitions: 1,
          estimatedDuration: 30,
        })
      }
    }
  }, [selectedActivityId, activities])

  // Si cambia la lista de seleccionadas, asegurar que el panel de configuración apunte a una existente
  React.useEffect(() => {
    // Only set the current config target when actually in configuring mode.
    if (!configuringMode) {
      // if user is not configuring, ensure no current target is set
      setCurrentConfigActivityId(null)
      return
    }

    if (selectedActivityIds.length > 0) {
      if (!currentConfigActivityId || !selectedActivityIds.includes(currentConfigActivityId)) {
        const first = selectedActivityIds[0]
        setCurrentConfigActivityId(first)
        const sel = activities.find(a => a.id === first)
        if (sel) {
          detailForm.reset({
            activityId: sel.id,
            frequencyUnit: FrequencyUnit.DAY,
            frequencyCount: 1,
            repetitions: 1,
            estimatedDuration: 30,
          })
        }
      }
    } else {
      setCurrentConfigActivityId(null)
    }
  }, [selectedActivityIds, activities])

  // Cargar actividades del plan si estamos editando
  React.useEffect(() => {
    const fetchPlanActivities = async () => {
      if (initialData?.id) {
        try {
          console.log('🔄 Cargando actividades del plan:', initialData.id)
          const response = await apiClient.get<PlanDetail[]>(`/api/activity-plans/${initialData.id}/activities`)
          console.log('📦 PlanDetails recibidos:', response.data)
          
          // Cargar detalles completos de cada actividad
          const planActivitiesWithDetails: PlanActivity[] = []
          
          for (const detail of response.data) {
            try {
              const activityResponse = await apiClient.get<Activity>(`/api/activities/${detail.activityId}`)
              planActivitiesWithDetails.push({
                activity: activityResponse.data,
                frequencyUnit: detail.frequencyUnit as FrequencyUnit,
                frequencyCount: detail.frequencyCount,
                repetitions: detail.repetitions,
                estimatedDuration: detail.estimatedDuration,
              })
            } catch (error) {
              console.error(`Error cargando actividad ${detail.activityId}:`, error)
            }
          }
          
          console.log('✅ Actividades del plan cargadas:', planActivitiesWithDetails)
          setPlanActivities(planActivitiesWithDetails)
        } catch (error) {
          console.error("❌ Error cargando actividades del plan:", error)
        }
      }
    }
    fetchPlanActivities()
  }, [initialData])

  const handleAddActivityToPlan = async (data: PlanDetailFormValues) => {
    // Si estamos editando, actualizar en lugar de agregar
    if (editingActivityIndex !== null) {
      handleUpdateActivity(data)
      return
    }

    const selectedActivity = activities.find(a => a.id === data.activityId)
    if (!selectedActivity) return

    // Actualizar o agregar la configuración de la actividad en planActivities
    setPlanActivities(prev => {
      const idx = prev.findIndex(p => p.activity.id === data.activityId)
      const newPlanActivity: PlanActivity = {
        activity: selectedActivity,
        frequencyUnit: data.frequencyUnit,
        frequencyCount: data.frequencyCount,
        repetitions: data.repetitions,
        estimatedDuration: data.estimatedDuration,
      }
      if (idx >= 0) {
        // Actualizar existente
        const updated = [...prev]
        updated[idx] = newPlanActivity
        return updated
      } else {
        // Agregar nueva
        return [...prev, newPlanActivity]
      }
    })
    // Mantener el formulario y la selección actual
    // detailForm.reset({ ...data }) // Si quieres limpiar, descomenta
    // No limpiar selección ni reiniciar el formulario
  }

  // Funciones auxiliares para submit del detailForm con diferentes comportamientos
  const submitDetailKeepOpen = detailForm.handleSubmit(async (values) => {
    await handleAddActivityToPlan(values)
  })

  const submitDetailAndClose = detailForm.handleSubmit(async (values) => {
    await handleAddActivityToPlan(values)
    setShowAddActivity(false)
    setSelectedActivityId(null)
  })

  const handleCreateActivity = async (data: CreateActivityRequest) => {
    try {
      setCreatingActivity(true)
      console.log('📝 Creando nueva actividad temporalmente...')
      
      // Crear un objeto Activity temporal con un ID temporal
      const tempActivity: Activity = {
        id: Date.now(), // ID temporal único
        title: data.title,
        description: data.description,
        type: data.type,
        imageUrl: data.imageUrl,
        resourceUrl: data.resourceUrl,
      }
      
      console.log('✅ Actividad temporal creada:', tempActivity)
      setActivities([...activities, tempActivity])
      setActivitiesLoaded(true)
      setSelectedActivityIds((prev) => [...prev, tempActivity.id])
      setShowCreateNewActivity(false)
      setShowAddActivity(true) // Volver al modal de agregar (lista)
      setConfiguringMode(false)
    } catch (error) {
      console.error("Error creando actividad temporal:", error)
    } finally {
      setCreatingActivity(false)
    }
  }

  const handleRemoveActivity = (index: number) => {
    setPlanActivities(planActivities.filter((_, i) => i !== index))
  }

  const handleEditActivity = (index: number) => {
    const activity = planActivities[index]
    // Cargar datos en el formulario de detalles
    detailForm.reset({
      activityId: activity.activity.id,
      frequencyUnit: activity.frequencyUnit,
      frequencyCount: activity.frequencyCount,
      repetitions: activity.repetitions,
      estimatedDuration: activity.estimatedDuration,
    })
    setEditingActivityIndex(index)
    setShowAddActivity(true)
  }

  const handleUpdateActivity = (data: PlanDetailFormValues) => {
    if (editingActivityIndex === null) return
    
    const selectedActivity = activities.find(a => a.id === data.activityId) || planActivities[editingActivityIndex].activity
    
    const updatedPlanActivity: PlanActivity = {
      activity: selectedActivity,
      frequencyUnit: data.frequencyUnit,
      frequencyCount: data.frequencyCount,
      repetitions: data.repetitions,
      estimatedDuration: data.estimatedDuration,
    }

    const newPlanActivities = [...planActivities]
    newPlanActivities[editingActivityIndex] = updatedPlanActivity
    setPlanActivities(newPlanActivities)
    
    setShowAddActivity(false)
    setEditingActivityIndex(null)
    detailForm.reset()
  }

  const handleSubmit = async (data: ActivityPlanFormValues) => {
    try {
      // Pasar los datos del plan y las actividades al callback
      await onSubmit(data, planActivities)
      
      // Limpiar las actividades después de guardar exitosamente
      setPlanActivities([])
    } catch (error) {
      console.error("Error al guardar el plan:", error)
      throw error
    }
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Información del Plan */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Información del Plan</h3>
            </div>
            
                <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 items-end">
                  <FormField
                    control={form.control}
                    name="therapistId"
                    render={({ field }) => (
                      <FormItem className="min-w-[220px]">
                        <FormLabel>Terapeuta</FormLabel>
                        <Select onValueChange={(v) => field.onChange(parseInt(v))} defaultValue={String(field.value)}>
                          <FormControl>
                            <SelectTrigger className="w-full min-w-[220px]">
                              <SelectValue placeholder="Selecciona un terapeuta" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0" disabled>Selecciona un terapeuta</SelectItem>
                            {loadingTherapists ? (
                              <SelectItem value="-1" disabled>Cargando...</SelectItem>
                            ) : (
                              therapists.map((t) => (
                                <SelectItem key={t.id} value={t.id.toString()}>{t.firstName} {t.lastName}</SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
            <div className="mt-6">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="mt-8 flex items-center justify-between">
              <h4 className="text-lg font-semibold">Actividades</h4>
              <Button type="button" onClick={() => {
                setShowAddActivity(true);
                setConfiguringMode(false);
                setEditingActivityIndex(null);
              }}>
                <Plus className="mr-2 h-4 w-4" />Agregar Actividad
              </Button>
            </div>
            {planActivities.length === 0 && (
              <div className="w-full flex justify-center items-center py-8">
                <span className="text-muted-foreground text-base">No hay actividades. Agrega una.</span>
              </div>
            )}
          </div>

          {/* Lista de actividades añadidas al plan */}
          {planActivities.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Actividades añadidas</h4>
              {planActivities.map((pa, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex-1 pr-4">
                    <div className="font-medium">{pa.activity.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {pa.frequencyCount} x {pa.frequencyUnit} · {pa.repetitions} rep · {pa.estimatedDuration} min
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEditActivity(index)} title="Editar">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveActivity(index)} title="Eliminar actividad">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : initialData ? "Actualizar Plan" : "Crear Plan"}
            </Button>
          </div>
        </form>
      </Form>

      <Dialog open={showAddActivity} onOpenChange={setShowAddActivity}>
        <DialogContent className="w-[99vw] sm:w-[96vw] md:w-[90vw] lg:w-[70vw] xl:w-[60vw] max-w-5xl max-h-[90vh] overflow-hidden">
          <div className="px-4 py-4 flex flex-col gap-2">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">{editingActivityIndex !== null ? "Editar Actividad del Plan" : "Agregar Actividad al Plan"}</DialogTitle>
            </DialogHeader>
            <div className="h-[45vh]">
              {(!configuringMode && editingActivityIndex === null) ? (
                <div className="h-full flex flex-col gap-1">
                  <div className="flex items-center justify-end mb-1 gap-2">
                    <Button size="sm" variant="outline" onClick={() => setShowCreateNewActivity((s) => !s)}>
                      {showCreateNewActivity ? 'Lista' : 'Crear'}
                    </Button>
                    {!showCreateNewActivity && selectedActivityIds.length > 0 && !configuringMode && (
                      <Button size="sm" variant="default" onClick={() => {
                        setCurrentConfigActivityId(selectedActivityIds[0]);
                        setConfiguringMode(true);
                      }}>
                        Configurar
                      </Button>
                    )}
                  </div>
                  <div className="overflow-y-auto p-1 space-y-1 flex-1 rounded bg-background">
                    {!showCreateNewActivity && (
                      <Input placeholder="Buscar actividad..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} size="sm" />
                    )}
                    {showCreateNewActivity ? (
                      <div>
                        <ActivityForm onSubmit={handleCreateActivity} isSubmitting={creatingActivity} />
                      </div>
                    ) : activities.length === 0 ? (
                      <div className="text-xs text-muted-foreground text-center py-4">No hay actividades.</div>
                    ) : (
                      activities
                        .filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map(activity => {
                          const selected = selectedActivityIds.includes(activity.id)
                          const isTemp = typeof activity.id === 'number' && activity.id > 1000000000000; // id generado por Date.now
                          return (
                            <div key={activity.id} className={`flex items-start justify-between p-2 rounded ${selected ? 'bg-primary/5' : ''}`}>
                              <div className="flex-1 pr-2">
                                <div className="flex items-center gap-2">
                                  <input type="checkbox" checked={selected} onChange={() => {
                                    if (selected) setSelectedActivityIds(prev => prev.filter(id => id !== activity.id))
                                    else setSelectedActivityIds(prev => [...prev, activity.id])
                                  }} className="mr-2" />
                                  <span className="font-medium truncate text-sm">{activity.title}</span>
                                  <Badge variant={activity.type === 'DIGITAL' ? 'default' : 'secondary'} className="text-xs ml-2">{activity.type === 'DIGITAL' ? 'Digital' : 'No Digital'}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2">{activity.description}</p>
                              </div>
                              <span className="text-xs text-muted-foreground">{isTemp ? <Badge variant="outline">Nueva</Badge> : <>ID {activity.id}</>}</span>
                            </div>
                          )
                        })
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col gap-1">
                  <div className="mb-1 flex items-center justify-between">
                    {configuringMode && <Button variant="ghost" size="sm" onClick={() => setConfiguringMode(false)}>← Volver a seleccionar</Button>}
                    <span className="text-xs text-muted-foreground">Configurando {selectedActivityIds.length} actividad(es)</span>
                  </div>
                  {selectedActivityIds.length > 1 && (
                    <div className="flex items-center gap-2 mb-2">
                      <label className="text-xs font-medium">Configurar todas igual</label>
                      <Switch checked={configurarTodasIgual} onCheckedChange={setConfigurarTodasIgual} />
                    </div>
                  )}
                  <div className="space-y-1 flex-1 overflow-y-auto p-1 rounded bg-background">
                    <Form {...detailForm}>
                      <form onSubmit={detailForm.handleSubmit(async (d: any) => {
                        await handleAddActivityToPlan(d as PlanDetailFormValues)
                        if (selectedActivityIds.includes(d.activityId)) {
                          const remaining = selectedActivityIds.filter(id => id !== d.activityId)
                          setSelectedActivityIds(remaining)
                          setCurrentConfigActivityId(remaining[0] ?? null)
                        }
                      })} className="space-y-1">
                        <div>
                          {!configurarTodasIgual && (
                            <>
                              <label className="text-xs">Actividad</label>
                              <FormField
                                control={detailForm.control as any}
                                name="activityId"
                                render={({ field }) => (
                                  <FormItem>
                                    {/* Solo la label del componente shadcn/ui */}
                                    <Select
                                      value={String(currentConfigActivityId ?? selectedActivityIds[0] ?? field.value)}
                                      onValueChange={(value) => {
                                        const id = parseInt(value)
                                        setCurrentConfigActivityId(id)
                                        field.onChange(id)
                                        // Buscar si ya existe configuración previa para esta actividad
                                        const existing = planActivities.find(p => p.activity.id === id)
                                        if (existing) {
                                          detailForm.reset({
                                            activityId: existing.activity.id,
                                            frequencyUnit: existing.frequencyUnit,
                                            frequencyCount: existing.frequencyCount,
                                            repetitions: existing.repetitions,
                                            estimatedDuration: existing.estimatedDuration,
                                          })
                                        } else {
                                          const sel = activities.find(a => a.id === id)
                                          if (sel) {
                                            detailForm.reset({ activityId: sel.id, frequencyUnit: FrequencyUnit.DAY, frequencyCount: 1, repetitions: 1, estimatedDuration: 30 })
                                          }
                                        }
                                      }}
                                    >
                                      <FormControl>
                                        <SelectTrigger className="text-xs w-full">
                                          <SelectValue placeholder="Selecciona una actividad" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {selectedActivityIds.map(id => {
                                          const a = activities.find(x => x.id === id)
                                          const isTemp = typeof id === 'number' && id > 1000000000000;
                                          return (
                                            <SelectItem key={id} value={String(id)}>
                                              {a ? a.title : <>ID {id}</>}
                                              {isTemp && <Badge variant="outline" className="ml-1">Nueva</Badge>}
                                            </SelectItem>
                                          );
                                        })}
                                        {selectedActivityIds.length === 0 && (
                                          <SelectItem value={String(field.value)}>Selecciona una actividad</SelectItem>
                                        )}
                                      </SelectContent>
                                    </Select>
                                  </FormItem>
                                )}
                              />
                            </>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
                          <FormField control={detailForm.control as any} name="frequencyUnit" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Unidad</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="text-xs">
                                    <SelectValue placeholder="Unidad" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value={FrequencyUnit.DAY}>Diaria</SelectItem>
                                  <SelectItem value={FrequencyUnit.WEEK}>Semanal</SelectItem>
                                  <SelectItem value={FrequencyUnit.MONTH}>Mensual</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )} />
                          <FormField control={detailForm.control as any} name="frequencyCount" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Frecuencia</FormLabel>
                              <FormControl>
                                <Input type="number" min={1} {...field} size="sm" className="text-xs" />
                              </FormControl>
                            </FormItem>
                          )} />
                          <FormField control={detailForm.control as any} name="repetitions" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Repeticiones</FormLabel>
                              <FormControl>
                                <Input type="number" min={1} {...field} size="sm" className="text-xs" />
                              </FormControl>
                            </FormItem>
                          )} />
                        </div>
                        <FormField control={detailForm.control as any} name="estimatedDuration" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Duración (min)</FormLabel>
                            <FormControl>
                              <Input type="number" min={1} {...field} size="sm" className="text-xs" />
                            </FormControl>
                          </FormItem>
                        )} />
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => { setCurrentConfigActivityId(null); detailForm.reset(); }}>Cancelar</Button>
                          <Button type="submit" size="sm">Agregar al Plan</Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

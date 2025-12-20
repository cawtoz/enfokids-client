"use client"

import * as React from "react"
import { apiClient } from "@/lib/api/client"
import { ActivityPlanForm, type PlanActivity } from "./activity-plan-form"
import type { ActivityPlan, CreateActivityPlanRequest } from "@/types/activity-plan"
import type { PlanDetail } from "@/types/plan-detail"

interface ActivityPlanManagerProps {
  initialData?: ActivityPlan
  onSuccess?: () => void
  onClose?: () => void
}

export function ActivityPlanManager({ initialData, onSuccess, onClose }: ActivityPlanManagerProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (data: CreateActivityPlanRequest, planActivities?: PlanActivity[]) => {
    try {
      setIsSubmitting(true)
      console.log('📝 Iniciando creación del plan:', data)
      console.log('🎯 Actividades a procesar:', planActivities)

      // 1. Crear las actividades temporales primero (las que tienen ID > 1000000000000)
      const activityIdMap = new Map<number, number>() // tempId -> realId
      
      if (planActivities && planActivities.length > 0) {
        for (const pa of planActivities) {
          // Si el ID es temporal (timestamp de Date.now())
          if (pa.activity.id > 1000000000000) {
            console.log('🔄 Creando actividad temporal:', pa.activity.title)
            const activityResponse = await apiClient.post("/api/activities", {
              title: pa.activity.title,
              description: pa.activity.description,
              type: pa.activity.type,
              imageUrl: pa.activity.imageUrl,
              resourceUrl: pa.activity.resourceUrl,
            })
            activityIdMap.set(pa.activity.id, activityResponse.data.id)
            console.log(`✅ Actividad "${pa.activity.title}" creada con ID ${activityResponse.data.id}`)
          } else {
            // La actividad ya existe en BD, usar su ID
            activityIdMap.set(pa.activity.id, pa.activity.id)
          }
        }
      }

      if (initialData?.id) {
        // Actualizar plan existente
        console.log('🔄 Actualizando plan existente:', initialData.id)
        await apiClient.put(`/api/activity-plans/${initialData.id}`, data)
        
        // Si hay actividades, agregarlas (usando IDs reales)
        if (planActivities && planActivities.length > 0) {
          const planDetails = planActivities.map(pa => ({
            planId: initialData.id,
            activityId: activityIdMap.get(pa.activity.id) || pa.activity.id,
            frequencyUnit: pa.frequencyUnit,
            frequencyCount: pa.frequencyCount,
            repetitions: pa.repetitions,
            estimatedDuration: pa.estimatedDuration,
          }))
          
          console.log('🔄 Asignando actividades al plan existente')
          console.log('📦 Payload enviado:', JSON.stringify(planDetails, null, 2))
          await apiClient.post(`/api/activity-plans/${initialData.id}/activities/batch`, planDetails)
          console.log('✅ Actividades asignadas correctamente')
        }
      } else {
        // Crear nuevo plan
        console.log('🔄 Creando nuevo plan')
        const response = await apiClient.post<ActivityPlan>("/api/activity-plans", data)
        const newPlanId = response.data.id
        console.log('✅ Plan creado con ID:', newPlanId)

        // Si hay actividades, agregarlas (usando IDs reales)
        if (planActivities && planActivities.length > 0) {
          const planDetails = planActivities.map(pa => ({
            planId: newPlanId,
            activityId: activityIdMap.get(pa.activity.id) || pa.activity.id,
            frequencyUnit: pa.frequencyUnit,
            frequencyCount: pa.frequencyCount,
            repetitions: pa.repetitions,
            estimatedDuration: pa.estimatedDuration,
          }))
          
          console.log('🔄 Asignando actividades al nuevo plan')
          console.log('📦 Payload enviado:', JSON.stringify(planDetails, null, 2))
          await apiClient.post(`/api/activity-plans/${newPlanId}/activities/batch`, planDetails)
          console.log('✅ Actividades asignadas correctamente')
        }
      }

      console.log('🎉 Plan y actividades creados exitosamente')
      onSuccess?.()
      onClose?.()
    } catch (error) {
      console.error("❌ Error al guardar el plan:", error)
      alert("Ocurrió un error al guardar el plan")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ActivityPlanForm
      initialData={initialData}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  )
}

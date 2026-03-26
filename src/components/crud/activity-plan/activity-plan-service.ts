import axios from "axios"
import type { CRUDService } from "@/lib/generic-crud-service"
import type {
  ActivityPlan,
  CreateActivityPlanRequest,
  CreateActivityPlanWithActivitiesRequest,
  UpdateActivityPlanRequest,
} from "@/types/activity-plan"
import type { PlanDetail, CreatePlanDetailRequest } from "@/types/plan-detail"

const client = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
})

export class ActivityPlanService
  implements CRUDService<ActivityPlan, CreateActivityPlanWithActivitiesRequest>
{
  async getAll(): Promise<ActivityPlan[]> {
    const res = await client.get<ActivityPlan[]>("activity-plans")
    return res.data
  }

  async getById(id: number | string): Promise<ActivityPlan> {
    const res = await client.get<ActivityPlan>(`activity-plans/${id}`)
    return res.data
  }

  async getActivities(planId: number | string): Promise<PlanDetail[]> {
    const res = await client.get<PlanDetail[]>(`activity-plans/${planId}/activities`)
    return res.data
  }

  async addActivity(planId: number | string, data: Omit<CreatePlanDetailRequest, "planId">): Promise<PlanDetail> {
    const res = await client.post<PlanDetail>(`activity-plans/${planId}/activities`, {
      ...data,
      planId: Number(planId),
    })
    return res.data
  }

  async removeActivity(planId: number | string, detailId: number | string): Promise<void> {
    await client.delete(`activity-plans/${planId}/activities/${detailId}`)
  }

  async create(data: CreateActivityPlanWithActivitiesRequest): Promise<ActivityPlan> {
    const { activities, ...planData } = data
    const res = await client.post<ActivityPlan>("activity-plans", planData as CreateActivityPlanRequest)
    const plan = res.data

    if (activities && activities.length > 0) {
      await client.post(
        `activity-plans/${plan.id}/activities/batch`,
        activities.map((a) => ({ ...a, planId: plan.id }))
      )
    }

    return plan
  }

  async update(id: number | string, data: CreateActivityPlanWithActivitiesRequest): Promise<ActivityPlan> {
    const { activities: _activities, ...planData } = data
    const res = await client.put<ActivityPlan>(`activity-plans/${id}`, planData as UpdateActivityPlanRequest)
    return res.data
  }

  async delete(id: number | string): Promise<void> {
    await client.delete(`activity-plans/${id}`)
  }
}

export const activityPlanService = new ActivityPlanService()

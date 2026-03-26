import type { FrequencyUnit } from './assignment'

export interface ActivityPlan {
  id: number;
  therapistId: number;
  therapistName: string;
  title: string;
  description: string;
}

export interface CreateActivityPlanRequest {
  therapistId: number;
  title: string;
  description: string;
}

export interface UpdateActivityPlanRequest {
  therapistId?: number;
  title?: string;
  description?: string;
}

export interface PlanActivityEntry {
  activityId: number;
  frequencyUnit: FrequencyUnit;
  frequencyCount: number;
  repetitions: number;
  estimatedDuration: number;
}

export interface CreateActivityPlanWithActivitiesRequest extends CreateActivityPlanRequest {
  activities?: PlanActivityEntry[];
}

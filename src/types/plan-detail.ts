import { FrequencyUnit } from './assignment';

export interface PlanDetail {
  id: number;
  planId: number;
  planTitle: string;
  activityId: number;
  activityTitle: string;
  frequencyUnit: FrequencyUnit;
  frequencyCount: number;
  repetitions: number;
  estimatedDuration: number;
}

export interface CreatePlanDetailRequest {
  planId: number;
  activityId: number;
  frequencyUnit: FrequencyUnit;
  frequencyCount: number;
  repetitions: number;
  estimatedDuration: number;
}

export interface UpdatePlanDetailRequest {
  planId?: number;
  activityId?: number;
  frequencyUnit?: FrequencyUnit;
  frequencyCount?: number;
  repetitions?: number;
  estimatedDuration?: number;
}

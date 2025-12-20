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

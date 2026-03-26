export enum AssignmentStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export enum FrequencyUnit {
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH'
}

export interface Assignment {
  id: number;
  therapistId: number;
  therapistName: string;
  childId: number;
  childName: string;
  activityId: number;
  activityTitle: string;
  startDate: string;
  endDate: string;
  frequencyUnit: FrequencyUnit;
  frequencyCount: number;
  repetitions: number;
  estimatedDuration: number;
  status: AssignmentStatus;
}

export interface CreateAssignmentRequest {
  therapistId: number;
  childId: number;
  activityId: number;
  startDate: string;
  endDate: string;
  frequencyUnit: FrequencyUnit;
  frequencyCount: number;
  repetitions: number;
  estimatedDuration: number;
  status: AssignmentStatus;
}

export interface UpdateAssignmentRequest {
  therapistId?: number;
  childId?: number;
  activityId?: number;
  startDate?: string;
  endDate?: string;
  frequencyUnit?: FrequencyUnit;
  frequencyCount?: number;
  repetitions?: number;
  estimatedDuration?: number;
  status?: AssignmentStatus;
}

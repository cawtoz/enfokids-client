export interface Progress {
  id: number;
  assignmentId: number;
  notes: string;
  date: string;
  completed: boolean;
}

export interface CreateProgressRequest {
  assignmentId: number;
  notes: string;
  date: string;
  completed: boolean;
}

export interface UpdateProgressRequest {
  assignmentId?: number;
  notes?: string;
  date?: string;
  completed?: boolean;
}

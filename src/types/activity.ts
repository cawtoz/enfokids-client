export enum ActivityType {
  DIGITAL = 'DIGITAL',
  NON_DIGITAL = 'NON_DIGITAL'
}

export interface Activity {
  id: number;
  title: string;
  description: string;
  type: ActivityType;
  imageUrl?: string;
  resourceUrl?: string;
}

export interface CreateActivityRequest {
  title: string;
  description: string;
  type: ActivityType;
  imageUrl?: string;
  resourceUrl?: string;
}

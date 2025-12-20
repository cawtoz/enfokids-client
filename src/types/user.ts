export enum Role {
  ADMIN = 'ADMIN',
  THERAPIST = 'THERAPIST',
  CAREGIVER = 'CAREGIVER',
  CHILD = 'CHILD'
}

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: Role[];
}

export interface Therapist extends User {
  speciality: string;
}

export interface Child extends User {
  therapist?: Therapist;
  diagnosis: string;
}

export interface Caregiver extends User {
  // Caregiver no tiene campos adicionales por ahora
}

export interface CreateTherapistRequest {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  speciality: string;
}

export interface UpdateTherapistRequest {
  username?: string;
  password?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  speciality?: string;
}

export interface CreateChildRequest {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  therapistId: number;
  diagnosis: string;
}

export interface UpdateChildRequest {
  username?: string;
  password?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  therapistId?: number;
  diagnosis?: string;
}

export interface CreateCaregiverRequest {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface UpdateCaregiverRequest {
  username?: string;
  password?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

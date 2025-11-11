import axios from 'axios';
import apiClient from './client';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    email: string;
    roles: Array<{ name: string }>;
}

export interface UserResponse {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
}

const authClient = axios.create({
  baseURL: '',
  timeout: 10000,
});

authClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Error en la petición';
    return Promise.reject(new Error(message));
  }
);

export const authApi = {
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        const response = await authClient.post<LoginResponse>('/auth/login', credentials);
        return response.data;
    },

    async me(): Promise<UserResponse> {
        const response = await apiClient.get<UserResponse>('/api/auth/me');
        return response.data;
    },

    async logout(): Promise<void> {
        await authClient.post('/auth/logout');
    },
};

export default authApi;

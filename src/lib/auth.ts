import { authApi, type UserResponse } from './api/authApi';

export type User = UserResponse;

export async function getCurrentUser(): Promise<User | null> {
    try {
        const user = await authApi.me();
        return user;
    } catch (error: any) {
        console.error('Error fetching current user:', error.message);
        return null;
    }
}

export function isAdmin(user: User | null): boolean {
    return user?.roles?.includes('ADMIN') ?? false;
}

export function hasRole(user: User | null, roleName: string): boolean {
    return user?.roles?.includes(roleName) ?? false;
}

export async function isAuthenticated(): Promise<boolean> {
    const user = await getCurrentUser();
    return user !== null;
}

export async function logout(): Promise<void> {
    try {
        await authApi.logout();
    } catch (error) {
        console.error('Error during logout:', error);
    } finally {
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
    }
}

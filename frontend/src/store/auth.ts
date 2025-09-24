import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface AuthState {
	user: User | null;
	token: string | null;
	refreshToken: string | null;
	isAuthenticated: boolean;
	login: (token: string, refreshToken: string, user: User) => void;
	logout: () => void;
	updateToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			user: null,
			token: null,
			refreshToken: null,
			isAuthenticated: false,
			login: (token: string, refreshToken: string, user: User) =>
				set({ token, refreshToken, user, isAuthenticated: true }),
			logout: () => set({ token: null, refreshToken: null, user: null, isAuthenticated: false }),
			updateToken: (token: string) => set({ token }),
		}),
		{
			name: 'pos-auth',
		},
	),
);

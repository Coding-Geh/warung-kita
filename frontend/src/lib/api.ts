import { useAuthStore } from '../store/auth';

export const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: any) => void; reject: (error: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
	failedQueue.forEach(({ resolve, reject }) => {
		if (error) {
			reject(error);
		} else {
			resolve(token);
		}
	});
	
	failedQueue = [];
};

async function refreshToken(): Promise<string> {
	const state = useAuthStore.getState();
	if (!state.refreshToken) {
		throw new Error('No refresh token available');
	}

	try {
		const response = await fetch(`${API_BASE}/auth/refresh`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ refreshToken: state.refreshToken }),
		});

		if (!response.ok) {
			throw new Error('Failed to refresh token');
		}

		const data = await response.json();
		const newToken = data.data?.accessToken || data.accessToken;
		
		if (newToken) {
			useAuthStore.getState().updateToken(newToken);
			return newToken;
		}
		
		throw new Error('No access token in response');
	} catch (error) {
		// Refresh failed, logout user
		useAuthStore.getState().logout();
		throw error;
	}
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
	const state = useAuthStore.getState();
	const headers: HeadersInit = {
		'Content-Type': 'application/json',
		...(options.headers || {}),
	};
	
	if (state.token) {
		headers['Authorization'] = `Bearer ${state.token}`;
	}

	const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
	
	// Handle 401 Unauthorized
	if (res.status === 401 && state.refreshToken && path !== '/auth/refresh') {
		if (isRefreshing) {
			// If already refreshing, queue this request
			return new Promise((resolve, reject) => {
				failedQueue.push({ resolve, reject });
			}).then(() => {
				// Retry the original request
				return request<T>(path, options);
			});
		}

		isRefreshing = true;

		try {
			const newToken = await refreshToken();
			processQueue(null, newToken);
			
			// Retry the original request with new token
			const newHeaders = { ...headers, Authorization: `Bearer ${newToken}` };
			const retryRes = await fetch(`${API_BASE}${path}`, { ...options, headers: newHeaders });
			
			if (!retryRes.ok) {
				throw new Error(`Request failed: ${retryRes.statusText}`);
			}
			
			const retryPayload = await retryRes.json();
			return (retryPayload?.data ?? retryPayload) as T;
		} catch (error) {
			processQueue(error, null);
			throw error;
		} finally {
			isRefreshing = false;
		}
	}

	let payload: any = null;
	try {
		payload = await res.json();
	} catch (_) {
		// ignore body parse error
	}
	
	if (!res.ok) {
		const message = payload?.message || res.statusText || 'Request failed';
		const err: any = new Error(message);
		err.status = res.status;
		err.payload = payload;
		throw err;
	}
	
	return (payload?.data ?? payload) as T;
}

export const api = {
	get: <T>(path: string) => request<T>(path),
	post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
	put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
	delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

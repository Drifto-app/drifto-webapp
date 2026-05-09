import axios, {AxiosError, AxiosResponse, InternalAxiosRequestConfig} from "axios";
import {useAuthStore} from "@/store/auth-store";
import { ApiStatusBody, isInvalidAuthStatus } from "@/lib/auth-status";

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
})

export const authApi = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

authApi.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const { accessToken } = useAuthStore.getState();

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

authApi.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        const responseBody = error.response?.data as ApiStatusBody | undefined;

        if (
            (
                isInvalidAuthStatus(error.response?.status) ||
                isInvalidAuthStatus(responseBody?.status)
            ) &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            const { refreshAccessToken } = useAuthStore.getState();

            try {
                const success = await refreshAccessToken();

                if (success && originalRequest.headers) {
                    const { accessToken } = useAuthStore.getState();
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return authApi(originalRequest);
                }
            } catch {
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

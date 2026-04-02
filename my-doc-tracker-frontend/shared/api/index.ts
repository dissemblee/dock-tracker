import axios, { AxiosError, type AxiosResponse } from "axios";
import { createApi, type BaseQueryFn } from "@reduxjs/toolkit/query/react";
import { tokenStore } from "./tokenStore";

export interface MetaResponse {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

interface ApiArgs {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  data?: any;
  body?: unknown;
  params?: Record<string, any>;
}

interface ApiArgsAxios<TData = any> {
  endPoint: string
  id?: number
  method: "GET" | "POST" | "PUT" | "DELETE"
  data?: TData
  query?: Record<string, any>
}

/**
 * Axios instance с правильными заголовками и withCredentials
 */
const axiosInstance = axios.create({
  baseURL: typeof window !== 'undefined'
    ? (import.meta.env.VITE_API_URL || "http://localhost:3000")
    : (process.env.VITE_API_URL || "http://localhost:3000"),
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
})

/**
 * Makes a request to the backend API.
 *
 * @param {ApiArgs<TData>} args - The request arguments.
 * @returns {Promise<AxiosResponse<TResponse>>} - The response.
 *
 * @throws {Error} - If there is an error with the request.
 */
export async function $api<TResponse = any, TData = any>(
  args: ApiArgsAxios<TData>
): Promise<AxiosResponse<TResponse>> {
  try {
    const token = tokenStore.get();

    const response = await axiosInstance.request<TResponse>({
      url: args.id ? `${args.endPoint}/${args.id}` : args.endPoint,
      method: args.method,
      data: args.data,
      params: args.query,
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    return response;
  } catch (e) {
    console.error("Ошибка при запросе:", e);
    throw e;
  }
}

/**
 * customBaseQuery для RTK Query
 */
export const customBaseQuery: BaseQueryFn<
  ApiArgs,
  unknown,
  { status?: number; data?: any }
> = async ({ url, method = "GET", body, params }) => {
  try {
    const token = tokenStore.get();
    
    // Отладка в development
    if (import.meta.env.DEV && !token) {
      console.warn('[RTK Query] JWT token not found for request:', url);
    }

    const response = await axiosInstance.request({
      url,
      method,
      data: body,
      params,
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    return { data: response.data };
  } catch (err) {
    const error = err as AxiosError;
    return {
      error: {
        status: error.response?.status,
        data: error.response?.data,
      },
    };
  }
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: customBaseQuery,
  tagTypes: ["Users", "Documents", "Reminders", "Company", "CompanyMembers"],
  endpoints: () => ({}),
});

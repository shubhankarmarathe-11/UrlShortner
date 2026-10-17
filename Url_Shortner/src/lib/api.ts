import axios from "axios";

export const AUTH_URL = import.meta.env.VITE_AUTH_URL || "";
export const SHORT_URL = import.meta.env.VITE_SHORT_URL || "";
export const EMAIL_URL = import.meta.env.VITE_EMAIL_URL || "";
export const HOST_URL = import.meta.env.VITE_HOST_URL || "";
export const REDIRECT_URL = import.meta.env.VITE_REDIRECT_URL || "";

/**
 * Safely parse JSON strings or return original data if already an object/array.
 */
export function safeJsonParse<T>(data: any, fallback: T): T {
  if (typeof data === "string") {
    try {
      return JSON.parse(data) as T;
    } catch {
      return fallback;
    }
  }
  return (data as T) || fallback;
}

/**
 * Extracts a user-friendly error message from Axios errors.
 */
export function getErrorMessage(error: any, fallback = "An unexpected error occurred"): string {
  if (!error) return fallback;
  if (error.response?.data?.detail) {
    if (typeof error.response.data.detail === "string") {
      return error.response.data.detail;
    }
    if (Array.isArray(error.response.data.detail)) {
      return error.response.data.detail.map((e: any) => e.msg || e.message).join(", ");
    }
  }
  if (typeof error.response?.data === "string") {
    return error.response.data;
  }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return fallback;
}

/**
 * Unified logout helper that attempts both possible auth logout routes.
 */
export async function performLogout(): Promise<void> {
  try {
    await axios.post(`${AUTH_URL}/api/users/logout`, {}, { withCredentials: true });
  } catch {
    try {
      await axios.post(`${AUTH_URL}/api/auth/logout`, {}, { withCredentials: true });
    } catch {
      // Ignore if session already invalid
    }
  }
}

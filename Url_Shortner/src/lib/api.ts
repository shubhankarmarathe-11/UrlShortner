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
export function getErrorMessage(
  error: any,
  fallback = "An unexpected error occurred",
): string {
  if (!error) return fallback;
  if (error.response?.data?.detail) {
    if (typeof error.response.data.detail === "string") {
      return error.response.data.detail;
    }
    if (Array.isArray(error.response.data.detail)) {
      return error.response.data.detail
        .map((e: any) => e.msg || e.message)
        .join(", ");
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
    await axios.post(
      `${AUTH_URL}/api/users/logout`,
      {},
      { withCredentials: true },
    );
  } catch {
    try {
      await axios.post(
        `${AUTH_URL}/api/auth/logout`,
        {},
        { withCredentials: true },
      );
    } catch {
      // Ignore if session already invalid
    }
  }
}

/**
 * Safely decodes a JWT token's payload (e.g. Google OAuth credential).
 */
export function decodeJwtPayload<T = any>(token?: string | null): T | null {
  if (!token || typeof token !== "string") return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload) as T;
  } catch {
    return null;
  }
}

/**
 * Calls /api/users/is_authenticated prefixed with AUTH_URL from env.
 * Returns: "Internal server" | "not verified" | "verified"
 */
export async function checkEmailAuthenticationStatus(): Promise<string> {
  try {
    const res = await axios.get(`${AUTH_URL}/api/users/is_authenticated`, {
      withCredentials: true,
    });
    const data =
      typeof res.data === "string"
        ? res.data.trim()
        : res.data?.status || res.data?.message || "";
    return data || "Internal server";
  } catch (error: any) {
    if (error?.response?.status === 405) {
      try {
        const postRes = await axios.post(
          `${AUTH_URL}/api/users/is_authenticated`,
          {},
          { withCredentials: true },
        );
        const postData =
          typeof postRes.data === "string"
            ? postRes.data.trim()
            : postRes.data?.status || postRes.data?.message || "";
        return postData || "Internal server";
      } catch (err: any) {
        return typeof err?.response?.data === "string"
          ? err.response.data.trim()
          : "Internal server";
      }
    }
    if (typeof error?.response?.data === "string") {
      return error.response.data.trim();
    }
    return "Internal server";
  }
}

/**
 * Calls /api/users/is_password_added prefixed with AUTH_URL from env.
 * Returns: "added" | "not added" | string
 */
export async function checkPasswordAddedStatus(): Promise<string> {
  try {
    const res = await axios.get(`${AUTH_URL}/api/users/is_password_added`, {
      withCredentials: true,
    });
    const data =
      typeof res.data === "string"
        ? res.data.trim()
        : res.data?.status || res.data?.message || "";
    return data || "not added";
  } catch (error: any) {
    if (error?.response?.status === 405) {
      try {
        const postRes = await axios.post(
          `${AUTH_URL}/api/users/is_password_added`,
          {},
          { withCredentials: true },
        );
        const postData =
          typeof postRes.data === "string"
            ? postRes.data.trim()
            : postRes.data?.status || postRes.data?.message || "";
        return postData || "not added";
      } catch (err: any) {
        return typeof err?.response?.data === "string"
          ? err.response.data.trim()
          : "not added";
      }
    }
    if (typeof error?.response?.data === "string") {
      return error.response.data.trim();
    }
    return "not added";
  }
}

/**
 * Calls /api/users/add_account_password using PUT with { password } JSON.
 * Returns: "Password Added" | "Internal server error" | string
 */
export async function addAccountPassword(password: string): Promise<string> {
  try {
    const res = await axios.put(
      `${AUTH_URL}/api/users/add_account_password`,
      { password: password },
      { withCredentials: true },
    );
    const data =
      typeof res.data === "string"
        ? res.data.trim()
        : res.data?.message || res.data?.status || "Password Added";
    return data || "Password Added";
  } catch (error: any) {
    if (typeof error?.response?.data === "string") {
      return error.response.data.trim();
    }
    if (error?.response?.data?.detail) {
      return typeof error.response.data.detail === "string"
        ? error.response.data.detail
        : "Internal server error";
    }
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    return "Internal server error";
  }
}

/**
 * Centralized API configuration and client utilities for Starpass
 * Defaults to backend running at http://127.0.0.1:8000
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

/**
 * Resolves a full backend URL for an API route.
 * @param path The API endpoint path, e.g. "/movies/search" or "shows/1/seats"
 */
export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

/**
 * Fetch wrapper that requests the backend API at http://127.0.0.1:8000 with automatic fallback.
 */
export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const primaryUrl = getApiUrl(path);
  try {
    const res = await fetch(primaryUrl, init);
    return res;
  } catch (err) {
    // If direct origin fails (e.g. CORS/proxy), retry via Next.js proxy route if applicable
    const proxyUrl = `/api/backend${path.startsWith("/") ? path : `/${path}`}`;
    try {
      return await fetch(proxyUrl, init);
    } catch {
      throw err;
    }
  }
}

import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const BACKEND_URL = API_BASE.replace(/\/api$/, "");

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // CRITICAL: Send cookies with requests
});

/**
 * Fetch the CSRF cookie from the backend.
 * Must be called before POST requests that need CSRF protection
 * (login, register) when using Sanctum stateful SPA auth.
 */
export async function fetchCsrfCookie(): Promise<void> {
  try {
    const csrfUrl = `${BACKEND_URL}/sanctum/csrf-cookie`;
    await axios.get(csrfUrl, {
      withCredentials: true,
      timeout: 10000, // 10 second timeout
    });
  } catch (error) {
    console.error('Failed to fetch CSRF cookie:', error);
    throw error;
  }
}

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    // SECURITY FIX: Token now in HttpOnly cookie, no need to add Authorization header
    // The cookie will be sent automatically with withCredentials: true
    
    // Manual CSRF token extraction and header setting
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1];
    
    if (csrfToken) {
      config.headers['X-XSRF-TOKEN'] = decodeURIComponent(csrfToken);
    }
    
    const locale = sessionStorage.getItem("locale") || "en";
    config.headers["Accept-Language"] = locale;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        // Avoid redirect loop if already on a login page
        const isLoginPage = window.location.pathname.startsWith("/login");
        if (!isLoginPage) {
          sessionStorage.removeItem("user");
          // Use a brief timeout so the toast renders before redirect
          import("react-hot-toast").then(({ default: toast }) => {
            toast.error("Session expired. Please sign in again.", { duration: 3000 });
          });
          setTimeout(() => {
            window.location.href = "/login";
          }, 300);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

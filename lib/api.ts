import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const BACKEND_URL = API_BASE.replace(/\/api$/, "");

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
  withXSRFToken: true,
});

/**
 * Fetch the CSRF cookie from the backend.
 * Must be called before POST requests that need CSRF protection
 * (login, register) when using Sanctum stateful SPA auth.
 */
export async function fetchCsrfCookie(): Promise<void> {
  await axios.get(`${BACKEND_URL}/sanctum/csrf-cookie`, {
    withCredentials: true,
  });
}

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const locale = localStorage.getItem("locale") || "en";
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
          localStorage.removeItem("token");
          localStorage.removeItem("user");
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

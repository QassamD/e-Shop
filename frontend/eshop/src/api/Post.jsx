import axios from "axios";
import { getAccessToken } from "../utils/auth";

// Create axios instance with proper configuration
const api = axios.create({
  baseURL: "https://e-shop-lbbw.onrender.com",
  timeout: 60000, // 60 second timeout for file uploads
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// List of public endpoints that don't require authentication
const publicRoutes = [
  "/api/v1/users/login",
  "/api/v1/users/register",
  "/api/v1/products",
  "/api/v1/categories",
];

// Health check function with retry
const checkServerHealth = async () => {
  try {
    // Try with minimal headers first
    const response = await axios.get(
      `${api.defaults.baseURL}/api/v1/products`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );
    return response.status === 200;
  } catch (error) {
    console.error("Server health check failed:", error);
    return false;
  }
};

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    // Handle file uploads
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"]; // Let the browser set the correct boundary
    }

    // Add retry count to config if not present
    config.retryCount = config.retryCount || 0;

    // Check if route is public
    const isPublic = publicRoutes.some((route) => config.url?.includes(route));

    // Add auth header for protected routes
    if (!isPublic) {
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors and timeouts
    if (
      (error.code === "ERR_NETWORK" || error.code === "ECONNABORTED") &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      if (originalRequest.retryCount < 3) {
        originalRequest.retryCount += 1;
        // Exponential backoff
        const delay = Math.pow(2, originalRequest.retryCount) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return api(originalRequest);
      }
    }

    if (error.response) {
      console.error("API Error Details:", {
        status: error.response.status,
        data: error.response.data,
        message: error.response.data?.message || error.message,
      });
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Request setup error:", error.message);
    }
    return Promise.reject(error);
  }
);

export { checkServerHealth };
export default api;

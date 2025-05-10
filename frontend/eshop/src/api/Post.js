import axios from "axios";
import { getAccessToken } from "../utils/auth";

const api = axios.create({
  baseURL: "https://e-shop-lbbw.onrender.com",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  // Skip authentication for public routes
  const publicRoutes = [
    "/api/v1/product",
    "/api/v1/products",
    "/auth/login",
    "/auth/register",
  ];
  if (publicRoutes.some((route) => config.url?.startsWith(route))) {
    return config;
  }
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle CORS errors
    if (
      error.message.includes("CORS") ||
      error.message.includes("Network Error")
    ) {
      console.error("CORS/Network error:", error.message);
      return Promise.reject({
        message: "Unable to connect to the server. Please try again later.",
        originalError: error,
      });
    }

    // Handle timeout errors
    if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
      console.error("Request timeout:", error.message);
      return Promise.reject({
        message:
          "Request timed out. Please check your internet connection and try again.",
        originalError: error,
      });
    }

    // Handle network errors
    if (!error.response) {
      console.error("Network error:", error.message);
      return Promise.reject({
        message:
          "Network error. Please check your internet connection and try again.",
        originalError: error,
      });
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.error("Unauthorized request");
      // You might want to redirect to login page or refresh token here
      return Promise.reject({
        message: "Your session has expired. Please log in again.",
        originalError: error,
      });
    }

    // Handle other errors
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";
    return Promise.reject({
      message: errorMessage,
      originalError: error,
    });
  }
);

export default api;

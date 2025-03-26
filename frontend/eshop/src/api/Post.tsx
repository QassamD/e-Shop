import axios from "axios";
import { getAccessToken } from "../main";

const api = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  // console.log("Request: ", config);

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
  // console.log("Token: ", getAccessToken());

  // console.log("Token: ", token);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // localStorage.removeItem("_auth");
      // window.location.href = "/login";
      // console.log(
      //   "Unauthorized request. Redirecting to login page." +
      //     error.response.status
      // );
    }
    return Promise.reject(error);
  }
);

export default api;

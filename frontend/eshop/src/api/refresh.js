// api/refresh.js
import api from "./Post.jsx";

export const refreshApi = async () => {
  try {
    const response = await api.post("/api/v1/auth/refresh");
    return {
      isSuccess: true,
      newAuthToken: response.data.token,
      newAuthTokenExpireIn: 3600,
    };
  } catch (error) {
    return {
      isSuccess: false,
    };
  }
};

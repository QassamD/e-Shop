import axios from "axios";

// export const getAccessToken = () => {
//   try {
//     const auth = localStorage.getItem("_auth");
//     if (auth) {
//       const { token } = JSON.parse(auth);
//       return token;
//     }
//     return null;
//   } catch (error) {
//     console.error("Error getting access token:", error);
//     return null;
//   }
// };

// src/utils/auth.js
export const getAccessToken = () => {
  const auth = JSON.parse(localStorage.getItem("_auth"));
  return auth?.token || null;
};

// export const refreshToken = async () => {
//   try {
//     const response = await axios.post("/api/v1/auth/refresh", {
//       refreshToken: localStorage.getItem("refresh_token"),
//     });

//     localStorage.setItem("access_token", response.data.accessToken);
//     return response.data.accessToken;
//   } catch (error) {
//     console.error("Token refresh failed:", error);
//     localStorage.removeItem("access_token");
//     localStorage.removeItem("refresh_token");
//     throw error;
//   }
// };

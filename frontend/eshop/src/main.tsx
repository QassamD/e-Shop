import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AuthProvider from "react-auth-kit";
import createStore from "react-auth-kit/createStore";
import App from "./App";
import "bootstrap/dist/css/bootstrap.css";

interface AuthState {
  token: string;
  userId: string;
  isAdmin: boolean;
}

export const store = createStore<AuthState>({
  authName: "_auth",
  authType: "localstorage",
  cookieDomain: window.location.hostname,
  cookieSecure: false,
});

export const getAccessToken = () => {
  try {
    const raw = localStorage.getItem("_auth");

    // Handle direct token string case
    if (raw?.startsWith("eyJ")) return raw;

    // Handle JSON format
    const parsed = JSON.parse(raw || "{}");
    return parsed?.auth?.token || null;
  } catch (e) {
    console.error("Token retrieval error:", e);
    return null;
  }
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider store={store}>
      <App />
    </AuthProvider>
  </StrictMode>
);

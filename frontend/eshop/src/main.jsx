import React from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "react-auth-kit";
import App from "./App.jsx";
import "./index.css";

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <AuthProvider
        authType="cookie"
        authName="_auth"
        cookieDomain={window.location.hostname}
        cookieSecure={false}
        cookieSameSite="Lax"
      >
        <App />
      </AuthProvider>
    </React.StrictMode>
  );
}

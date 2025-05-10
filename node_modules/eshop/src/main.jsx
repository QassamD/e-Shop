import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.js";
import "./index.css";
import AuthProvider from "react-auth-kit";
import createStore from "react-auth-kit/createStore";

const store = createStore({
  authName: "_auth",
  authType: "localstorage",
  cookieDomain: window.location.hostname,
  cookieSecure: false,
});

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <AuthProvider store={store}>
        <App />
      </AuthProvider>
    </React.StrictMode>
  );
}

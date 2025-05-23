import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import AuthProvider from "react-auth-kit";
import createStore from "react-auth-kit/createStore";

interface AuthState {
  token: string;
  userId: string;
  isAdmin: boolean;
}

const store = createStore<AuthState>({
  authName: "_auth",
  authType: "localstorage",
  cookieDomain: window.location.hostname,
  cookieSecure: false,
});

export const getAccessToken = () => {
  try {
    const raw = localStorage.getItem("_auth");
    if (!raw) return null;
    const parsed: AuthState = JSON.parse(raw);
    return parsed.token || null;
  } catch (e) {
    console.error("Token retrieval error:", e);
    return null;
  }
};

const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
};

const AppWrapper = () => {
  useEffect(() => {
    // Load Stripe and PayPal scripts only once
    const loadExternalScripts = async () => {
      try {
        // Check if Stripe is already loaded
        if (!window.Stripe) {
          await loadScript("https://js.stripe.com/v3/");
        }

        // Check if PayPal is already loaded
        if (!window.paypal) {
          await loadScript(
            "https://www.paypal.com/sdk/js?client-id=AR8BBahg3yqK3MG7fEiFGnYCgQtizYGbrsFK86rrnW_6vTvK5qp7Owl-2eP1KmWB8cP5N7IVl5vyWKDT&currency=USD"
          );
        }
      } catch (error) {
        console.error("Failed to load external scripts:", error);
        // Handle the error gracefully - the app can still function without these scripts
      }
    };

    loadExternalScripts();
  }, []);

  return <App />;
};

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <AuthProvider store={store}>
      <AppWrapper />
    </AuthProvider>
  </React.StrictMode>
);

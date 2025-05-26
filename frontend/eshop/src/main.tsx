import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import AuthProvider from "react-auth-kit";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

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

// Create a custom error boundary component
class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", textAlign: "center" }}>
          <h2>Something went wrong.</h2>
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{
              padding: "10px 20px",
              marginTop: "10px",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Cast AuthProvider to any to bypass TypeScript errors
const AuthProviderComponent = AuthProvider as any;

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProviderComponent
        authType="cookie"
        authName="_auth"
        cookieDomain={window.location.hostname}
        cookieSecure={window.location.protocol === "https:"}
        cookieSameSite="strict"
        cookiePath="/"
      >
        <AppWrapper />
      </AuthProviderComponent>
    </ErrorBoundary>
  </React.StrictMode>
);

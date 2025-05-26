import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSignIn } from "react-auth-kit";
import api, { checkServerHealth } from "../api/Post";
import "./Login.css";

const Login = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState("checking");
  const navigate = useNavigate();
  const signIn = useSignIn();

  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const checkServer = async () => {
      try {
        const isHealthy = await checkServerHealth();
        setServerStatus(isHealthy ? "online" : "offline");
        if (!isHealthy) setError("Server unavailable. Try again later.");
      } catch (error) {
        setServerStatus("offline");
        setError("Failed to check server status");
      }
    };
    checkServer();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (serverStatus !== "online") return;
    setLoading(true);

    try {
      const response = await api.post("/api/v1/users/login", credentials);

      if (response.status === 200) {
        // Save to localStorage via react-auth-kit
        signIn({
          token: response.data.token,
          expiresIn: 3600,
          tokenType: "Bearer",
          authState: response.data.user,
        });

        // Store token separately for API calls
        const authState = {
          token: response.data.token,
          user: response.data.user,
          expires: Date.now() + 3600 * 1000,
        };
        localStorage.setItem("_auth", JSON.stringify(authState));

        navigate("/");
      }
    } catch (err) {
      handleLoginError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginError = (err) => {
    let errorMessage = "Login failed. Check credentials and try again.";

    if (err.response) {
      switch (err.response.status) {
        case 401:
          errorMessage = "Invalid email or password";
          break;
        case 502:
          errorMessage = "Server connection failed";
          break;
      }
    } else if (err.code === "CORS_ERROR") {
      errorMessage = "Connection blocked. Check network/firewall.";
    }

    setError(errorMessage);
  };

  return _jsxs("div", {
    className: "login-container",
    children: [
      _jsx("h2", { children: "Login" }),
      serverStatus === "checking" &&
        _jsx("div", {
          className: "status checking",
          children: "Checking server...",
        }),
      serverStatus === "offline" &&
        _jsx("div", {
          className: "status offline",
          children: "Server offline",
        }),
      error && _jsx("div", { className: "error", children: error }),
      _jsxs("form", {
        onSubmit: handleSubmit,
        children: [
          _jsxs("div", {
            className: "form-group",
            children: [
              _jsx("label", { children: "Email" }),
              _jsx("input", {
                type: "email",
                value: credentials.email,
                onChange: (e) =>
                  setCredentials((prev) => ({
                    ...prev,
                    email: e.target.value,
                  })),
                required: true,
                disabled: serverStatus !== "online",
              }),
            ],
          }),
          _jsxs("div", {
            className: "form-group",
            children: [
              _jsx("label", { children: "Password" }),
              _jsx("input", {
                type: "password",
                value: credentials.password,
                onChange: (e) =>
                  setCredentials((prev) => ({
                    ...prev,
                    password: e.target.value,
                  })),
                required: true,
                disabled: serverStatus !== "online",
              }),
            ],
          }),
          _jsx("button", {
            type: "submit",
            disabled: loading || serverStatus !== "online",
            className: loading ? "loading" : "",
            children: loading ? "Signing in..." : "Sign In",
          }),
        ],
      }),
    ],
  });
};

export default Login;

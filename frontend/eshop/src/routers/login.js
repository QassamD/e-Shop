import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useSignIn from "react-auth-kit/hooks/useSignIn";
import api from "../api/Post.js";
import "./login.css";
import { AxiosError } from "axios";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
const Login = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    name: "",
  });
  const navigate = useNavigate();
  const signIn = useSignIn();
  const user = useAuthUser();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await api.post(`/api/v1/user/login`, credentials);
      // console.log("API Response", response.data);
      // const token = response.data.access_token || response.data.token;
      // const { access_token: token, userId, isAdmin } = response.data;
      const token = response.data.token;
      const userId = response.data.userId;
      const user = response.data.name;
      const isAdmin = response.data.isAdmin;
      const email = response.data.email;
      console.log("Processed credentials:", {
        token,
        userId,
        isAdmin,
        user,
        email,
      });
      if (!token) {
        throw new Error("Authentication token missing in response");
      }
      const signInResult = signIn({
        auth: {
          token: token,
          type: "Bearer",
        },
        userState: {
          userId,
          isAdmin: Boolean(isAdmin),
          name: response.data.name,
          email,
        },
      });
      if (signInResult) {
        navigate("/");
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        setError(error.response?.data.message || "Login failed");
      } else {
        console.log("Error", error);
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };
  return _jsx("div", {
    className: "login-container",
    children: _jsxs("div", {
      className: "login-card",
      children: [
        _jsx("h2", { className: "login-title", children: "Welcome Back" }),
        _jsx("p", {
          className: "login-subtitle",
          children: "Please sign in to continue",
        }),
        _jsxs("form", {
          onSubmit: handleSubmit,
          className: "login-form",
          children: [
            _jsxs("div", {
              className: "form-group",
              children: [
                _jsx("label", { htmlFor: "email", children: "Email" }),
                _jsx("input", {
                  type: "email",
                  id: "email",
                  required: true,
                  placeholder: "Enter your email",
                  value: credentials.email,
                  onChange: (e) =>
                    setCredentials((prev) => ({
                      ...prev,
                      email: e.target.value,
                    })),
                }),
              ],
            }),
            _jsxs("div", {
              className: "form-group",
              children: [
                _jsx("label", { htmlFor: "password", children: "Password" }),
                _jsx("input", {
                  type: "password",
                  id: "password",
                  required: true,
                  placeholder:
                    "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
                  value: credentials.password,
                  onChange: (e) =>
                    setCredentials((prev) => ({
                      ...prev,
                      password: e.target.value,
                    })),
                }),
              ],
            }),
            error &&
              _jsx("div", { className: "error-message", children: error }),
            _jsx("button", {
              type: "submit",
              className: "login-button",
              disabled: loading,
              children: loading ? "Loading..." : "Submit",
            }),
          ],
        }),
        user
          ? _jsxs("p", {
              children: ["Welcome back, User ID: ", user.userId, " "],
            })
          : _jsx("p", { children: "Please log in." }),
        _jsxs("div", {
          className: "login-footer",
          children: [
            _jsx("span", { children: "Don't have an account? " }),
            _jsx(Link, {
              to: "/user/register",
              className: "signup-link",
              children: "Sign up",
            }),
          ],
        }),
      ],
    }),
  });
};
export default Login;

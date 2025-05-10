import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import api from "../api/Post.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";
const Register = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    isAdmin: false,
    street: "",
    zip: "",
    city: "",
    country: "",
  });
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const validateForm = () => {
    const { name, email, password, phone, street, zip, city, country } =
      formData;
    // Required fields check
    if (
      !name ||
      !email ||
      !password ||
      !phone ||
      !street ||
      !zip ||
      !city ||
      !country
    ) {
      setError("All fields are required");
      return false;
    }
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Invalid email format");
      return false;
    }
    // Password strength (minimum 8 characters, 1 uppercase, 1 lowercase, 1 number)
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError(
        "Password must contain at least 8 characters, one uppercase, one lowercase, and one number"
      );
      return false;
    }
    return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await api.post("/api/v1/user/register", {
        ...formData,
        // Add address object structure expected by backend
        address: {
          street: formData.street,
          zip: formData.zip,
          city: formData.city,
          country: formData.country,
        },
      });
      if (response.status === 201) {
        // Registration successful
        alert("Registration successful! Redirecting to login...");
        // Optional: Auto-login logic here if needed
        // const { token, user } = response.data;
        // localStorage.setItem("authToken", token);
        setTimeout(() => navigate("/user/login"), 1500);
      } else {
        throw new Error("Registration failed");
      }
    } catch (error) {
      let errorMessage = "Registration failed. Please try again.";
      // Properly handle Axios errors
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      setError(errorMessage);
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };
  return _jsxs("div", {
    className: "container",
    children: [
      _jsx("h2", { children: "Register" }),
      error && _jsx("div", { className: "error-message", children: error }),
      _jsxs("form", {
        onSubmit: handleSubmit,
        children: [
          _jsxs("label", {
            children: [
              "Name:",
              _jsx("input", {
                type: "text",
                name: "name",
                value: formData.name,
                onChange: handleChange,
                required: true,
              }),
            ],
          }),
          _jsxs("label", {
            children: [
              "Email:",
              _jsx("input", {
                type: "email",
                name: "email",
                value: formData.email,
                onChange: handleChange,
                required: true,
              }),
            ],
          }),
          _jsxs("label", {
            children: [
              "Password:",
              _jsx("input", {
                type: "password",
                name: "password",
                value: formData.password,
                onChange: handleChange,
                required: true,
                placeholder:
                  "At least 8 characters with mix of uppercase, lowercase, and numbers",
              }),
            ],
          }),
          _jsxs("label", {
            children: [
              "Phone:",
              _jsx("input", {
                type: "tel",
                name: "phone",
                value: formData.phone,
                onChange: handleChange,
                required: true,
              }),
            ],
          }),
          _jsxs("label", {
            className: "checkbox-label",
            children: [
              _jsx("input", {
                type: "checkbox",
                name: "isAdmin",
                checked: formData.isAdmin,
                onChange: handleChange,
              }),
              _jsx("span", { children: "Is Admin" }),
            ],
          }),
          _jsxs("fieldset", {
            children: [
              _jsx("legend", { children: "Address Information" }),
              _jsxs("label", {
                children: [
                  "Street:",
                  _jsx("input", {
                    type: "text",
                    name: "street",
                    value: formData.street,
                    onChange: handleChange,
                    required: true,
                  }),
                ],
              }),
              _jsxs("label", {
                children: [
                  "ZIP Code:",
                  _jsx("input", {
                    type: "text",
                    name: "zip",
                    value: formData.zip,
                    onChange: handleChange,
                    required: true,
                  }),
                ],
              }),
              _jsxs("label", {
                children: [
                  "City:",
                  _jsx("input", {
                    type: "text",
                    name: "city",
                    value: formData.city,
                    onChange: handleChange,
                    required: true,
                  }),
                ],
              }),
              _jsxs("label", {
                children: [
                  "Country:",
                  _jsx("input", {
                    type: "text",
                    name: "country",
                    value: formData.country,
                    onChange: handleChange,
                    required: true,
                  }),
                ],
              }),
            ],
          }),
          _jsx("button", {
            type: "submit",
            disabled: loading,
            className: loading ? "loading" : "",
            children: loading ? "Registering..." : "Register",
          }),
        ],
      }),
    ],
  });
};
export default Register;

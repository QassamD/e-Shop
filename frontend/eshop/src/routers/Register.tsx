import React, { useState } from "react";
import api from "../api/Post.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";

interface UserForm {
  name: string;
  email: string;
  password: string;
  phone: string;
  isAdmin: boolean;
  street: string;
  zip: string;
  city: string;
  country: string;
}

const Register: React.FC = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UserForm>({
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = (): boolean => {
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

  const handleSubmit = async (e: React.FormEvent) => {
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
    } catch (error: unknown) {
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

  return (
    <div className="container">
      <h2>Register</h2>
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Name Field */}
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </label>

        {/* Email Field */}
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </label>

        {/* Password Field */}
        <label>
          Password:
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="At least 8 characters with mix of uppercase, lowercase, and numbers"
          />
        </label>

        {/* Phone Field */}
        <label>
          Phone:
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </label>

        {/* Admin Checkbox */}
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="isAdmin"
            checked={formData.isAdmin}
            onChange={handleChange}
          />
          <span>Is Admin</span>
        </label>

        {/* Address Fields */}
        <fieldset>
          <legend>Address Information</legend>

          <label>
            Street:
            <input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            ZIP Code:
            <input
              type="text"
              name="zip"
              value={formData.zip}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            City:
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Country:
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
            />
          </label>
        </fieldset>

        <button
          type="submit"
          disabled={loading}
          className={loading ? "loading" : ""}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default Register;

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useSignIn from "react-auth-kit/hooks/useSignIn";
import api from "../api/Post";
import "./login.css";
import { AxiosError } from "axios";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";

interface UserState {
  userId: string;
  isAdmin: boolean;
  name: string;
  email: string;
}

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
  const user = useAuthUser<UserState>();

  const handleSubmit = async (e: React.FormEvent) => {
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

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">Please sign in to continue</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              required
              placeholder="Enter your email"
              value={credentials.email}
              onChange={(e) =>
                setCredentials((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              required
              placeholder="••••••••"
              value={credentials.password}
              onChange={(e) =>
                setCredentials((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Loading..." : "Submit"}
          </button>
        </form>
        {user ? (
          <p>Welcome back, User ID: {user.userId} </p>
        ) : (
          <p>Please log in.</p>
        )}

        <div className="login-footer">
          <span>Don't have an account? </span>
          <Link to="/user/register" className="signup-link">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

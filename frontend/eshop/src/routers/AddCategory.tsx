import React from "react";
import { useState } from "react";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import Header from "../components/Header";
import api from "../api/Post.jsx";
import "./AddCategory.css";
import { useNavigate } from "react-router-dom";

interface User {
  userId: string;
  name: string;
  isAdmin: boolean;
}

interface Category {
  dataOrdered: string;
  name: string;
  icon: string;
  color: string;
}

const AddCategory = () => {
  const auth = useAuthUser<User>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<Category>({
    name: "",
    dataOrdered: "",
    icon: "",
    color: "#3498db",
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (category.name) {
      setLoading(true);
      try {
        const response = await api.post("api/v1/category", category);

        if (response.status === 201 || response.status === 200) {
          alert("adding category successful!!! ");
          navigate("/category");
        } else {
          throw Error("adding category Filed");
        }
      } catch (err) {
        setError("filed add category");
        console.log(error, err);
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCategory((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div>
        <Header />
        <h1 className="loading">Loading Category...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <Header />
        <p className="error-message">{error}</p>
      </div>
    );
  }

  if (!auth) {
    return (
      <div className="error-container">
        <Header />
        <p className="error-message">
          You need to be logged in to access this page
        </p>
      </div>
    );
  }

  if (!auth?.isAdmin) {
    return (
      <div className="error-container">
        <Header />
        <p className="error-message">
          Unauthorized access. Admin privileges required.
        </p>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="add-category-container">
        <div className="form-wrapper">
          <h1 className="form-title">Add New Category</h1>

          <form onSubmit={handleSubmit} className="category-form">
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label>
                Category Name *
                <input
                  type="text"
                  name="name"
                  value={category.name}
                  onChange={handleChange}
                  placeholder="Enter category name"
                />
              </label>
            </div>

            <div className="form-group">
              <label>
                Icon *
                <select
                  name="icon"
                  value={category.icon}
                  onChange={handleChange}
                >
                  <option value="">Select an icon</option>
                  <option value="shopping_basket">Shopping Basket</option>
                  <option value="laptop">Laptop</option>
                  <option value="smartphone">Smartphone</option>
                  <option value="home">Home</option>
                  <option value="directions_car">Car</option>
                  <option value="checkroom">Clothing</option>
                </select>
              </label>
            </div>
            <div className="form-group">
              <label>
                Color *
                <input
                  type="color"
                  name="color"
                  value={category.color}
                  onChange={handleChange}
                />
                <span
                  className="color-preview"
                  style={{ backgroundColor: category.color }}
                ></span>
              </label>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Adding..." : "Add Category"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCategory;

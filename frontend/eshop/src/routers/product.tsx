import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/Post.jsx";
import axios from "axios";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import Header from "../components/Header";
import "./product.css";

interface ProductForm {
  name: string;
  description: string;
  richDescription: string;
  brand: string;
  price: number;
  category: string;
  countInStock: number;
  rating: number;
  numReviews: number;
  isFeatured: boolean;
}

interface Category {
  _id: string;
  dataOrdered: string;
  name: string;
  icon: string;
  color: string;
}

const ProductCreate = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = useAuthUser<{ token: string }>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState<ProductForm>({
    name: "",
    description: "",
    richDescription: "",
    brand: "",
    price: 0,
    category: "",
    countInStock: 0,
    rating: 0,
    numReviews: 0,
    isFeatured: false,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/api/v1/category");
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Failed to load categories");
      }
    };

    fetchCategories();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
    // console.log(e);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formPayload = new FormData();

      // Append text fields
      Object.entries(formData).forEach(([key, value]) => {
        formPayload.append(key, value.toString());
      });

      // Append image file
      if (selectedFile) {
        formPayload.append("image", selectedFile);
      }

      const response = await api.post("/api/v1/product", formPayload, {
        headers: {
          Authorization: `Bearer ${auth?.token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        navigate("/");
      }
    } catch (error) {
      let errorMessage = "Failed to create product";

      if (axios.isAxiosError(error)) {
        // Handle backend validation errors
        const serverError = error.response?.data;
        errorMessage = serverError?.message || error.message;

        if (serverError?.errors) {
          errorMessage = Object.values(serverError.errors).join(", ");
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-form-container">
      <Header />
      <h2>Create New Product</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="product-form">
        {/* Product Image */}
        <div className="form-group">
          <label>Product Image</label>
          <input
            type="file"
            name="image"
            onChange={handleFileChange}
            accept="image/*"
            required
          />
        </div>

        {/* Product Name */}
        <div className="form-group">
          <label>Product Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        {/* Description */}
        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        {/* Rich Description */}
        <div className="form-group">
          <label>Detailed Description</label>
          <textarea
            name="richDescription"
            value={formData.richDescription}
            onChange={handleChange}
          />
        </div>

        {/* Brand */}
        <div className="form-group">
          <label>Brand</label>
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            required
          />
        </div>

        {/* Price */}
        <div className="form-group">
          <label>Price ($)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleNumberChange}
            min="0"
            step="0.01"
            required
          />
        </div>

        {/* Category */}
        <div className="form-group">
          <label>Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Stock Quantity */}
        <div className="form-group">
          <label>Stock Quantity</label>
          <input
            type="number"
            name="countInStock"
            value={formData.countInStock}
            onChange={handleNumberChange}
            min="0"
            required
          />
        </div>

        {/* Featured Product */}
        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            name="isFeatured"
            checked={formData.isFeatured}
            onChange={handleChange}
          />
          <label>Featured Product</label>
        </div>

        {/* Submit Button */}
        <button type="submit" disabled={loading} className="submit-button">
          {loading ? "Creating Product..." : "Create Product"}
        </button>
      </form>
    </div>
  );
};

export default ProductCreate;

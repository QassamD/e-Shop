import React, { useEffect, useState } from "react";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/Post";
import Header from "../components/Header";
import "./PutProduct.css";
import { AxiosError } from "axios";

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

interface User {
  userId: string;
  name: string;
  isAdmin: boolean;
  token: string;
}

interface Category {
  _id: string;
  dataOrdered: string;
  name: string;
  icon: string;
  color: string;
}

const PutProduct = () => {
  const { id } = useParams<{ id: string }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = useAuthUser<User>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

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
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/api/v1/product/${id}`);
        setFormData({
          name: response.data.name || "",
          description: response.data.description || "",
          richDescription: response.data.richDescription || "",
          brand: response.data.brand || "",
          price: response.data.price || 0,
          category: response.data.category?._id || response.data.category || "",
          countInStock: response.data.countInStock || 0,
          rating: response.data.rating || 0,
          numReviews: response.data.numReviews || 0,
          isFeatured: response.data.isFeatured || false,
        });
        setImagePreview(response.data.image || "");
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await api.get("/api/v1/category");
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Failed to load categories");
      }
    };

    if (id) {
      fetchProduct();
      fetchCategories();
    }
  }, [id]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formDataToSend = new FormData();

      // Append fields individually with proper typing
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("richDescription", formData.richDescription);
      formDataToSend.append("brand", formData.brand);
      formDataToSend.append("price", formData.price.toString());
      formDataToSend.append("category", String(formData.category));
      formDataToSend.append("countInStock", formData.countInStock.toString());
      formDataToSend.append("rating", formData.rating.toString());
      formDataToSend.append("numReviews", formData.numReviews.toString());
      formDataToSend.append("isFeatured", formData.isFeatured.toString());

      if (selectedFile) {
        formDataToSend.append("image", selectedFile);
      }

      const response = await api.put(`/api/v1/product/${id}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${auth?.token}`,
        },
      });
      if (response.status === 200) {
        navigate(`/card/${id}`);
      }
    } catch (error) {
      let errorMessage = "Failed to update product";
      if (error instanceof AxiosError) {
        if (error.code === "ERR_NETWORK") {
          errorMessage =
            "Cannot connect to server. Check if backend is running.";
        } else {
          errorMessage = error.response?.data?.message || error.message;
        }
      }
      setError(errorMessage);
      console.error("Update error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  if (loading) {
    return (
      <div>
        <Header />
        <h1 className="loading">Loading Product...</h1>
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
    <>
      <Header />
      <div className="put-product-container">
        <form onSubmit={handleSubmit} className="product-form">
          <h2>Edit Product</h2>

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

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
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
          <div className="form-row">
            <div className="form-group">
              <label>Price</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleNumberChange}
                min="0"
                required
              />
            </div>

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
          </div>

          <div className="form-group">
            <label>Product Image</label>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="image-preview" />
            )}
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Updating..." : "Update Product"}
          </button>
        </form>
      </div>
    </>
  );
};

export default PutProduct;

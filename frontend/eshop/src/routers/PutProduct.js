import {
  jsx as _jsx,
  jsxs as _jsxs,
  Fragment as _Fragment,
} from "react/jsx-runtime";
import { useEffect, useState } from "react";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/Post.js";
import Header from "../components/Header";
import "./PutProduct.css";
import { AxiosError } from "axios";
const PutProduct = () => {
  const { id } = useParams();
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = useAuthUser();
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [formData, setFormData] = useState({
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
  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? e.target.checked : value,
    }));
  };
  const handleSubmit = async (e) => {
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
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };
  if (loading) {
    return _jsxs("div", {
      children: [
        _jsx(Header, {}),
        _jsx("h1", { className: "loading", children: "Loading Product..." }),
      ],
    });
  }
  if (error) {
    return _jsxs("div", {
      className: "error-container",
      children: [
        _jsx(Header, {}),
        _jsx("p", { className: "error-message", children: error }),
      ],
    });
  }
  if (!auth) {
    return _jsxs("div", {
      className: "error-container",
      children: [
        _jsx(Header, {}),
        _jsx("p", {
          className: "error-message",
          children: "You need to be logged in to access this page",
        }),
      ],
    });
  }
  if (!auth?.isAdmin) {
    return _jsxs("div", {
      className: "error-container",
      children: [
        _jsx(Header, {}),
        _jsx("p", {
          className: "error-message",
          children: "Unauthorized access. Admin privileges required.",
        }),
      ],
    });
  }
  return _jsxs(_Fragment, {
    children: [
      _jsx(Header, {}),
      _jsx("div", {
        className: "put-product-container",
        children: _jsxs("form", {
          onSubmit: handleSubmit,
          className: "product-form",
          children: [
            _jsx("h2", { children: "Edit Product" }),
            _jsxs("div", {
              className: "form-group",
              children: [
                _jsx("label", { children: "Product Name" }),
                _jsx("input", {
                  type: "text",
                  name: "name",
                  value: formData.name,
                  onChange: handleChange,
                  required: true,
                }),
              ],
            }),
            _jsxs("div", {
              className: "form-group",
              children: [
                _jsx("label", { children: "Description" }),
                _jsx("textarea", {
                  name: "description",
                  value: formData.description,
                  onChange: handleChange,
                  required: true,
                }),
              ],
            }),
            _jsxs("div", {
              className: "form-group",
              children: [
                _jsx("label", { children: "Category" }),
                _jsxs("select", {
                  name: "category",
                  value: formData.category,
                  onChange: handleChange,
                  required: true,
                  children: [
                    _jsx("option", {
                      value: "",
                      children: "Select a category",
                    }),
                    categories.map((category) =>
                      _jsx(
                        "option",
                        { value: category._id, children: category.name },
                        category._id
                      )
                    ),
                  ],
                }),
              ],
            }),
            _jsxs("div", {
              className: "form-row",
              children: [
                _jsxs("div", {
                  className: "form-group",
                  children: [
                    _jsx("label", { children: "Price" }),
                    _jsx("input", {
                      type: "number",
                      name: "price",
                      value: formData.price,
                      onChange: handleNumberChange,
                      min: "0",
                      required: true,
                    }),
                  ],
                }),
                _jsxs("div", {
                  className: "form-group",
                  children: [
                    _jsx("label", { children: "Stock Quantity" }),
                    _jsx("input", {
                      type: "number",
                      name: "countInStock",
                      value: formData.countInStock,
                      onChange: handleNumberChange,
                      min: "0",
                      required: true,
                    }),
                  ],
                }),
              ],
            }),
            _jsxs("div", {
              className: "form-group",
              children: [
                _jsx("label", { children: "Product Image" }),
                _jsx("input", {
                  type: "file",
                  accept: "image/*",
                  onChange: handleFileChange,
                }),
                imagePreview &&
                  _jsx("img", {
                    src: imagePreview,
                    alt: "Preview",
                    className: "image-preview",
                  }),
              ],
            }),
            _jsx("button", {
              type: "submit",
              className: "submit-btn",
              disabled: loading,
              children: loading ? "Updating..." : "Update Product",
            }),
          ],
        }),
      }),
    ],
  });
};
export default PutProduct;

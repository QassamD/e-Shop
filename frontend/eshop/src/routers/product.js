import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/Post.js";
import axios from "axios";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import Header from "../components/Header";
import "./product.css";
const ProductCreate = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = useAuthUser();
  const [selectedFile, setSelectedFile] = useState(null);
  const [categories, setCategories] = useState([]);
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
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
    // console.log(e);
  };
  const handleSubmit = async (e) => {
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
  return _jsxs("div", {
    className: "product-form-container",
    children: [
      _jsx(Header, {}),
      _jsx("h2", { children: "Create New Product" }),
      error && _jsx("div", { className: "error-message", children: error }),
      _jsxs("form", {
        onSubmit: handleSubmit,
        className: "product-form",
        children: [
          _jsxs("div", {
            className: "form-group",
            children: [
              _jsx("label", { children: "Product Image" }),
              _jsx("input", {
                type: "file",
                name: "image",
                onChange: handleFileChange,
                accept: "image/*",
                required: true,
              }),
            ],
          }),
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
              _jsx("label", { children: "Detailed Description" }),
              _jsx("textarea", {
                name: "richDescription",
                value: formData.richDescription,
                onChange: handleChange,
              }),
            ],
          }),
          _jsxs("div", {
            className: "form-group",
            children: [
              _jsx("label", { children: "Brand" }),
              _jsx("input", {
                type: "text",
                name: "brand",
                value: formData.brand,
                onChange: handleChange,
                required: true,
              }),
            ],
          }),
          _jsxs("div", {
            className: "form-group",
            children: [
              _jsx("label", { children: "Price ($)" }),
              _jsx("input", {
                type: "number",
                name: "price",
                value: formData.price,
                onChange: handleNumberChange,
                min: "0",
                step: "0.01",
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
                  _jsx("option", { value: "", children: "Select a category" }),
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
          _jsxs("div", {
            className: "form-group checkbox-group",
            children: [
              _jsx("input", {
                type: "checkbox",
                name: "isFeatured",
                checked: formData.isFeatured,
                onChange: handleChange,
              }),
              _jsx("label", { children: "Featured Product" }),
            ],
          }),
          _jsx("button", {
            type: "submit",
            disabled: loading,
            className: "submit-button",
            children: loading ? "Creating Product..." : "Create Product",
          }),
        ],
      }),
    ],
  });
};
export default ProductCreate;

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/Post.jsx";
import axios from "axios";
import { useAuthUser } from "react-auth-kit";
// import Header from "../components/Header.jsx";
import "./product.css";

const ProductCreate = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileError, setFileError] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
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
        const response = await api.get("/api/v1/categories");
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  const handleFileChange = (e) => {
    setFileError("");
    const file = e.target.files?.[0];

    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setFileError("Please upload an image file (JPEG, PNG, GIF)");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setFileError("File size exceeds 5MB limit");
      return;
    }

    setSelectedFile(file);

    // Create a data URL instead of blob URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Authentication check
      const storedAuth = localStorage.getItem("_auth");
      if (!storedAuth) throw new Error("Authentication required");
      const parsedAuth = JSON.parse(storedAuth);
      if (!parsedAuth.token) throw new Error("Invalid auth token");

      // Prepare form data
      const formPayload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formPayload.append(key, value.toString());
      });

      // Add image file if selected
      if (selectedFile) {
        formPayload.append("image", selectedFile);
      }

      // API call
      const response = await api.post("/api/v1/products", formPayload, {
        headers: {
          Authorization: `Bearer ${parsedAuth.token}`,
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log("Upload Progress:", percent);
        },
      });

      // Redirect on success
      if (response.status === 201) {
        navigate("/");
      }
    } catch (error) {
      let message = "Failed to create product";
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 413) {
          message = "Image file is too large. Please use a smaller image.";
        } else {
          message = error.response?.data?.message || error.message;
        }
      }
      setError(message);
      console.error("Product creation error:", error);
    } finally {
      setLoading(false);
    }
  };

  return _jsxs("div", {
    className: "product-form-container",
    children: [
      // _jsx(Header, {}),
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
              _jsxs("div", {
                className: "file-input-container",
                children: [
                  _jsxs("label", {
                    className: "file-input-label",
                    children: [
                      _jsx("span", { children: "Choose File" }),
                      _jsx("input", {
                        type: "file",
                        name: "image",
                        onChange: handleFileChange,
                        accept: "image/*",
                        required: true,
                        style: { display: "none" },
                      }),
                    ],
                  }),
                  _jsx("span", {
                    className: "file-name",
                    children: selectedFile
                      ? selectedFile.name
                      : "No file chosen",
                  }),
                  previewUrl &&
                    _jsx("img", {
                      src: previewUrl,
                      alt: "Preview",
                      className: "image-preview",
                    }),
                  fileError &&
                    _jsx("div", {
                      className: "file-error-message",
                      children: fileError,
                    }),
                ],
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

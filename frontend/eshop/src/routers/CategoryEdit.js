import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/Post.js";
import Header from "../components/Header";
import "./CategoryEdit.css";
const CategoryEdit = () => {
  const { id } = useParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = useAuthUser();
  const [formData, setFormData] = useState({
    dataOrdered: "",
    name: "",
    icon: "",
    color: "",
  });
  const iconOptions = [
    "shopping_basket",
    "laptop",
    "phone_iphone",
    "home",
    "directions_car",
    "checkroom",
    "watch",
    "local_dining",
  ];
  useEffect(() => {
    const FetchCategory = async () => {
      try {
        const response = await api.get(`/api/v1/category/${id}`);
        setFormData({
          dataOrdered: response.data.dataOrdered || new Date().toISOString(),
          name: response.data.name || "",
          icon: response.data.icon || "shopping_basket",
          color: response.data.color || "#3498db",
        });
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };
    if (id) FetchCategory();
  }, [id]);
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
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value.toString());
      });
      for (const [key, value] of formDataToSend.entries()) {
        console.log(key, value);
      }
      const response = await api.put(`/api/v1/category/${id}`, formData, {
        headers: {
          //   "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${auth?.token}`,
        },
      });
      console.log("response", response);
      if (response.status === 200) {
        navigate(`/category/${id}`);
      }
    } catch (error) {
      setError("Failed to update category");
      console.log("Update Error", error);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return _jsxs("div", {
      children: [
        _jsx(Header, {}),
        _jsx("h1", { className: "loading", children: "Loading Category..." }),
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
  return _jsxs("div", {
    children: [
      _jsx(Header, {}),
      _jsx("div", {
        className: "category-edit-container",
        children: _jsxs("form", {
          onSubmit: handleSubmit,
          className: "category-edit-form",
          children: [
            _jsx("h1", { children: "Edit Category" }),
            _jsxs("div", {
              className: "form-group",
              children: [
                _jsx("label", { children: "Category Name" }),
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
                _jsx("label", { children: "Select Icon" }),
                _jsx("div", {
                  className: "icon-grid",
                  children: iconOptions.map((icon) =>
                    _jsx(
                      "div",
                      {
                        className: `icon-option ${
                          formData.icon === icon ? "selected" : ""
                        }`,
                        onClick: () => setFormData({ ...formData, icon }),
                        children: _jsx("span", {
                          className: "material-icons",
                          children: icon,
                        }),
                      },
                      icon
                    )
                  ),
                }),
              ],
            }),
            _jsxs("div", {
              className: "form-group",
              children: [
                _jsx("label", { children: "Color" }),
                _jsxs("div", {
                  className: "color-picker",
                  children: [
                    _jsx("input", {
                      type: "color",
                      name: "color",
                      value: formData.color,
                      onChange: handleChange,
                    }),
                    _jsx("div", {
                      className: "color-preview",
                      style: { backgroundColor: formData.color },
                    }),
                  ],
                }),
              ],
            }),
            _jsxs("div", {
              className: "category-preview",
              children: [
                _jsx("h3", { children: "Preview:" }),
                _jsxs("div", {
                  className: "preview-content",
                  children: [
                    _jsx("span", {
                      className: "material-icons",
                      style: { color: formData.color },
                      children: formData.icon,
                    }),
                    _jsx("span", { children: formData.name }),
                  ],
                }),
              ],
            }),
            _jsxs("div", {
              className: "form-actions",
              children: [
                _jsx("button", {
                  type: "button",
                  className: "cancel-btn",
                  onClick: () => navigate(-1),
                  children: "Cancel",
                }),
                _jsx("button", {
                  type: "submit",
                  className: "save-btn",
                  disabled: loading,
                  children: loading ? "Saving..." : "Save Changes",
                }),
              ],
            }),
          ],
        }),
      }),
    ],
  });
};
export default CategoryEdit;

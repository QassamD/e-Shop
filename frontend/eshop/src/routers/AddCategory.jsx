import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useAuthUser } from "react-auth-kit";
import Header from "../components/Header";
import api from "../api/Post.jsx";
import "./AddCategory.css";
import { useNavigate } from "react-router-dom";

const AddCategory = () => {
  const auth = useAuthUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState({
    name: "",
    dataOrdered: "",
    icon: "",
    color: "#3498db",
  });
  const [error, setError] = useState(null);

  const storedAuth = localStorage.getItem("_auth");
  if (!storedAuth) {
    setError("Please login to access this page");
    navigate("/user/login");
    return null;
  }

  const parsedAuth = JSON.parse(storedAuth);
  if (!parsedAuth.token) {
    setError("Authentication token not found");
    navigate("/user/login");
    return null;
  }

  // if (!parsedAuth.user?.isAdmin) {
  //   setError("Unauthorized access. Admin privileges required.");
  //   navigate("/");
  //   return null;
  // }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (category.name) {
      setLoading(true);
      try {
        const response = await api.post("/api/v1/categories", category, {
          headers: {
            Authorization: `Bearer ${parsedAuth.token}`,
          },
        });
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
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategory((prev) => ({ ...prev, [name]: value }));
  };
  if (loading) {
    return _jsxs("div", {
      children: [
        // _jsx(Header, {}),
        _jsx("h1", { className: "loading", children: "Loading Category..." }),
      ],
    });
  }
  if (error) {
    return _jsxs("div", {
      className: "error-container",
      children: [
        // _jsx(Header, {}),
        _jsx("p", { className: "error-message", children: error }),
      ],
    });
  }
  if (!auth) {
    return _jsxs("div", {
      className: "error-container",
      children: [
        // _jsx(Header, {}),
        _jsx("p", {
          className: "error-message",
          children: "You need to be logged in to access this page",
        }),
      ],
    });
  }
  if (!auth()?.isAdmin) {
    return _jsxs("div", {
      className: "error-container",
      children: [
        // _jsx(Header, {}),
        _jsx("p", {
          className: "error-message",
          children: "Unauthorized access. Admin privileges required.",
        }),
      ],
    });
  }
  return _jsxs("div", {
    children: [
      // _jsx(Header, {}),
      _jsx("div", {
        className: "add-category-container",
        children: _jsxs("div", {
          className: "form-wrapper",
          children: [
            _jsx("h1", {
              className: "form-title",
              children: "Add New Category",
            }),
            _jsxs("form", {
              onSubmit: handleSubmit,
              className: "category-form",
              children: [
                error &&
                  _jsx("div", { className: "error-message", children: error }),
                _jsx("div", {
                  className: "form-group",
                  children: _jsxs("label", {
                    children: [
                      "Category Name *",
                      _jsx("input", {
                        type: "text",
                        name: "name",
                        value: category.name,
                        onChange: handleChange,
                        placeholder: "Enter category name",
                      }),
                    ],
                  }),
                }),
                _jsx("div", {
                  className: "form-group",
                  children: _jsxs("label", {
                    children: [
                      "Icon *",
                      _jsxs("select", {
                        name: "icon",
                        value: category.icon,
                        onChange: handleChange,
                        children: [
                          _jsx("option", {
                            value: "",
                            children: "Select an icon",
                          }),
                          _jsx("option", {
                            value: "shopping_basket",
                            children: "Shopping Basket",
                          }),
                          _jsx("option", {
                            value: "laptop",
                            children: "Laptop",
                          }),
                          _jsx("option", {
                            value: "smartphone",
                            children: "Smartphone",
                          }),
                          _jsx("option", { value: "home", children: "Home" }),
                          _jsx("option", {
                            value: "directions_car",
                            children: "Car",
                          }),
                          _jsx("option", {
                            value: "checkroom",
                            children: "Clothing",
                          }),
                        ],
                      }),
                    ],
                  }),
                }),
                _jsx("div", {
                  className: "form-group",
                  children: _jsxs("label", {
                    children: [
                      "Color *",
                      _jsx("input", {
                        type: "color",
                        name: "color",
                        value: category.color,
                        onChange: handleChange,
                      }),
                      _jsx("span", {
                        className: "color-preview",
                        style: { backgroundColor: category.color },
                      }),
                    ],
                  }),
                }),
                _jsx("button", {
                  type: "submit",
                  className: "submit-btn",
                  disabled: loading,
                  children: loading ? "Adding..." : "Add Category",
                }),
              ],
            }),
          ],
        }),
      }),
    ],
  });
};
export default AddCategory;

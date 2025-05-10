import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import Header from "../components/Header";
import api from "../api/Post.js";
import "./Category.css";
import { useNavigate } from "react-router-dom";
const Category = () => {
  const auth = useAuthUser();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/v1/category");
        if (response.data) {
          setCategories(response.data);
        } else {
          alert("No category");
        }
      } catch (error) {
        setError("Failed to load Category");
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, []);
  const handleDeleteCategory = async (categoryId) => {
    try {
      if (!auth?.isAdmin) {
        alert("Only admin can delete a category");
        return;
      }
      const response = await api.delete(`/api/v1/category/${categoryId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      if (response.status === 200) {
        setCategories((prev) => prev.filter((cat) => cat._id !== categoryId));
        alert(response.data.message);
        navigate("/category");
        // alert("Category deleted successfully");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete category");
    }
  };
  const confirmDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      handleDeleteCategory(id);
    }
  };
  //   const handleUpdateCategory= ()=>{
  //     navigate(`/category/update/${categories}`)
  //   }
  if (loading) {
    return _jsxs("div", {
      children: [
        _jsx(Header, {}),
        _jsx("h1", { className: "loading", children: "Loading Orders..." }),
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
  return _jsxs("div", {
    children: [
      _jsx(Header, {}),
      _jsxs("div", {
        className: "category-container",
        children: [
          _jsxs("div", {
            className: "category-header",
            children: [
              _jsx("h1", { children: "Product Categories" }),
              auth?.isAdmin &&
                _jsx("button", {
                  className: "add-category-btn",
                  onClick: () => {
                    navigate("/category/add");
                  },
                  children: "Add New Category",
                }),
            ],
          }),
          _jsx("div", {
            className: "categories-grid",
            children: categories.map((category) =>
              _jsxs(
                "div",
                {
                  className: "category-card",
                  style: { borderColor: category.color },
                  children: [
                    _jsx("div", {
                      className: "category-icon-container",
                      children: _jsx("span", {
                        className: "material-icons category-icon",
                        style: { color: category.color },
                        children: category.icon,
                      }),
                    }),
                    _jsx("h3", {
                      className: "category-name",
                      children: category.name,
                    }),
                    _jsxs("p", {
                      className: "category-date",
                      children: [
                        "Added: ",
                        new Date(category.dataOrdered).toLocaleDateString(),
                      ],
                    }),
                    auth?.isAdmin &&
                      _jsxs("div", {
                        className: "category-actions",
                        children: [
                          _jsx("button", {
                            className: "edit-btn",
                            onClick: () => {
                              navigate(`/category/${category._id}`);
                            },
                            children: _jsx("span", {
                              className: "material-icons",
                              children: " edit ",
                            }),
                          }),
                          _jsx("button", {
                            className: "delete-btn",
                            onClick: () => confirmDelete(category._id),
                            children: _jsx("span", {
                              className: "material-icons",
                              children: " delete ",
                            }),
                          }),
                        ],
                      }),
                  ],
                },
                category._id
              )
            ),
          }),
        ],
      }),
    ],
  });
};
export default Category;

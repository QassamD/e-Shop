import {
  jsx as _jsx,
  jsxs as _jsxs,
  Fragment as _Fragment,
} from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useAuthUser } from "react-auth-kit";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/Post.jsx";
import Header from "../components/Header";
import "./CategoryId.css";
const CategoryId = () => {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const auth = useAuthUser();

  useEffect(() => {
    setLoading(true);
    setError("");
    const fetchCategory = async () => {
      try {
        const response = await api.get(`/api/v1/categories/${id}`);
        if (response.status === 200) {
          setCategory(response.data);
        } else {
          setError("Category not found");
        }
      } catch (err) {
        setError("Failed to load  category");
        alert(error);
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    const fetchProduct = async () => {
      try {
        const response = await api.get("api/v1/products");
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching product:", error);
        setError("Failed to load product");
      }
    };
    if (id) {
      fetchCategory();
      fetchProduct();
    }
  }, [error, id]);
  const handleDelete = async () => {
    if (!auth()?.isAdmin) return;
    try {
      await api.delete(`/api/v1/categories/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      navigate("/category");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete category");
    }
  };
  if (loading) {
    return _jsxs("div", {
      children: [
        // _jsx(Header, {}),
        _jsx("h1", { className: "loading", children: "Loading Orders..." }),
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
  if (!category) {
    return _jsxs("div", {
      className: "error-container",
      children: [
        // _jsx(Header, {}),
        _jsx("p", {
          className: "error-message",
          children: "Category not found",
        }),
      ],
    });
  }
  return _jsxs(_Fragment, {
    children: [
      // _jsx(Header, {}),
      _jsx("div", {
        className: "category-id-container",
        children: _jsxs("div", {
          className: "category-card",
          children: [
            _jsxs("div", {
              className: "category-header",
              children: [
                _jsx("span", {
                  className: "category-icon",
                  style: { color: category.color },
                  children: category.icon,
                }),
                _jsx("h1", { children: category.name }),
              ],
            }),
            _jsxs("div", {
              className: "category-details",
              children: [
                _jsxs("p", {
                  className: "detail-item",
                  children: [
                    _jsx("strong", { children: "Created:" }),
                    " ",
                    new Date(category.dataOrdered).toLocaleDateString(),
                  ],
                }),
                _jsxs("p", {
                  className: "detail-item",
                  children: [
                    _jsx("strong", { children: "Color:" }),
                    " ",
                    _jsx("span", {
                      className: "color-preview",
                      style: { backgroundColor: category.color },
                    }),
                  ],
                }),
              ],
            }),
            _jsxs("div", {
              className: "products-section",
              children: [
                _jsx("h2", { children: "Products in this Category" }),
                products.filter((product) => product.category._id === id)
                  .length === 0
                  ? _jsx("p", {
                      className: "no-products",
                      children: "No products found in this category ",
                    })
                  : _jsx("div", {
                      className: "products-grid",
                      children: products
                        .filter((product) => product.category._id === id)
                        .map((product) =>
                          _jsxs(
                            "div",
                            {
                              className: "product-card",
                              children: [
                                _jsx("h3", {
                                  className: "product-name",
                                  children: product.name,
                                }),
                                _jsx("p", {
                                  className: "product-description",
                                  children: product.description,
                                }),
                                _jsxs("div", {
                                  className: "product-details",
                                  children: [
                                    _jsxs("span", {
                                      className: "product-price",
                                      children: ["$", product.price],
                                    }),
                                    _jsx("span", {
                                      className: `stock-status ${
                                        product.countInStock > 0
                                          ? "in-stock"
                                          : "out-of-stock"
                                      }`,
                                      children:
                                        product.countInStock > 0
                                          ? "In Stock"
                                          : "Out of Stock",
                                    }),
                                  ],
                                }),
                                _jsx("button", {
                                  className: "view-product-btn",
                                  onClick: () =>
                                    navigate(`/card/${product.id}`),
                                  children: "View Details",
                                }),
                              ],
                            },
                            product.id
                          )
                        ),
                    }),
              ],
            }),
            auth()?.isAdmin &&
              _jsxs("div", {
                className: "admin-actions",
                children: [
                  _jsx("button", {
                    className: "edit-btn",
                    onClick: () => navigate(`/category/edit/${category._id}`),
                    children: "Edit Category",
                  }),
                  _jsx("button", {
                    className: "delete-btn",
                    onClick: () => {
                      if (
                        window.confirm(
                          "Are you sure you want to delete this category?"
                        )
                      ) {
                        handleDelete();
                      }
                    },
                    children: "Delete Category",
                  }),
                ],
              }),
          ],
        }),
      }),
    ],
  });
};
export default CategoryId;

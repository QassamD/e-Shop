import {
  jsx as _jsx,
  jsxs as _jsxs,
  Fragment as _Fragment,
} from "react/jsx-runtime";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import Header from "../components/Header";
import api from "../api/Post.js";
import "./card.css";
import { AxiosError } from "axios";
const Card = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();
  const auth = useAuthUser();
  useEffect(() => {
    const fetchData = async () => {
      if (!id || !auth) return;
      try {
        setLoading(true);
        setError(null);
        // Fetch product
        const productResponse = await api.get(`/api/v1/product/${id}`);
        setProduct(productResponse.data);
        // Fetch active order
        try {
          const response = await api.get(
            `/api/v1/order/get/userorder/${auth.userId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("_auth")}`,
              },
            }
          );
          // Check if response data contains an array of orders
          const orders = Array.isArray(response.data?.data)
            ? response.data.data
            : response.data?.data?.orders;
          if (!orders) {
            // alert("Invalid response format");
            throw new Error("Invalid response format");
          }
          console.log(orders);
          const activeOrder = orders.find((order) => order.status === "Placed");
          console.log("activeOrder", activeOrder);
          if (activeOrder) {
            const orderResponse = await api.get(
              `/api/v1/order/${activeOrder._id}`
            );
            setActiveOrder(orderResponse.data);
          }
        } catch (orderError) {
          console.log("Order fetch error:", orderError);
          if (
            orderError instanceof AxiosError &&
            orderError.response?.status === 404
          ) {
            setActiveOrder(null);
          }
          // }
        }
      } catch (error) {
        console.error("Data fetch error:", error);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, auth]);
  const handleAddToCart = async () => {
    if (!product || !auth || !product.countInStock) return;
    try {
      setCartLoading(true);
      // Check stock availability
      if (quantity > product.countInStock) {
        alert("Not enough stock available");
        return;
      }
      let order = activeOrder;
      // Create new order if needed
      if (!order || order.status !== "Placed") {
        const newOrder = await api.post(
          "/api/v1/order",
          {
            orderItems: [],
            status: "Placed",
            user: auth.userId,
          },
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          }
        );
        order = newOrder.data;
        setActiveOrder(order);
      }
      // Check for existing item
      const existingItem = order?.orderItems.find(
        (item) => item.product._id === product._id
      );
      // Update or add item
      if (existingItem) {
        await api.put(`/api/v1/order/${order?._id}/items/${existingItem._id}`, {
          quantity: existingItem.quantity + quantity,
        });
      } else {
        await api.post(`/api/v1/order/${order?._id}/items`, {
          product: product._id,
          quantity,
          price: product.price,
        });
      }
      // Refresh order data
      const updatedOrder = await api.get(`/api/v1/order/${order?._id}`);
      setActiveOrder(updatedOrder.data);
      alert("Product added to cart!");
    } catch (error) {
      console.error("Cart update failed:", error);
      alert(
        error instanceof AxiosError
          ? error.response?.data?.message || "Operation failed"
          : "Request failed"
      );
    } finally {
      setCartLoading(false);
    }
  };
  const handleDeleteProduct = async (productId) => {
    if (!auth?.isAdmin) {
      alert("Only admin can delete products");
      return;
    }
    try {
      await api.delete(`/api/v1/product/${productId}`);
      alert("Product deleted successfully");
      navigate("/");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete product");
    }
  };
  const handleUpdateProduct = () => {
    navigate(`/product/update/${product?._id}`);
  };
  const confirmDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      handleDeleteProduct(id);
    }
  };
  if (loading) {
    return _jsxs("div", {
      className: "loading-container",
      children: [
        _jsx(Header, {}),
        _jsx("p", { children: "Loading product..." }),
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
  if (!product) {
    return _jsxs("div", {
      className: "error-container",
      children: [
        _jsx(Header, {}),
        _jsx("p", { children: "Product not found" }),
      ],
    });
  }
  return _jsxs(_Fragment, {
    children: [
      _jsx(Header, {}),
      _jsx("div", {
        className: "product-card-container",
        children: _jsxs("div", {
          className: "product-card",
          children: [
            _jsx("img", {
              src: product.image || "/images/placeholder.jpg",
              alt: product.name,
              className: "product-image",
              onError: (e) => {
                e.target.src = "/images/placeholder.jpg";
              },
            }),
            _jsxs("div", {
              className: "product-info",
              children: [
                _jsx("h1", {
                  className: "product-name",
                  children: product.name,
                }),
                _jsx("p", {
                  className: "product-description",
                  children: product.richDescription || product.description,
                }),
                _jsxs("p", {
                  className: "product-price",
                  children: ["$", product.price.toFixed(2)],
                }),
                _jsx("div", {
                  className: "stock-status",
                  children:
                    product.countInStock > 0
                      ? _jsxs(_Fragment, {
                          children: [
                            _jsxs("div", {
                              className: "quantity-selector",
                              children: [
                                _jsx("label", { children: "Quantity:" }),
                                _jsx("input", {
                                  type: "number",
                                  min: "1",
                                  max: product.countInStock,
                                  value: quantity,
                                  onChange: (e) =>
                                    setQuantity(
                                      Math.max(1, parseInt(e.target.value) || 1)
                                    ),
                                }),
                              ],
                            }),
                            _jsx("button", {
                              className: "add-to-cart-btn",
                              onClick: handleAddToCart,
                              disabled: cartLoading || !auth,
                              children: cartLoading
                                ? "Adding..."
                                : "Add to Cart",
                            }),
                          ],
                        })
                      : _jsx("p", {
                          className: "out-of-stock",
                          children: "Out of Stock",
                        }),
                }),
                auth?.isAdmin &&
                  _jsxs("div", {
                    className: "admin-controls",
                    children: [
                      _jsx("button", {
                        onClick: handleUpdateProduct,
                        children: "Update Product",
                      }),
                      _jsx("button", {
                        onClick: () => confirmDelete(product._id),
                        children: "Delete Product",
                      }),
                    ],
                  }),
                _jsxs("div", {
                  className: "product-meta",
                  children: [
                    _jsxs("p", {
                      className: "product-category",
                      children: [
                        _jsx("strong", { children: "Category:" }),
                        " ",
                        typeof product.category === "string"
                          ? product.category
                          : product.category?.name,
                      ],
                    }),
                    product.rating &&
                      _jsxs("p", {
                        className: "product-rating",
                        children: [
                          _jsx("strong", { children: "Rating:" }),
                          " ",
                          product.rating.toFixed(1),
                          " \u2B50",
                          product.numReviews &&
                            ` (${product.numReviews} reviews)`,
                        ],
                      }),
                    product.brand &&
                      _jsxs("p", {
                        className: "product-brand",
                        children: [
                          _jsx("strong", { children: "Brand:" }),
                          " ",
                          product.brand,
                        ],
                      }),
                  ],
                }),
              ],
            }),
          ],
        }),
      }),
    ],
  });
};
export default Card;

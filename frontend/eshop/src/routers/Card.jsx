import {
  jsx as _jsx,
  jsxs as _jsxs,
  Fragment as _Fragment,
} from "react/jsx-runtime";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthUser } from "react-auth-kit";
import Header from "../components/Header";
import api from "../api/Post";
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
  const getAuth = useAuthUser();

  const storedAuth = localStorage.getItem("_auth");
  if (!storedAuth) {
    console.log("No stored auth data found"); // Debug log
    return null;
  }

  const parsedAuth = JSON.parse(storedAuth);
  if (!parsedAuth.token) {
    console.log("No token found in stored auth"); // Debug log
    return null;
  }

  // Validated auth state with type checking
  const getValidatedAuth = () => {
    const auth = getAuth();
    console.log("Auth state:", auth); // Debug log
    if (!auth) {
      console.log("No auth data found"); // Debug log
      return null;
    }

    if (!parsedAuth.user?.id) {
      console.log("No user ID found in stored auth"); // Debug log
      return null;
    }

    return {
      token: parsedAuth.token,
      user: {
        _id: parsedAuth.user.id,
        isAdmin: parsedAuth.user.isAdmin,
      },
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch product data
        const productResponse = await api.get(`/api/v1/products/${id}`);
        setProduct(productResponse.data);

        // Check authenticated user
        const auth = getValidatedAuth();
        if (!auth) return;

        // Fetch user orders
        try {
          console.log("Fetching orders for user:", auth.user._id);
          const response = await api.get(
            `/api/v1/orders/get/userorder/${auth.user._id}`,
            {
              headers: {
                Authorization: `Bearer ${parsedAuth.token}`,
              },
            }
          );

          console.log("response", response.data?.data);

          const orders = response.data?.data || [];
          console.log("Fetched orders:", orders);

          // Find the most recent placed order
          const placedOrder = orders.find((order) => order.status === "Placed");
          console.log("Found placed order:", placedOrder);

          if (placedOrder) {
            console.log("Setting active order:", placedOrder);
            setActiveOrder(placedOrder);
          } else {
            console.log("No placed order found");
            setActiveOrder(null);
          }
        } catch (orderError) {
          console.error("Order fetch error:", orderError);
          setActiveOrder(null);
        }
      } catch (error) {
        console.error("Data fetch error:", error);
        setError(
          error.response?.data?.message || "Failed to load product data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAddToCart = async () => {
    const auth = getValidatedAuth();
    if (!auth) {
      alert("Please login to add items to cart");
      navigate("/user/login");
      return;
    }

    if (!product || !product.countInStock) {
      alert("Product is out of stock");
      return;
    }

    try {
      setCartLoading(true);

      // Validate stock availability
      if (quantity < 1 || quantity > product.countInStock) {
        alert(`Please select between 1-${product.countInStock} items`);
        return;
      }

      let order = activeOrder;
      console.log("Initial activeOrder:", activeOrder);

      // Check for existing placed order
      if (!order || order.status !== "Placed") {
        console.log("No active order found, fetching orders...");
        try {
          const response = await api.get(
            `/api/v1/orders/get/userorder/${auth.user._id}`,
            {
              headers: {
                Authorization: `Bearer ${parsedAuth.token}`,
              },
            }
          );
          console.log("auth.id", auth.user._id);

          const orders = response.data?.data || [];
          console.log("Fetched orders:", orders);
          order = orders.find((o) => o.status === "Placed");
          console.log("Found placed order:", order);
        } catch (error) {
          console.error("Error fetching orders:", error);
        }
      }

      // Create new order only if no placed order exists
      if (!order) {
        console.log("No placed order found, creating new order...");
        const newOrder = await api.post(
          "/api/v1/orders",
          {
            orderItems: [],
            status: "Placed",
            user: auth.user._id,
          },
          {
            headers: {
              Authorization: `Bearer ${parsedAuth.token}`,
            },
          }
        );
        order = newOrder.data;
        console.log("Created new order:", order);
        setActiveOrder(order);
      } else {
        console.log("Using existing order:", order);
      }

      // Update existing item or add new
      const existingItem = order.orderItems?.find(
        (item) => item.product?._id === product._id
      );

      if (existingItem) {
        await api.put(
          `/api/v1/orders/${order._id}/items/${existingItem._id}`,
          {
            quantity: existingItem.quantity + quantity,
          },
          {
            headers: {
              Authorization: `Bearer ${parsedAuth.token}`,
            },
          }
        );
      } else {
        await api.post(
          `/api/v1/orders/${order._id}/items`,
          {
            product: product._id,
            quantity,
            price: product.price,
          },
          {
            headers: {
              Authorization: `Bearer ${parsedAuth.token}`,
            },
          }
        );
      }

      // Refresh order data
      const updatedOrder = await api.get(`/api/v1/orders/${order._id}`, {
        headers: {
          Authorization: `Bearer ${parsedAuth.token}`,
        },
      });
      setActiveOrder(updatedOrder.data);
      alert("Product added to cart!");
    } catch (error) {
      console.error("Cart update failed:", error);
      alert(
        error instanceof AxiosError
          ? error.response?.data?.message || "Operation failed"
          : "Failed to update cart"
      );
    } finally {
      setCartLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    const auth = getValidatedAuth();
    if (!auth?.user.isAdmin) {
      alert("Administrator privileges required");
      return;
    }

    try {
      await api.delete(`/api/v1/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${parsedAuth.token}`,
        },
      });
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
    if (window.confirm("Permanently delete this product?")) {
      handleDeleteProduct(id);
    }
  };

  if (loading) {
    return _jsx("div", {
      className: "loading-container",
      children: _jsx("p", { children: "Loading product details..." }),
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

  if (!product) {
    return _jsxs("div", {
      className: "error-container",
      children: [
        // _jsx(Header, {}),
        _jsx("p", { children: "Product not found" }),
      ],
    });
  }

  console.log("admin", getAuth().isAdmin);

  return _jsxs(_Fragment, {
    children: [
      _jsx("div", {
        className: "image-container",
        children: _jsx("img", {
          src: product.image || "/frontend/eshop/public/a.png",
          alt: product.name,
          className: "product-image",
          onError: (e) => {
            e.target.src = "/frontend/eshop/public/a.png";
            e.target.classList.add("default-image");
          },
        }),
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
          _jsx("p", {
            className: "product-price",
            children: `$${product.price.toFixed(2)}`,
          }),
          _jsx("div", {
            className: "stock-controls",
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
                            max: product.countInStock.toString(),
                            value: quantity,
                            onChange: (e) => {
                              const value = Math.max(
                                1,
                                Math.min(
                                  product.countInStock,
                                  Number(e.target.value) || 1
                                )
                              );
                              setQuantity(value);
                            },
                          }),
                        ],
                      }),
                      _jsx("button", {
                        className: `add-to-cart-btn ${
                          cartLoading ? "loading" : ""
                        }`,
                        onClick: handleAddToCart,
                        disabled: cartLoading,
                        children: cartLoading ? "Adding..." : "Add to Cart",
                      }),
                    ],
                  })
                : _jsx("p", {
                    className: "out-of-stock",
                    children: "Out of Stock",
                  }),
          }),
          getAuth()?.isAdmin &&
            _jsxs("div", {
              className: "admin-controls",
              children: [
                _jsx("button", {
                  className: "update-btn",
                  onClick: handleUpdateProduct,
                  children: "Edit Product",
                }),
                _jsx("button", {
                  className: "delete-btn",
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
                  "Category: ",
                  product.category?.name || product.category || "Uncategorized",
                ],
              }),
              product.brand &&
                _jsxs("p", {
                  className: "product-brand",
                  children: ["Brand: ", product.brand],
                }),
              product.rating &&
                _jsxs("p", {
                  className: "product-rating",
                  children: [
                    "Rating: ",
                    product.rating.toFixed(1),
                    " ★ (",
                    product.numReviews,
                    " reviews)",
                  ],
                }),
            ],
          }),
        ],
      }),
    ],
  });
};

export default Card;

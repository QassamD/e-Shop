import {
  jsx as _jsx,
  jsxs as _jsxs,
  Fragment as _Fragment,
} from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useAuthUser } from "react-auth-kit";
import api from "../api/Post.jsx";
import Header from "../components/Header";
import "./Orders.css";
import { useNavigate } from "react-router-dom";

const Orders = () => {
  const auth = useAuthUser();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // console.log(auth().id);
        const storedAuth = localStorage.getItem("_auth");
        if (!storedAuth || !auth().id) {
          setError("Please login to view orders");
          return;
        }

        const parsedAuth = JSON.parse(storedAuth);
        if (!parsedAuth.token) {
          setError("Authentication token not found");
          return;
        }
        console.log(parsedAuth.token);
        const response = await api.get(
          `/api/v1/orders/get/userorder/${auth().id}`,
          {
            headers: {
              Authorization: `Bearer ${parsedAuth.token}`,
            },
          }
        );
        if (response.status === 200 && Array.isArray(response.data?.data)) {
          setOrders(response.data.data);
        } else {
          setError("Invalid orders data format");
          setOrders([]); // Ensure we always have an array
        }
      } catch (error) {
        console.error("Failed to load Orders", error);
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [auth().id]);
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      const storedAuth = localStorage.getItem("_auth");
      if (!storedAuth) {
        setError("Authentication token not found");
        return;
      }

      const parsedAuth = JSON.parse(storedAuth);
      if (!parsedAuth.token) {
        setError("Authentication token not found");
        return;
      }

      await api.delete(`/api/v1/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${parsedAuth.token}`,
        },
      });
      setOrders(orders.filter((order) => order._id !== orderId));
    } catch (error) {
      console.error("Delete failed:", error);
      setError("Failed to delete order");
    }
  };
  // const handleConfirmOrder = async (orderId: string) => {
  //   try {
  //     await api.put(
  //       `/api/v1/order/${orderId}`,
  //       {},
  //       {
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  //         },
  //       }
  //     );
  //     setOrders(
  //       orders.map((order) => (order.id === orderId ? { ...order } : order))
  //     );
  //   } catch (error) {
  //     console.error("Confirm failed:", error);
  //     setError("Failed to confirm order");
  //   }
  // };
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
  return _jsxs(_Fragment, {
    children: [
      // _jsx(Header, {}),
      _jsxs("div", {
        className: "orders-container",
        children: [
          _jsxs("h1", {
            className: "orders-title",
            children: [auth().name, "'s Orders"],
          }),
          orders.length === 0
            ? _jsx("p", { className: "no-orders", children: "No orders found" })
            : _jsx("div", {
                className: "orders-list",
                children: orders.map((order) =>
                  _jsxs(
                    "div",
                    {
                      className: "order-card",
                      children: [
                        _jsxs("div", {
                          className: "order-header",
                          children: [
                            _jsxs("span", {
                              className: "order-id",
                              title: `Full Order ID: ${order._id}`,
                              children: [
                                "Order #",
                                order._id.slice(0, 8).toUpperCase(),
                              ],
                            }),
                            _jsx("span", {
                              className: `order-status ${order.status.toLowerCase()}`,
                              children: order.status,
                            }),
                          ],
                        }),
                        _jsxs("div", {
                          className: "order-footer",
                          children: [
                            _jsxs("div", {
                              className: "order-actions",
                              children: [
                                _jsx("button", {
                                  className: "confirm-button",
                                  onClick: () => {
                                    // handleConfirmOrder(order.id);
                                    navigate(
                                      `/order/${auth().id}/confirm/${order._id}`
                                    );
                                  },
                                  children: "Confirm Order",
                                }),
                                _jsx("button", {
                                  className: "delete-button",
                                  onClick: () => handleDeleteOrder(order._id),
                                  children: "Delete Order",
                                }),
                              ],
                            }),
                            _jsxs("div", {
                              className: "order-meta",
                              children: [
                                _jsxs("span", {
                                  className: "total-price",
                                  children: [
                                    "Total: $",
                                    order.totalPrice.toFixed(2),
                                  ],
                                }),
                                _jsxs("span", {
                                  className: "order-date",
                                  children: [
                                    "Ordered on:",
                                    " ",
                                    new Date(
                                      order.dataOrdered
                                    ).toLocaleDateString(),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    },
                    order._id
                  )
                ),
              }),
        ],
      }),
    ],
  });
};
export default Orders;

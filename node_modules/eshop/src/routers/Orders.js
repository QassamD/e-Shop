import {
  jsx as _jsx,
  jsxs as _jsxs,
  Fragment as _Fragment,
} from "react/jsx-runtime";
import { useState, useEffect } from "react";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import api from "../api/Post.js";
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
      // console.log(auth?.userId);
      // console.log(localStorage.getItem("_auth"));
      try {
        setLoading(true);
        const response = await api.get(
          `/api/v1/order/get/userorder/${auth?.userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("_auth")}`,
            },
          }
        );
        if (response.status === 200 && Array.isArray(response.data?.data)) {
          setOrders(response.data.data);
        } else {
          setError("Invalid orders data format");
          setOrders([]); // Ensure we always have an array
        }
        // console.log("response:", response.data);
      } catch (error) {
        console.error("Failed to load Orders", error);
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [auth?.userId]);
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await api.delete(`/api/v1/order/${orderId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
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
  return _jsxs(_Fragment, {
    children: [
      _jsx(Header, {}),
      _jsxs("div", {
        className: "orders-container",
        children: [
          _jsxs("h1", {
            className: "orders-title",
            children: [auth?.name, "'s Orders"],
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
                                      `/order/${auth?.userId}/confirm/${order._id}`
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

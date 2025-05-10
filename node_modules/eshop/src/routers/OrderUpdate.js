import {
  jsx as _jsx,
  jsxs as _jsxs,
  Fragment as _Fragment,
} from "react/jsx-runtime";
import { useEffect, useState } from "react";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/Post.js";
import Header from "../components/Header";
import "./OrderUpdate.css";
const OrderUpdate = () => {
  const { id } = useParams();
  const auth = useAuthUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locationError, setLocationError] = useState("");
  const navigate = useNavigate();
  const isAdmin = auth?.isAdmin || false;
  const [orderForm, setOrderForm] = useState({
    _id: "",
    orderItems: [],
    totalPrice: 0,
    shippingAddress1: "",
    shippingAddress2: "",
    city: "",
    zip: "",
    country: "",
    phone: "",
    status: "",
    dataOrdered: "",
    user: auth
      ? {
          userId: auth.userId,
          name: auth.name,
          isAdmin: auth.isAdmin,
        }
      : {
          userId: "",
          name: "",
          isAdmin: false,
        },
  });
  const iconOptions = [
    "Placed",
    "Processing",
    "Shipped",
    "OutForDelivery",
    "Delivered",
    "Canceled",
  ];
  useEffect(() => {
    const fetchOrderAndLocation = async () => {
      setLoading(true);
      setError("");
      try {
        if (id) {
          const response = await api.get(`api/v1/order/${id}`);
          const orderData = response.data;
          setOrderForm({
            ...orderData,
            user: auth
              ? {
                  userId: auth.userId,
                  name: auth.name,
                  isAdmin: auth.isAdmin,
                }
              : orderData.user,
          });
          // Fetch location only for new orders or non-admin users with Placed status
          if (
            !isAdmin &&
            orderData.status === "Placed" &&
            !orderData.shippingAddress1
          ) {
            await getGeolocation();
          }
        }
      } catch (error) {
        console.error("Error fetching Order:", error);
      } finally {
        setLoading(false);
      }
    };
    const getGeolocation = async () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
              );
              const data = await response.json();
              setOrderForm((prev) => ({
                ...prev,
                shippingAddress1: data.address?.road || "",
                city: data.address?.city || "",
                country: data.address?.country || "",
                zip: data.address?.postcode || "",
              }));
            } catch (error) {
              setLocationError("Failed to fetch address details");
            }
          },
          (error) => {
            setLocationError(
              "Please enable location access to autofill address"
            );
          }
        );
      } else {
        setLocationError("Geolocation is not supported by your browser");
      }
    };
    fetchOrderAndLocation();
  }, [auth, id, isAdmin]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrderForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleItemChange = (index, newQuantity) => {
    if (!isAdmin && orderForm.status !== "Placed") return;
    const updatedItems = [...orderForm.orderItems];
    updatedItems[index].quantity = newQuantity;
    const newTotal = updatedItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    setOrderForm({
      ...orderForm,
      orderItems: updatedItems,
      totalPrice: newTotal,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const orderData = {
        ...orderForm,
        status: isAdmin
          ? orderForm.status
          : orderForm.status === "Placed"
          ? "Processing"
          : orderForm.status,
        orderItems: orderForm.orderItems.map((item) => ({
          _id: item._id,
          product: item.product?._id,
          quantity: item.quantity,
        })),
        user: auth?.userId,
      };
      const response = await api.put(`/api/v1/order/${id}`, orderData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      if (response.status === 200) {
        navigate(isAdmin ? `/admin/orders` : `/payment/${orderForm._id}`);
      }
    } catch (error) {
      setError("Failed to update order");
      console.log("Update Error", error);
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteItem = async (itemId, index) => {
    if (!isAdmin && orderForm.status !== "Placed") return;
    try {
      const updatedItems = orderForm.orderItems.filter((_, i) => i !== index);
      const newTotal = updatedItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );
      setOrderForm({
        ...orderForm,
        orderItems: updatedItems,
        totalPrice: newTotal,
      });
      await api.delete(`/api/v1/order/${id}/items/${itemId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
    } catch (error) {
      console.error("Delete item failed:", error);
      setOrderForm({ ...orderForm });
    }
  };
  const canEdit = isAdmin || orderForm.status === "Placed";
  const isConfirmOrder = !isAdmin && orderForm.status === "Placed";
  if (loading) {
    return _jsxs("div", {
      children: [
        _jsx(Header, {}),
        _jsx("h1", { className: "loading", children: "Loading Order..." }),
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
  return _jsxs(_Fragment, {
    children: [
      _jsx(Header, {}),
      _jsxs("div", {
        className: "order-update-container",
        children: [
          _jsxs("h2", { children: ["Order #", id] }),
          _jsxs("form", {
            onSubmit: handleSubmit,
            className: "order-form",
            children: [
              _jsxs("div", {
                className: "form-section",
                children: [
                  _jsx("h3", { children: "Order Items" }),
                  orderForm.orderItems.map((item, index) =>
                    _jsxs(
                      "div",
                      {
                        className: "order-item",
                        children: [
                          _jsx("span", {
                            className: "item-name",
                            children: item.product?.name,
                          }),
                          _jsxs("div", {
                            className: "item-controls",
                            children: [
                              _jsx("input", {
                                type: "number",
                                min: "1",
                                value: item.quantity,
                                onChange: (e) =>
                                  handleItemChange(
                                    index,
                                    parseInt(e.target.value)
                                  ),
                                disabled: !canEdit,
                              }),
                              _jsxs("span", {
                                className: "item-price",
                                children: [
                                  "$",
                                  (item.product?.price * item.quantity).toFixed(
                                    2
                                  ),
                                ],
                              }),
                              canEdit &&
                                _jsx("button", {
                                  type: "button",
                                  className: "delete-item-btn",
                                  onClick: () =>
                                    handleDeleteItem(item._id, index),
                                  children: "Delete",
                                }),
                            ],
                          }),
                        ],
                      },
                      index
                    )
                  ),
                ],
              }),
              _jsxs("div", {
                className: "order-total",
                children: [
                  _jsx("span", { children: "Total:" }),
                  _jsxs("span", {
                    children: ["$", orderForm.totalPrice.toFixed(2)],
                  }),
                ],
              }),
              _jsxs("div", {
                className: "form-section",
                children: [
                  _jsx("h3", { children: "Order Status" }),
                  _jsx("select", {
                    name: "status",
                    value: orderForm.status,
                    onChange: handleChange,
                    className: "status-select",
                    disabled: !isAdmin,
                    children: iconOptions.map((status) =>
                      _jsx(
                        "option",
                        { value: status, children: status },
                        status
                      )
                    ),
                  }),
                ],
              }),
              _jsxs("div", {
                className: "form-section",
                children: [
                  _jsx("h3", { children: "Shipping Information" }),
                  _jsxs("div", {
                    className: "form-grid",
                    children: [
                      _jsxs("div", {
                        className: "form-group",
                        children: [
                          _jsx("label", { children: "Address Line 1:" }),
                          _jsx("input", {
                            type: "text",
                            name: "shippingAddress1",
                            value: orderForm.shippingAddress1,
                            onChange: handleChange,
                            required: true,
                            readOnly: !canEdit,
                          }),
                        ],
                      }),
                      _jsxs("div", {
                        className: "form-group",
                        children: [
                          _jsx("label", { children: "City:" }),
                          _jsx("input", {
                            type: "text",
                            name: "city",
                            value: orderForm.city,
                            onChange: handleChange,
                            required: true,
                            readOnly: !canEdit,
                          }),
                        ],
                      }),
                      _jsxs("div", {
                        className: "form-group",
                        children: [
                          _jsx("label", { children: "Zip Code:" }),
                          _jsx("input", {
                            type: "text",
                            name: "zip",
                            value: orderForm.zip,
                            onChange: handleChange,
                            required: true,
                            readOnly: !canEdit,
                          }),
                        ],
                      }),
                      _jsxs("div", {
                        className: "form-group",
                        children: [
                          _jsx("label", { children: "Country:" }),
                          _jsx("input", {
                            type: "text",
                            name: "country",
                            value: orderForm.country,
                            onChange: handleChange,
                            required: true,
                            readOnly: !canEdit,
                          }),
                        ],
                      }),
                      _jsxs("div", {
                        className: "form-group",
                        children: [
                          _jsx("label", { children: "Phone:" }),
                          _jsx("input", {
                            type: "tel",
                            name: "phone",
                            value: orderForm.phone,
                            onChange: handleChange,
                            required: true,
                            readOnly: !canEdit,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              locationError &&
                _jsx("div", {
                  className: "error-message location-error",
                  children: locationError,
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
                    className: "submit-btn",
                    disabled:
                      loading || (!isAdmin && orderForm.status !== "Placed"),
                    children: loading
                      ? "Processing..."
                      : isAdmin
                      ? "Update Order"
                      : isConfirmOrder
                      ? "Confirm Order"
                      : "Order Confirmed",
                  }),
                ],
              }),
              error &&
                _jsx("div", { className: "error-message", children: error }),
            ],
          }),
        ],
      }),
    ],
  });
};
export default OrderUpdate;

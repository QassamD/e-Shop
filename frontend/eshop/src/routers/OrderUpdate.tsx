import { useEffect, useState } from "react";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/Post.jsx";
import Header from "../components/Header";
import "./OrderUpdate.css";

interface User {
  userId: string;
  name: string;
  isAdmin: boolean;
}

interface Product {
  _id: string;
  name: string;
  price: number;
}

interface OrderItem {
  _id: string;
  product: Product;
  quantity: number;
}

interface Order {
  _id: string;
  orderItems: OrderItem[];
  totalPrice: number;
  shippingAddress1: string;
  shippingAddress2: string;
  city: string;
  zip: string;
  country: string;
  phone: string;
  status: string;
  user: User;
  dataOrdered: string;
}

interface Position {
  coords: {
    latitude: number;
    longitude: number;
  };
}

const OrderUpdate = () => {
  const { id } = useParams<{ id: string }>();
  const auth = useAuthUser<User>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState("");
  const navigate = useNavigate();
  const isAdmin = auth?.isAdmin || false;

  const [orderForm, setOrderForm] = useState<Order>({
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
          async (position: Position) => {
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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setOrderForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index: number, newQuantity: number) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
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

  const handleDeleteItem = async (itemId: string, index: number) => {
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
    return (
      <div>
        <Header />
        <h1 className="loading">Loading Order...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <Header />
        <p className="error-message">{error}</p>
      </div>
    );
  }

  if (!auth) {
    return (
      <div className="error-container">
        <Header />
        <p className="error-message">
          You need to be logged in to access this page
        </p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="order-update-container">
        <h2>Order #{id}</h2>

        <form onSubmit={handleSubmit} className="order-form">
          <div className="form-section">
            <h3>Order Items</h3>
            {orderForm.orderItems.map((item, index) => (
              <div key={index} className="order-item">
                <span className="item-name">{item.product?.name}</span>
                <div className="item-controls">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(index, parseInt(e.target.value))
                    }
                    disabled={!canEdit}
                  />
                  <span className="item-price">
                    ${(item.product?.price * item.quantity).toFixed(2)}
                  </span>
                  {canEdit && (
                    <button
                      type="button"
                      className="delete-item-btn"
                      onClick={() => handleDeleteItem(item._id, index)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="order-total">
            <span>Total:</span>
            <span>${orderForm.totalPrice.toFixed(2)}</span>
          </div>

          <div className="form-section">
            <h3>Order Status</h3>
            <select
              name="status"
              value={orderForm.status}
              onChange={handleChange}
              className="status-select"
              disabled={!isAdmin}
            >
              {iconOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="form-section">
            <h3>Shipping Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Address Line 1:</label>
                <input
                  type="text"
                  name="shippingAddress1"
                  value={orderForm.shippingAddress1}
                  onChange={handleChange}
                  required
                  readOnly={!canEdit}
                />
              </div>
              <div className="form-group">
                <label>City:</label>
                <input
                  type="text"
                  name="city"
                  value={orderForm.city}
                  onChange={handleChange}
                  required
                  readOnly={!canEdit}
                />
              </div>
              <div className="form-group">
                <label>Zip Code:</label>
                <input
                  type="text"
                  name="zip"
                  value={orderForm.zip}
                  onChange={handleChange}
                  required
                  readOnly={!canEdit}
                />
              </div>
              <div className="form-group">
                <label>Country:</label>
                <input
                  type="text"
                  name="country"
                  value={orderForm.country}
                  onChange={handleChange}
                  required
                  readOnly={!canEdit}
                />
              </div>
              <div className="form-group">
                <label>Phone:</label>
                <input
                  type="tel"
                  name="phone"
                  value={orderForm.phone}
                  onChange={handleChange}
                  required
                  readOnly={!canEdit}
                />
              </div>
            </div>
          </div>

          {locationError && (
            <div className="error-message location-error">{locationError}</div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={loading || (!isAdmin && orderForm.status !== "Placed")}
            >
              {loading
                ? "Processing..."
                : isAdmin
                ? "Update Order"
                : isConfirmOrder
                ? "Confirm Order"
                : "Order Confirmed"}
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}
        </form>
      </div>
    </>
  );
};

export default OrderUpdate;

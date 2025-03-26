import { useState, useEffect } from "react";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import api from "../api/Post";
import Header from "../components/Header";
import "./Orders.css";
import { useNavigate } from "react-router-dom";

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
  product: Product | null;
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

const Orders = () => {
  const auth = useAuthUser<User>();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
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

  const handleDeleteOrder = async (orderId: string) => {
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
    return (
      <div>
        <Header />
        <h1 className="loading">Loading Orders...</h1>
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

  return (
    <>
      <Header />
      <div className="orders-container">
        <h1 className="orders-title">{auth?.name}'s Orders</h1>

        {orders.length === 0 ? (
          <p className="no-orders">No orders found</p>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <span
                    className="order-id"
                    title={`Full Order ID: ${order._id}`}
                  >
                    Order #{order._id.slice(0, 8).toUpperCase()}
                  </span>
                  <span
                    className={`order-status ${order.status.toLowerCase()}`}
                  >
                    {order.status}
                  </span>
                  {/* <div className="order-items">
                    <h3>Items:</h3>
                    {order.orderItems.map((item, index) => (
                      <div key={index} className="order-item">
                        <span className="item-name">
                          {item.product?.name || "Unknown Product"}
                        </span>
                        <span className="item-quantity">
                          Qty: {item.quantity}
                        </span>
                        <span className="item-price">
                          Price: ${item.product?.price.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div> */}
                </div>
                {/* ... existing order details */}

                <div className="order-footer">
                  <div className="order-actions">
                    <button
                      className="confirm-button"
                      onClick={() => {
                        // handleConfirmOrder(order.id);
                        navigate(`/order/${auth?.userId}/confirm/${order._id}`);
                      }}
                    >
                      Confirm Order
                    </button>

                    <button
                      className="delete-button"
                      onClick={() => handleDeleteOrder(order._id)}
                    >
                      Delete Order
                    </button>
                  </div>
                  <div className="order-meta">
                    <span className="total-price">
                      Total: ${order.totalPrice.toFixed(2)}
                    </span>
                    <span className="order-date">
                      Ordered on:{" "}
                      {new Date(order.dataOrdered).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Orders;

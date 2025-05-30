import {
  jsx as _jsx,
  jsxs as _jsxs,
  Fragment as _Fragment,
} from "react/jsx-runtime";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import Header from "../components/Header";
import api from "../api/Post.jsx";
import "./card.css";
import { AxiosError } from "axios";

interface Product {
  _id: string;
  name: string;
  description: string;
  richDescription?: string;
  image?: string;
  images?: string[];
  brand?: string;
  price: number;
  category: string | { name: string };
  countInStock: number;
  rating?: number;
  numReviews?: number;
  isFeatured?: boolean;
  dateCreated?: string;
}

interface User {
  userId: string;
  name: string;
  isAdmin: boolean;
  token: string;
}

interface OrderItem {
  _id: string;
  quantity: number;
  product: Product;
}

interface Order {
  _id: string;
  orderItems: OrderItem[];
  totalPrice: number;
  status: string;
  user: User | null;
}

const Card = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();
  const auth = useAuthUser<User>();

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
            ? (response.data.data as Order[])
            : response.data?.data?.orders;

          if (!orders) {
            // alert("Invalid response format");
            throw new Error("Invalid response format");
          }
          console.log(orders);
          const activeOrder = orders.find(
            (order: Order) => order.status === "Placed"
          );
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

  const handleDeleteProduct = async (productId: string) => {
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

  const confirmDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      handleDeleteProduct(id);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Header />
        <p>Loading product...</p>
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

  if (!product) {
    return (
      <div className="error-container">
        <Header />
        <p>Product not found</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="product-card-container">
        <div className="product-card">
          <img
            src={product.image || "/images/placeholder.jpg"}
            alt={product.name}
            className="product-image"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/placeholder.jpg";
            }}
          />
          <div className="product-info">
            <h1 className="product-name">{product.name}</h1>
            <p className="product-description">
              {product.richDescription || product.description}
            </p>
            <p className="product-price">${product.price.toFixed(2)}</p>

            <div className="stock-status">
              {product.countInStock > 0 ? (
                <>
                  <div className="quantity-selector">
                    <label>Quantity:</label>
                    <input
                      type="number"
                      min="1"
                      max={product.countInStock}
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                      }
                    />
                  </div>
                  <button
                    className="add-to-cart-btn"
                    onClick={handleAddToCart}
                    disabled={cartLoading || !auth}
                  >
                    {cartLoading ? "Adding..." : "Add to Cart"}
                  </button>
                </>
              ) : (
                <p className="out-of-stock">Out of Stock</p>
              )}
            </div>

            {auth?.isAdmin && (
              <div className="admin-controls">
                <button onClick={handleUpdateProduct}>Update Product</button>
                <button onClick={() => confirmDelete(product._id)}>
                  Delete Product
                </button>
              </div>
            )}

            <div className="product-meta">
              <p className="product-category">
                <strong>Category:</strong>{" "}
                {typeof product.category === "string"
                  ? product.category
                  : product.category?.name}
              </p>
              {product.rating && (
                <p className="product-rating">
                  <strong>Rating:</strong> {product.rating.toFixed(1)} ⭐
                  {product.numReviews && ` (${product.numReviews} reviews)`}
                </p>
              )}
              {product.brand && (
                <p className="product-brand">
                  <strong>Brand:</strong> {product.brand}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Card;

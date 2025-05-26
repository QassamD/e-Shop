import React, { useState, useEffect, useRef } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useParams, useNavigate } from "react-router-dom";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import api from "../api/Post.jsx";
import Header from "../components/Header";

interface User {
  userId: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface Order {
  _id: string;
  totalPrice: number;
  user: User;
}

const PaymentForm = () => {
  const { id } = useParams<{ id: string }>();
  const auth = useAuthUser<User>();
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (isMounted.current) setLoading(true);
        const response = await api.get(`api/v1/order/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("_auth")}`,
          },
        });
        if (isMounted.current) setOrder(response.data);
      } catch (error) {
        if (isMounted.current) setErrorMessage("Failed to load order details");
        console.error(error);
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };
    if (id) fetchOrder();
  }, [id]);

  useEffect(() => {
    if (auth && isMounted.current) {
      setName(auth.name);
      setEmail(auth.email);
    }
  }, [auth]);

  useEffect(() => {
    const unloadHandler = (e: BeforeUnloadEvent) => {
      if (isProcessing) {
        e.preventDefault();
        e.returnValue = "Payment in progress - are you sure?";
      }
    };
    window.addEventListener("beforeunload", unloadHandler);
    return () => window.removeEventListener("beforeunload", unloadHandler);
  }, [isProcessing]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const cardElement = elements?.getElement(CardElement);

    if (!stripe || !elements || !order || !cardElement) {
      setErrorMessage("Payment system is not ready");
      return;
    }

    try {
      if (isMounted.current) {
        setIsProcessing(true);
        setErrorMessage(null);
      }

      // Create payment intent first
      const { data } = await api.post(`/api/v1/create-stripe-payment-intent`, {
        amount: Math.round(order.totalPrice * 100),
        currency: "usd",
        metadata: {
          orderId: order._id,
          userId: auth?.userId || "unknown",
        },
      });

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: { name, email },
          },
        }
      );

      // Check for errors
      if (error) throw error;

      await api.put(
        `api/v1/order/${order._id}/status`,
        { status: "Processing" }, // Adjust payload according to your backend
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("_auth")}`,
          },
        }
      );
      // Handle successful payment redirect here
      navigate(`/order/${auth?.userId}/confirm/${order._id}`);
      alert(`Payment succeeded! ${paymentIntent?.id}`);
    } catch (error) {
      if (isMounted.current) {
        const message =
          error instanceof Error ? error.message : "Payment failed";
        setErrorMessage(message);
      }
    } finally {
      if (isMounted.current) {
        setIsProcessing(false);
        navigate("/order/" + auth?.userId + "/confirm/" + order?._id);
      }
    }
  };

  if (!stripe || !elements) {
    return (
      <div>
        <Header />
        <h1 className="loading">Initializing payment system...</h1>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <Header />
        <h1 className="loading">Loading Payment Details...</h1>
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
      <div className="payment-container">
        <form onSubmit={handleSubmit} className="payment-form">
          <h2 className="payment-title">Payment for Order #{id}</h2>

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input type="text" id="name" value={name} readOnly />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" value={email} readOnly />
          </div>

          <div className="form-group">
            <label>Card Details</label>
            <div className="card-element-wrapper">
              {/* @ts-ignore */}
              <CardElement
                options={{
                  hidePostalCode: true,
                  classes: { base: "card-element-styles" },
                }}
              />
            </div>
          </div>

          {errorMessage && <div className="error-message">{errorMessage}</div>}

          <button
            type="submit"
            disabled={!stripe || isProcessing || !order || loading}
            className="pay-button"
          >
            {isProcessing ? (
              <div className="spinner"></div>
            ) : (
              `Pay $${order?.totalPrice.toFixed(2)}`
            )}
          </button>

          <div className="security-info">
            <div className="lock-icon">🔒</div>
            <span>Secure SSL Encryption</span>
          </div>
        </form>
      </div>
    </>
  );
};

export default PaymentForm;

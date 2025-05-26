import {
  jsx as _jsx,
  jsxs as _jsxs,
  Fragment as _Fragment,
} from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthUser } from "react-auth-kit";
import api from "../api/Post.jsx";
// import Header from "../components/Header";

const PaymentForm = () => {
  const { id } = useParams();
  const auth = useAuthUser();
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
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
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (isMounted.current) setLoading(true);
        const response = await api.get(`api/v1/orders/${id}`, {
          headers: {
            Authorization: `Bearer ${parsedAuth.token}`,
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
    const unloadHandler = (e) => {
      if (isProcessing) {
        e.preventDefault();
        e.returnValue = "Payment in progress - are you sure?";
      }
    };
    window.addEventListener("beforeunload", unloadHandler);
    return () => window.removeEventListener("beforeunload", unloadHandler);
  }, [isProcessing]);
  const handleSubmit = async (event) => {
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
      const { data } = await api.post(
        `/api/v1/payments/create-stripe-payment-intent`,
        {
          amount: Math.round(order.totalPrice * 100),
          currency: "usd",
          metadata: {
            orderId: order._id,
            userId: auth?.userId || "unknown",
          },
        }
      );
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
        `api/v1/orders/${order._id}/status`,
        { status: "Processing" }, // Adjust payload according to your backend
        {
          headers: {
            Authorization: `Bearer ${parsedAuth.token}`,
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
    return _jsxs("div", {
      children: [
        // _jsx(Header, {}),
        _jsx("h1", {
          className: "loading",
          children: "Initializing payment system...",
        }),
      ],
    });
  }
  if (loading) {
    return _jsxs("div", {
      children: [
        // _jsx(Header, {}),
        _jsx("h1", {
          className: "loading",
          children: "Loading Payment Details...",
        }),
      ],
    });
  }
  if (!auth) {
    return _jsxs("div", {
      className: "error-container",
      children: [
        // _jsx(Header, {}),
        _jsx("p", {
          className: "error-message",
          children: "You need to be logged in to access this page",
        }),
      ],
    });
  }
  return _jsxs(_Fragment, {
    children: [
      // _jsx(Header, {}),
      _jsx("div", {
        className: "payment-container",
        children: _jsxs("form", {
          onSubmit: handleSubmit,
          className: "payment-form",
          children: [
            _jsxs("h2", {
              className: "payment-title",
              children: ["Payment for Order #", id],
            }),
            _jsxs("div", {
              className: "form-group",
              children: [
                _jsx("label", { htmlFor: "name", children: "Full Name" }),
                _jsx("input", {
                  type: "text",
                  id: "name",
                  value: name,
                  readOnly: true,
                }),
              ],
            }),
            _jsxs("div", {
              className: "form-group",
              children: [
                _jsx("label", { htmlFor: "email", children: "Email" }),
                _jsx("input", {
                  type: "email",
                  id: "email",
                  value: email,
                  readOnly: true,
                }),
              ],
            }),
            _jsxs("div", {
              className: "form-group",
              children: [
                _jsx("label", { children: "Card Details" }),
                _jsx("div", {
                  className: "card-element-wrapper",
                  children: _jsx(CardElement, {
                    options: {
                      hidePostalCode: true,
                      classes: { base: "card-element-styles" },
                    },
                  }),
                }),
              ],
            }),
            errorMessage &&
              _jsx("div", {
                className: "error-message",
                children: errorMessage,
              }),
            _jsx("button", {
              type: "submit",
              disabled: !stripe || isProcessing || !order || loading,
              className: "pay-button",
              children: isProcessing
                ? _jsx("div", { className: "spinner" })
                : `Pay $${order?.totalPrice.toFixed(2)}`,
            }),
            _jsxs("div", {
              className: "security-info",
              children: [
                _jsx("div", {
                  className: "lock-icon",
                  children: "\uD83D\uDD12",
                }),
                _jsx("span", { children: "Secure SSL Encryption" }),
              ],
            }),
          ],
        }),
      }),
    ],
  });
};
export default PaymentForm;

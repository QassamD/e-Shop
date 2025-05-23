import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import HomePage from "./routers/HomePage";
import About from "./components/About";
import NotFoundPage from "./routers/NotFoundPage";
import Card from "./routers/Card";
import api from "./api/Post.js";
import { useEffect, useMemo, useState } from "react";
import Login from "./routers/login";
import Register from "./routers/Register";
import Product from "./routers/product";
import Orders from "./routers/Orders";
import Category from "./routers/Category";
import AddCategory from "./routers/AddCategory";
import PutProduct from "./routers/PutProduct";
import CategoryId from "./routers/CategoryId";
import CategoryEdit from "./routers/CategoryEdit";
import OrderUpdate from "./routers/OrderUpdate";
import PaymentForm from "./routers/PaymentForm";

function App() {
  const [product, setProduct] = useState([]);
  const [loading, setLoading] = useState(true);
  const stripePromise = useMemo(() => {
    return loadStripe(
      "pk_test_51QyJT7E8IVJvL5F7Qj3A5D3TvxDFe0AxQkEB0bCVkxPtjKbnu4i8fBW3vGPmxagLdR0eMvQHsXv0zEjWqPeFmiDs00o7qY0WQ5"
    );
  }, []);

  const router = createBrowserRouter(
    [
      {
        path: "/",
        element: <HomePage products={product} />,
        errorElement: <NotFoundPage />,
      },
      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/card/:id",
        element: <Card />,
      },
      {
        path: "/user/login",
        element: <Login />,
      },
      {
        path: "/user/Register",
        element: <Register />,
      },
      {
        path: "/product",
        element: <Product />,
      },
      {
        path: "/order/:userid",
        element: <Orders />,
      },
      {
        path: "/order/:userid/confirm/:id",
        element: <OrderUpdate />,
      },
      {
        path: "/category",
        element: <Category />,
      },
      {
        path: "/category/add",
        element: <AddCategory />,
      },
      {
        path: "/product/update/:id",
        element: <PutProduct />,
      },
      {
        path: "/category/:id",
        element: <CategoryId />,
      },
      {
        path: "/category/edit/:id",
        element: <CategoryEdit />,
      },
      {
        path: "/payment/:id",
        element: <PaymentForm />,
      },
    ],
    {
      future: {
        v7_normalizeFormMethod: true,
      },
    }
  );

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await api.get("/api/v1/product");
        if (response.data) {
          console.log("Products data:", response.data);
          setProduct(response.data);
        } else {
          console.error("No data received from the API");
          setProduct([]);
        }
      } catch (error: any) {
        console.error("Error fetching products:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
        setProduct([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <Elements stripe={stripePromise}>
        <RouterProvider router={router} />
      </Elements>
    </>
  );
}

export default App;

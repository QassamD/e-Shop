import React, { useEffect, useMemo, useState, FunctionComponent } from "react";
import AuthProvider from "react-auth-kit";
import createStore from "react-auth-kit/createStore";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import {
  createBrowserRouter,
  RouterProvider,
  RouteObject,
} from "react-router-dom";
import "./App.css";

// Components
import HomePage from "./routers/HomePage";
import About from "./components/About";
import NotFoundPage from "./routers/NotFoundPage";
import Card from "./routers/Card";
import api from "./api/Post.jsx";
import Login from "./routers/Login";
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

interface ProductType {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  countInStock: number;
  rating?: number;
  numReviews?: number;
  category: string;
}

// Create a wrapper component for the home route
const HomeRouteWrapper: FunctionComponent = () => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/api/v1/products");
        const data = response.data.map((product: any) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.image || "/default-image.jpg",
          countInStock: product.countInStock,
          rating: product.rating,
          numReviews: product.numReviews,
          category: product.category || "Uncategorized",
        }));
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div className="loading-spinner">Loading...</div>;
  return <HomePage products={products} />;
};

// Define routes outside of any component
const routes = [
  {
    path: "/",
    element: <HomeRouteWrapper />,
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
    path: "/user/register",
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
];

// Create router outside of any component
const router = createBrowserRouter(routes);

const App: FunctionComponent = () => {
  const stripePromise = useMemo(
    () =>
      loadStripe(
        "pk_test_51QyJT7E8IVJvL5F7Qj3A5D3TvxDFe0AxQkEB0bCVkxPtjKbnu4i8fBW3vGPmxagLdR0eMvQHsXv0zEjWqPeFmiDs00o7qY0WQ5"
      ),
    []
  );

  return (
    // @ts-ignore
    <AuthProvider
      store={createStore({
        authName: "_auth",
        authType: "cookie",
        cookieDomain: window.location.hostname,
        cookieSecure: window.location.protocol === "https:",
      })}
    >
      {/* @ts-ignore */}
      <Elements stripe={stripePromise}>
        {/* @ts-ignore */}
        <RouterProvider router={router} />
      </Elements>
    </AuthProvider>
  );
};

export default App;

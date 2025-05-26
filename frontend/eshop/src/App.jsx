import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
} from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useMemo, Suspense, lazy } from "react";
import { useAuthUser, useSignIn, useSignOut } from "react-auth-kit";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import Header from "./components/Header.jsx";
import LoadingSpinner from "./components/LoadingSpinner.jsx";
import api from "./api/Post.jsx";

// Normal imports
import HomePage from "./routers/HomePage.jsx";
import Login from "./routers/Login.jsx";
import Register from "./routers/Register.jsx";
import Card from "./routers/Card.jsx";
import ProductCreate from "./routers/Product.jsx";
import Orders from "./routers/Orders.jsx";
import Category from "./routers/Category.jsx";
import AddCategory from "./routers/AddCategory.jsx";
import PutProduct from "./routers/PutProduct.jsx";
import CategoryId from "./routers/CategoryId.jsx";
import CategoryEdit from "./routers/CategoryEdit.jsx";
import OrderUpdate from "./routers/OrderUpdate.jsx";
import PaymentForm from "./routers/PaymentForm.jsx";
import NotFoundPage from "./routers/NotFoundPage.jsx";

// Stripe configuration
const STRIPE_PK =
  "pk_test_51QyJT7E8IVJvL5F7Qj3A5D3TvxDFe0AxQkEB0bCVkxPtjKbnu4i8fBW3vGPmxagLdR0eMvQHsXv0zEjWqPeFmiDs00o7qY0WQ5";

// Auth Protected Route Component
const ProtectedRoute = ({ children }) => {
  const auth = useAuthUser();
  return auth() ? children : <Navigate to="/user/login" replace />;
};

// Router configuration
const router = createBrowserRouter([
  {
    element: (
      <ErrorBoundary>
        <Header />
        <Outlet />
      </ErrorBoundary>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: "/",
        element: <HomePage />,
        // loader: async () => {
        //   const response = await api.get("/api/v1/products");
        //   console.log("app", response.data);
        //   return response.data;
        // },
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
        path: "/card/:id",
        element: <Card />,
      },
      {
        path: "/product",
        element: (
          <ProtectedRoute>
            <ProductCreate />
          </ProtectedRoute>
        ),
      },
      {
        path: "/order/:userid",
        element: (
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        ),
      },
      {
        path: "/order/:userid/confirm/:id",
        element: (
          <ProtectedRoute>
            <OrderUpdate />
          </ProtectedRoute>
        ),
      },
      {
        path: "/category",
        element: (
          <ProtectedRoute>
            <Category />
          </ProtectedRoute>
        ),
      },
      {
        path: "/category/add",
        element: (
          <ProtectedRoute>
            <AddCategory />
          </ProtectedRoute>
        ),
      },
      {
        path: "/product/update/:id",
        element: (
          <ProtectedRoute>
            <PutProduct />
          </ProtectedRoute>
        ),
      },
      {
        path: "/category/:id",
        element: (
          <ProtectedRoute>
            <CategoryId />
          </ProtectedRoute>
        ),
      },
      {
        path: "/category/edit/:id",
        element: (
          <ProtectedRoute>
            <CategoryEdit />
          </ProtectedRoute>
        ),
      },
      {
        path: "/payment/:id",
        element: (
          <ProtectedRoute>
            <PaymentForm />
          </ProtectedRoute>
        ),
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);

function App() {
  const stripePromise = useMemo(
    () =>
      loadStripe(STRIPE_PK, {
        apiVersion: "2023-10-16",
        stripeAccount: "acct_1QyJT7E8IVJvL5F7",
      }),
    []
  );

  return (
    <Elements stripe={stripePromise}>
      <RouterProvider router={router} />
    </Elements>
  );
}

export default App;

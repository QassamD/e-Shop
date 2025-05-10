import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import HomePage from "./routers/HomePage";
import About from "./components/About";
import NotFoundPage from "./routers/NotFoundPage";
import Card from "./routers/Card";
import api from "./api/Post";
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
  const router = createBrowserRouter([
    {
      path: "/",
      element: _jsx(HomePage, { products: product }),
      errorElement: _jsx(NotFoundPage, {}),
    },
    {
      path: "/about",
      element: _jsx(About, {}),
    },
    {
      path: "/card/:id",
      element: _jsx(Card, {}),
    },
    {
      path: "/user/login",
      element: _jsx(Login, {}),
    },
    {
      path: "/user/Register",
      element: _jsx(Register, {}),
    },
    {
      path: "/product",
      element: _jsx(Product, {}),
    },
    {
      path: "/order/:userid",
      element: _jsx(Orders, {}),
    },
    {
      path: "/order/:userid/confirm/:id",
      element: _jsx(OrderUpdate, {}),
    },
    {
      path: "/category",
      element: _jsx(Category, {}),
    },
    {
      path: "/category/add",
      element: _jsx(AddCategory, {}),
    },
    {
      path: "/product/update/:id",
      element: _jsx(PutProduct, {}),
    },
    {
      path: "/category/:id",
      element: _jsx(CategoryId, {}),
    },
    {
      path: "/category/edit/:id",
      element: _jsx(CategoryEdit, {}),
    },
    {
      path: "/payment/:id",
      element: _jsx(PaymentForm, {}),
    },
  ]);
  useEffect(() => {
    console.log("0.fetchPost", api.defaults.baseURL);
    const fetchPost = async () => {
      try {
        console.log("0.response", await api.get("/api/v1/product"));
        const response = await api.get("/api/v1/product");

        // console.log("1.response", response.data);
        setProduct(response.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, []);
  if (loading) return _jsx("div", { children: "Loading..." });
  return _jsx(_Fragment, {
    children: _jsx(Elements, {
      stripe: stripePromise,
      children: _jsx(RouterProvider, { router: router }),
    }),
  });
}
export default App;

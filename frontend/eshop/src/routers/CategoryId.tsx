import { useState, useEffect } from "react";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/Post.jsx";
import Header from "../components/Header";
import "./CategoryId.css";

interface User {
  userId: string;
  name: string;
  isAdmin: boolean;
}

interface Category {
  _id: string;
  dataOrdered: string;
  name: string;
  icon: string;
  color: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  richDescription: string;
  brand: string;
  price: number;
  category: Category;
  countInStock: number;
  rating: number;
  numReviews: number;
  isFeatured: boolean;
}

const CategoryId = () => {
  const { id } = useParams<{ id: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const auth = useAuthUser<User>();

  useEffect(() => {
    setLoading(true);
    setError("");
    const fetchCategory = async () => {
      try {
        const response = await api.get(`/api/v1/category/${id}`);
        if (response.status === 200) {
          setCategory(response.data);
        } else {
          setError("Category not found");
        }
      } catch (err) {
        setError("Failed to load  category");
        alert(error);
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchProduct = async () => {
      try {
        const response = await api.get("api/v1/product");
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching product:", error);
        setError("Failed to load product");
      }
    };
    if (id) {
      fetchCategory();
      fetchProduct();
    }
  }, [error, id]);

  const handleDelete = async () => {
    if (!auth?.isAdmin) return;

    try {
      await api.delete(`/api/v1/category/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      navigate("/category");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete category");
    }
  };

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

  if (!category) {
    return (
      <div className="error-container">
        <Header />
        <p className="error-message">Category not found</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="category-id-container">
        <div className="category-card">
          <div className="category-header">
            <span className="category-icon" style={{ color: category.color }}>
              {category.icon}
            </span>
            <h1>{category.name}</h1>
          </div>
          <div className="category-details">
            <p className="detail-item">
              <strong>Created:</strong>{" "}
              {new Date(category.dataOrdered).toLocaleDateString()}
            </p>
            <p className="detail-item">
              <strong>Color:</strong>{" "}
              <span
                className="color-preview"
                style={{ backgroundColor: category.color }}
              ></span>
            </p>
          </div>
          {/* // Update the JSX product section (replace the existing product div) */}
          <div className="products-section">
            <h2>Products in this Category</h2>
            {/* {products.map((product) => (
                <div> product.category: {product.category._id.toString()} </div>
              ))} */}
            {products.filter((product) => product.category._id === id)
              .length === 0 ? (
              <p className="no-products">
                No products found in this category {}
              </p>
            ) : (
              <div className="products-grid">
                {products
                  .filter((product) => product.category._id === id)
                  .map((product) => (
                    <div key={product.id} className="product-card">
                      <h3 className="product-name">{product.name}</h3>
                      <p className="product-description">
                        {product.description}
                      </p>
                      <div className="product-details">
                        <span className="product-price">${product.price}</span>
                        <span
                          className={`stock-status ${
                            product.countInStock > 0
                              ? "in-stock"
                              : "out-of-stock"
                          }`}
                        >
                          {product.countInStock > 0
                            ? "In Stock"
                            : "Out of Stock"}
                        </span>
                      </div>
                      <button
                        className="view-product-btn"
                        onClick={() => navigate(`/card/${product.id}`)}
                      >
                        View Details
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
          {auth?.isAdmin && (
            <div className="admin-actions">
              <button
                className="edit-btn"
                onClick={() => navigate(`/category/edit/${category._id}`)}
              >
                Edit Category
              </button>
              <button
                className="delete-btn"
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to delete this category?"
                    )
                  ) {
                    handleDelete();
                  }
                }}
              >
                Delete Category
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CategoryId;

import { useEffect, useState } from "react";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import Header from "../components/Header";
import api from "../api/Post.jsx";
import "./Category.css";
import { useNavigate } from "react-router-dom";

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

const Category = () => {
  const auth = useAuthUser<User>();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/v1/category");

        if (response.data) {
          setCategories(response.data);
        } else {
          alert("No category");
        }
      } catch (error) {
        setError("Failed to load Category");
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, []);

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      if (!auth?.isAdmin) {
        alert("Only admin can delete a category");
        return;
      }

      const response = await api.delete(`/api/v1/category/${categoryId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (response.status === 200) {
        setCategories((prev) => prev.filter((cat) => cat._id !== categoryId));
        alert(response.data.message);
        navigate("/category");
        // alert("Category deleted successfully");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete category");
    }
  };

  const confirmDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      handleDeleteCategory(id);
    }
  };

  //   const handleUpdateCategory= ()=>{
  //     navigate(`/category/update/${categories}`)
  //   }

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
    <div>
      <Header />
      <div className="category-container">
        <div className="category-header">
          <h1>Product Categories</h1>
          {auth?.isAdmin && (
            <button
              className="add-category-btn"
              onClick={() => {
                navigate("/category/add");
              }}
            >
              Add New Category
            </button>
          )}
        </div>

        <div className="categories-grid">
          {categories.map((category) => (
            <div
              key={category._id}
              className="category-card"
              style={{ borderColor: category.color }}
            >
              <div className="category-icon-container">
                <span
                  className="material-icons category-icon"
                  style={{ color: category.color }}
                >
                  {category.icon}
                </span>
              </div>
              <h3 className="category-name">{category.name}</h3>
              <p className="category-date">
                Added: {new Date(category.dataOrdered).toLocaleDateString()}
              </p>

              {auth?.isAdmin && (
                <div className="category-actions">
                  <button
                    className="edit-btn"
                    onClick={() => {
                      navigate(`/category/${category._id}`);
                    }}
                  >
                    <span className="material-icons"> edit </span>
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => confirmDelete(category._id)}
                  >
                    <span className="material-icons"> delete </span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Category;

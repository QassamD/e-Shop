import { useEffect, useState } from "react";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/Post.jsx";
import Header from "../components/Header";
import "./CategoryEdit.css";

interface User {
  userId: string;
  name: string;
  isAdmin: boolean;
  token: string;
}

interface CategoryForm {
  dataOrdered: string;
  name: string;
  icon: string;
  color: string;
}

const CategoryEdit = () => {
  const { id } = useParams<{ id: string }>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = useAuthUser<User>();

  const [formData, setFormData] = useState<CategoryForm>({
    dataOrdered: "",
    name: "",
    icon: "",
    color: "",
  });

  const iconOptions = [
    "shopping_basket",
    "laptop",
    "phone_iphone",
    "home",
    "directions_car",
    "checkroom",
    "watch",
    "local_dining",
  ];

  useEffect(() => {
    const FetchCategory = async () => {
      try {
        const response = await api.get(`/api/v1/category/${id}`);
        setFormData({
          dataOrdered: response.data.dataOrdered || new Date().toISOString(),
          name: response.data.name || "",
          icon: response.data.icon || "shopping_basket",
          color: response.data.color || "#3498db",
        });
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };
    if (id) FetchCategory();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formDataToSend = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value.toString());
      });

      for (const [key, value] of formDataToSend.entries()) {
        console.log(key, value);
      }

      const response = await api.put(`/api/v1/category/${id}`, formData, {
        headers: {
          //   "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${auth?.token}`,
        },
      });
      console.log("response", response);
      if (response.status === 200) {
        navigate(`/category/${id}`);
      }
    } catch (error) {
      setError("Failed to update category");
      console.log("Update Error", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <h1 className="loading">Loading Category...</h1>
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

  if (!auth?.isAdmin) {
    return (
      <div className="error-container">
        <Header />
        <p className="error-message">
          Unauthorized access. Admin privileges required.
        </p>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="category-edit-container">
        <form onSubmit={handleSubmit} className="category-edit-form">
          <h1>Edit Category</h1>

          <div className="form-group">
            <label>Category Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Added icon selection grid */}
          <div className="form-group">
            <label>Select Icon</label>
            <div className="icon-grid">
              {iconOptions.map((icon) => (
                <div
                  key={icon}
                  className={`icon-option ${
                    formData.icon === icon ? "selected" : ""
                  }`}
                  onClick={() => setFormData({ ...formData, icon })}
                >
                  <span className="material-icons">{icon}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Added color picker */}
          <div className="form-group">
            <label>Color</label>
            <div className="color-picker">
              <input
                type="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
              />
              <div
                className="color-preview"
                style={{ backgroundColor: formData.color }}
              ></div>
            </div>
          </div>

          {/* Added preview section */}
          <div className="category-preview">
            <h3>Preview:</h3>
            <div className="preview-content">
              <span
                className="material-icons"
                style={{ color: formData.color }}
              >
                {formData.icon}
              </span>
              <span>{formData.name}</span>
            </div>
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryEdit;

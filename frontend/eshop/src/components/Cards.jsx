import { Link } from "react-router-dom";
import "./Cards.css";
import { useEffect, useState } from "react";
import api from "../api/Post";

const Cards = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/v1/products");
        if (response.data) {
          setProducts(response.data);
        } else {
          alert("No products");
        }
      } catch (error) {
        setError("Failed to load products");
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);
  // console.log("1.products", products);

  if (!products || !Array.isArray(products)) {
    return <div className="loading-message">Loading products...</div>;
  }

  if (products.length === 0) {
    return <div className="empty-message">No products found</div>;
  }

  /* if(loading) {
    return <LoadingSpinner>
  }

  if(error){
    return <div> {error} </div>
  } */

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/a.png";
    if (imagePath.startsWith("data:")) return imagePath;
    if (imagePath.startsWith("https://")) return imagePath;
    return "/a.png";
  };

  return (
    <div className="cards-container">
      {products.map((product) => (
        <div key={product.id} className="product-card">
          <div className="card-image-container">
            <img
              src={getImageUrl(product.image)}
              className="card-image"
              alt={product.name}
              onError={(e) => {
                e.target.src = "/images/placeholder.jpg";
                console.error("Failed to load image:", product.image);
              }}
            />
            {product.countInStock === 0 && (
              <div className="out-of-stock">Out of Stock</div>
            )}
          </div>
          <div className="card-content">
            <h3 className="product-name">{product.name}</h3>
            <p className="product-description">{product.description}</p>
            <div className="card-footer">
              <span className="product-price">${product.price.toFixed(2)}</span>
              <Link
                to={`/card/${product.id}`}
                className="view-details-btn"
                aria-label={`View details for ${product.name}`}
              >
                View Details
              </Link>
            </div>
            {product.rating && (
              <div className="product-rating">
                ⭐ {product.rating.toFixed(1)}
                {product.numReviews && ` (${product.numReviews})`}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Cards;

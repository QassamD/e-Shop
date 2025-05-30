import { useNavigate } from "react-router-dom";
import "./Cards.css";

export interface Product {
  id?: string;
  name: string;
  description: string;
  richDescription?: string;
  image?: string;
  images?: string[];
  brand?: string;
  price: number;
  category: string;
  countInStock: number;
  rating?: number;
  numReviews?: number;
  isFeatured?: boolean;
  dateCreated?: Date;
}

interface Props {
  products: Product[];
}

const Cards = ({ products }: Props) => {
  const navigate = useNavigate();

  if (!products || !Array.isArray(products)) {
    return <div className="loading-message">Loading products...</div>;
  }

  if (products.length === 0) {
    return <div className="empty-message">No products found</div>;
  }

  return (
    <div className="cards-container">
      {products.map((product) => (
        <div key={product.id} className="product-card">
          <div className="card-image-container">
            <img
              src={product.image || "/images/placeholder.jpg"}
              className="card-image"
              alt={product.name}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/images/placeholder.jpg";
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
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/card/${product.id}`);
                }}
                className="view-details-btn"
                aria-label={`View details for ${product.name}`}
              >
                View Details
              </a>
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

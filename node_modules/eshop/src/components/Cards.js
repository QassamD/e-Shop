import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import "./Cards.css";

const Cards = ({ products }) => {
  console.log("1.products", products);

  if (!products || !Array.isArray(products)) {
    return _jsx("div", {
      className: "loading-message",
      children: "Loading products...",
    });
  }
  console.log("2.products", products);

  if (products.length === 0) {
    return _jsx("div", {
      className: "empty-message",
      children: "No products found",
    });
  }
  console.log("3.products", products);

  return _jsx("div", {
    className: "cards-container",
    children: products.map((product) =>
      _jsxs(
        "div",
        {
          className: "product-card",
          children: [
            _jsxs("div", {
              className: "card-image-container",
              children: [
                _jsx("img", {
                  src: product.image || "/images/placeholder.jpg",
                  className: "card-image",
                  alt: product.name,
                  onError: (e) => {
                    e.target.src = "/images/placeholder.jpg";
                  },
                }),
                product.countInStock === 0 &&
                  _jsx("div", {
                    className: "out-of-stock",
                    children: "Out of Stock",
                  }),
              ],
            }),
            _jsxs("div", {
              className: "card-content",
              children: [
                _jsx("h3", {
                  className: "product-name",
                  children: product.name,
                }),
                _jsx("p", {
                  className: "product-description",
                  children: product.description,
                }),
                _jsxs("div", {
                  className: "card-footer",
                  children: [
                    _jsxs("span", {
                      className: "product-price",
                      children: ["$", product.price.toFixed(2)],
                    }),
                    _jsx(Link, {
                      to: `/card/${product.id}`,
                      className: "view-details-btn",
                      "aria-label": `View details for ${product.name}`,
                      children: "View Details",
                    }),
                  ],
                }),
                product.rating &&
                  _jsxs("div", {
                    className: "product-rating",
                    children: [
                      "\u2B50 ",
                      product.rating.toFixed(1),
                      product.numReviews && ` (${product.numReviews})`,
                    ],
                  }),
              ],
            }),
          ],
        },
        product.id
      )
    ),
  });
};
export default Cards;

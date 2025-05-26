import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import "./About.css";
const About = () => {
  return _jsx("div", {
    className: "about-container",
    children: _jsxs("div", {
      className: "about-content",
      children: [
        _jsx("h1", { className: "about-title", children: "About Our Shop" }),
        _jsx("p", {
          className: "about-description",
          children:
            "Welcome to e_shop, where style meets sophistication. Since 2025, we've been curating premium fashion and lifestyle products for discerning customers. Our carefully selected collections blend timeless elegance with contemporary trends, offering unique pieces that tell a story. We believe in quality over quantity, and every item in our store is chosen with attention to craftsmanship and sustainability.",
        }),
        _jsxs("div", {
          className: "contact-section",
          children: [
            _jsxs("div", {
              className: "contact-card",
              children: [
                _jsx("i", { className: "fas fa-envelope contact-icon" }),
                _jsx("h3", { children: "Email" }),
                _jsx("p", { children: "contact@e_shop.com" }),
              ],
            }),
            _jsxs("div", {
              className: "contact-card",
              children: [
                _jsx("i", { className: "fas fa-phone contact-icon" }),
                _jsx("h3", { children: "Phone" }),
                _jsx("p", { children: "+1 (555) 123-4567" }),
              ],
            }),
            _jsxs("div", {
              className: "contact-card",
              children: [
                _jsx("i", { className: "fas fa-map-marker-alt contact-icon" }),
                _jsx("h3", { children: "Address" }),
                _jsxs("p", {
                  children: [
                    "123 Luxury Avenue",
                    _jsx("br", {}),
                    "New York, NY 10001",
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  });
};
export default About;

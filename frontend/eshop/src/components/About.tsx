import "./About.css";
const About = () => {
  return (
    <div className="about-container">
      <div className="about-content">
        <h1 className="about-title">About Our Shop</h1>

        <p className="about-description">
          Welcome to e_shop, where style meets sophistication. Since 2025, we've
          been curating premium fashion and lifestyle products for discerning
          customers. Our carefully selected collections blend timeless elegance
          with contemporary trends, offering unique pieces that tell a story. We
          believe in quality over quantity, and every item in our store is
          chosen with attention to craftsmanship and sustainability.
        </p>

        <div className="contact-section">
          <div className="contact-card">
            <i className="fas fa-envelope contact-icon"></i>
            <h3>Email</h3>
            <p>contact@e_shop.com</p>
          </div>

          <div className="contact-card">
            <i className="fas fa-phone contact-icon"></i>
            <h3>Phone</h3>
            <p>+1 (555) 123-4567</p>
          </div>

          <div className="contact-card">
            <i className="fas fa-map-marker-alt contact-icon"></i>
            <h3>Address</h3>
            <p>
              123 Luxury Avenue
              <br />
              New York, NY 10001
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

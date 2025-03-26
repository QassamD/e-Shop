import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const Carousel = () => {
  return (
    <div id="carouselExample" className="carousel slide position-relative">
      <div className="carousel-inner" style={{ height: "500px" }}>
        <div className="carousel-item active">
          <img
            src="/public/vite.svg"
            className="d-block w-100"
            alt="vite.svg"
            style={{ height: "500px" }}
          />
        </div>
        <div className="carousel-item">
          <img
            src="/public/a.png"
            className="d-block w-100"
            alt="vite.svg"
            style={{ height: "500px" }}
          />
        </div>
        <div className="carousel-item">
          <img
            src="/public/vite.svg"
            className="d-block w-100"
            alt="=vite.svg"
            style={{ height: "500px" }}
          />
        </div>
      </div>
      <button
        className="carousel-control-prev"
        type="button"
        data-bs-target="#carouselExample"
        data-bs-slide="prev"
        style={{ width: "5%" }}
      >
        <span
          className="carousel-control-prev-icon"
          aria-hidden="true"
          style={{ backgroundColor: "black" }}
        ></span>
        <span className="visually-hidden">Previous</span>
      </button>
      <button
        className="carousel-control-next"
        type="button"
        data-bs-target="#carouselExample"
        data-bs-slide="next"
        style={{ width: "5%" }}
      >
        <span
          className="carousel-control-next-icon"
          style={{ backgroundColor: "black" }}
          aria-hidden="true"
        ></span>
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  );
};

export default Carousel;

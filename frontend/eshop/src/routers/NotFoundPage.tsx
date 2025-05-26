import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="center">
      404 NotFoundPage
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          navigate("/");
        }}
      >
        Home
      </a>
    </div>
  );
};

export default NotFoundPage;

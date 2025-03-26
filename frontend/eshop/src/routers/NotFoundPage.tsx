import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="center">
      404 NotFoundPage
      <Link to="/">Home</Link>
    </div>
  );
};

export default NotFoundPage;

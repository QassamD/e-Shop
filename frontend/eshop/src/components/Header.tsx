import useSignOut from "react-auth-kit/hooks/useSignOut";
import { useNavigate } from "react-router-dom";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { useState } from "react";
import "./Header.css"; // We'll create this CSS file

interface User {
  name: string;
  userId: string;
  isAdmin: boolean;
}

const Header = () => {
  const signOut = useSignOut();
  const navigate = useNavigate();
  const auth = useAuthUser<User>();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const logOut = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      signOut();
      navigate("/user/login");
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-container">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
          className="logo"
        >
          <span className="logo-icon">🛍</span>
          <span className="logo-text">E-Commerce</span>
        </a>

        <button
          className={`hamburger ${isMenuOpen ? "active" : ""}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        <nav className={`nav-menu ${isMenuOpen ? "active" : ""}`}>
          <ul className="nav-list">
            <li className="nav-item">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/");
                  closeMenu();
                }}
                className="nav-link"
              >
                Home
              </a>
            </li>

            {auth && (
              <li className="nav-item">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/order/${auth.userId}`);
                    closeMenu();
                  }}
                  className="nav-link"
                >
                  My Orders
                </a>
              </li>
            )}

            {auth?.isAdmin && (
              <li className="nav-item">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/admin/dashboard");
                    closeMenu();
                  }}
                  className="nav-link"
                >
                  Admin Dashboard
                </a>
              </li>
            )}
          </ul>
        </nav>

        <div className="account-section">
          {auth ? (
            <div className="account-dropdown">
              <button className="account-btn">
                <span className="user-icon">👤</span>
                <span className="user-name">{auth.name}</span>
              </button>
              <div className="dropdown-content">
                <button onClick={logOut} className="dropdown-item">
                  Log Out
                </button>
              </div>
            </div>
          ) : (
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate("/user/login");
              }}
              className="login-link"
            >
              Login
            </a>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

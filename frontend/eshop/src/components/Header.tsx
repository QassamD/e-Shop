import useSignOut from "react-auth-kit/hooks/useSignOut";
import { Link, NavLink, useNavigate } from "react-router-dom";
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
        <Link to="/" className="logo">
          <span className="logo-icon">🛍</span>
          <span className="logo-text">E-Commerce</span>
        </Link>

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
              <NavLink to="/" className="nav-link" onClick={closeMenu} end>
                Home
              </NavLink>
            </li>

            {auth && (
              <li className="nav-item">
                <NavLink
                  to={`/order/${auth.userId}`}
                  className="nav-link"
                  onClick={closeMenu}
                >
                  My Orders
                </NavLink>
              </li>
            )}

            {auth?.isAdmin && (
              <li className="nav-item">
                <NavLink
                  to="/admin/dashboard"
                  className="nav-link"
                  onClick={closeMenu}
                >
                  Admin Dashboard
                </NavLink>
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
            <NavLink to="/user/login" className="login-link">
              Login
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

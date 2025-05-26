import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAuthUser, useSignOut } from "react-auth-kit";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Header.css";

const Header = () => {
  const signOut = useSignOut();
  const navigate = useNavigate();
  const auth = useAuthUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const user = auth();

  const logOut = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      signOut();
      navigate("/user/login");
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return _jsx("header", {
    className: "header",
    children: _jsxs("div", {
      className: "header-container",
      children: [
        _jsxs(Link, {
          to: "/",
          className: "logo",
          children: [
            _jsx("span", { className: "logo-icon", children: "🛍" }),
            _jsx("span", { className: "logo-text", children: "E-Commerce" }),
          ],
        }),
        _jsxs("button", {
          className: `hamburger ${isMenuOpen ? "active" : ""}`,
          onClick: toggleMenu,
          "aria-label": "Toggle navigation",
          children: [
            _jsx("span", { className: "hamburger-line" }),
            _jsx("span", { className: "hamburger-line" }),
            _jsx("span", { className: "hamburger-line" }),
          ],
        }),
        _jsx("nav", {
          className: `nav-menu ${isMenuOpen ? "active" : ""}`,
          children: _jsxs("ul", {
            className: "nav-list",
            children: [
              _jsx("li", {
                children: _jsx(NavLink, {
                  to: "/",
                  className: "nav-link",
                  onClick: closeMenu,
                  end: true,
                  children: "Home",
                }),
              }),
              user &&
                _jsx("li", {
                  children: _jsx(NavLink, {
                    to: `/order/${user.id}`,
                    className: "nav-link",
                    onClick: closeMenu,
                    children: "My Orders",
                  }),
                }),
              user?.isAdmin &&
                _jsx("li", {
                  children: _jsx(NavLink, {
                    to: "/admin/dashboard",
                    className: "nav-link",
                    onClick: closeMenu,
                    children: "Admin Dashboard",
                  }),
                }),
            ],
          }),
        }),
        _jsxs("div", {
          className: "account-section",
          children: user
            ? _jsxs("div", {
                className: "account-dropdown",
                children: [
                  _jsxs("button", {
                    className: "account-btn",
                    children: [
                      _jsx("span", { className: "user-icon", children: "👤" }),
                      _jsx("span", {
                        className: "user-name",
                        children: user.name,
                      }),
                    ],
                  }),
                  _jsx("div", {
                    className: "dropdown-content",
                    children: _jsx("button", {
                      onClick: logOut,
                      className: "dropdown-item",
                      children: "Log Out",
                    }),
                  }),
                ],
              })
            : _jsx(NavLink, {
                to: "/user/login",
                className: "login-link",
                children: "Login",
              }),
        }),
      ],
    }),
  });
};

export default Header;

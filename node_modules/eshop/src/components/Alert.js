import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const Alert = ({ children, onClose }) => {
    return (_jsxs("div", { className: "alert alert-primary alert-dismissible", children: [children, _jsx("button", { type: "button", className: "btn-close", "data-bs-dismiss": "alert", "aria-label": "Close", onClick: onClose })] }));
};
export default Alert;

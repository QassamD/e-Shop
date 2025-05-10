import { jsxs as _jsxs } from "react/jsx-runtime";
const Button = ({ children, onClick, color = "secondary" }) => {
    return (_jsxs("button", { className: "btn btn-" + color, onClick: onClick, children: [" ", children, " "] }));
};
export default Button;

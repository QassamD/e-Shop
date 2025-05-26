import { jsx } from "react/jsx-runtime";

const LoadingSpinner = () => {
  return jsx("div", {
    className: "spinner-container",
    children: jsx("div", {
      className: "loading-spinner",
      style: {
        width: "50px",
        height: "50px",
        border: "5px solid #f3f3f3",
        borderTop: "5px solid #383636",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      },
    }),
  });
};

export default LoadingSpinner;

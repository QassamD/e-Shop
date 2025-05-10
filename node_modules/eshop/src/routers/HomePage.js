import {
  jsx as _jsx,
  Fragment as _Fragment,
  jsxs as _jsxs,
} from "react/jsx-runtime";
import Cards from "../components/Cards";
// import Carousel from "../components/Carousel";
import Header from "../components/Header";
import About from "../components/About";
const HomePage = ({ products }) => {
  return _jsxs(_Fragment, {
    children: [
      _jsx(Header, {}),
      _jsx(Cards, { products: products }),
      _jsx(About, {}),
    ],
  });
};
export default HomePage;

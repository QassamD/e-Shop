import Cards from "../components/Cards";
// import Carousel from "../components/Carousel";
import Header from "../components/Header";
import { Product } from "../components/Cards";
import About from "@/components/About";

interface Props {
  products: Product[];
}

const HomePage = ({ products }: Props) => {
  return (
    <>
      <Header />
      <Cards products={products} />
      <About />
    </>
  );
};

export default HomePage;

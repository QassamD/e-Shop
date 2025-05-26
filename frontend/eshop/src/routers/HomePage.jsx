// import Cards from "../components/Cards";
// import Header from "../components/Header";
// import About from "../components/About";

import Cards from "../components/Cards";
import Header from "../components/Header";
import About from "../components/About";

const HomePage = () => {
  // if (!Array.isArray(products)) {
  //   console.error("Products is not an array:", products);
  //   return <div>Error: Invalid products data</div>;
  // }

  return (
    <>
      {/* <Header /> */}
      <Cards />
      <About />
    </>
  );
};

export default HomePage;

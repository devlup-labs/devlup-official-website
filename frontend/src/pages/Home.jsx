import React, { useEffect } from 'react';
import HomeComponent from "../components/Home/";

const Home = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      {/* Home Page */}
      <HomeComponent/>
    </div>
  );
};

export default Home;
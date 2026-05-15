import React, { useEffect } from 'react';
import HomeComponent from "../components/Home_component.jsx";

const Home = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      <HomeComponent/>
    </div>
  );
};

export default Home;
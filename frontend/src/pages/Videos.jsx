import React, { useEffect } from 'react';
import VideosComponent from "../components/Videos_component.jsx";
import { ThemeContext } from "../App";
const Videos = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      <VideosComponent />
    </div>
  );
};

export default Videos;
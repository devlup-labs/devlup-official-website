import React, { useEffect } from 'react';
import TimelineComponent from "../components/Videos/";
import { ThemeContext } from "../App";
const Videos = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      <TimelineComponent/>
    </div>
  );
};

export default Videos;
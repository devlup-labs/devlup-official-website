import React, { useEffect } from 'react';
import TimelineComponent from "../components/Timeline/";
import { ThemeContext } from "../App";
const Timeline = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      <TimelineComponent />
    </div>
  );
};

export default Timeline;
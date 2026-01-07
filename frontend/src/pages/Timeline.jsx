import React, { useEffect } from 'react';

const Timeline = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      Timeline Page
    </div>
  );
};

export default Timeline;
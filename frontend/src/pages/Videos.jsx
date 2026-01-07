import React, { useEffect } from 'react';

const Videos = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      Videos Page
    </div>
  );
};

export default Videos;
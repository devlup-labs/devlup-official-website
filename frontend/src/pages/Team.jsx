import React, { useEffect } from 'react';

const Team = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      Team Page
    </div>
  );
};

export default Team;
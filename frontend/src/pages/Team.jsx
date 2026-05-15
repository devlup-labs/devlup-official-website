import React, { useEffect } from 'react';
import TeamComponent from "../components/Team_component";

const Team = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      <TeamComponent/>
      
    </div>
  );
};

export default Team;
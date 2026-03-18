import React, { useEffect } from 'react';
import TeamComponent from "../components/team/";

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
import React, { useEffect } from 'react';
import TeamComponent from "../components/team/";
import TopControls from '../components/Video/TopControls';
const Team = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      <TeamComponent/>
      <TopControls />
    </div>
  );
};

export default Team;
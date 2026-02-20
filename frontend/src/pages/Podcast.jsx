import React, { useEffect } from 'react';
import PodcastComponent from "../components/Podcast.jsx/";
const Podcast = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      <PodcastComponent/>
    </div>
  );
};

export default Podcast;

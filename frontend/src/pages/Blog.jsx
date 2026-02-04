import React, { useEffect } from 'react';
import BlogComponent from "../components/Blog/";

const Blog = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      <BlogComponent/>
    </div>
  );
};

export default Blog;
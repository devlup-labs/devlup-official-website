import React, { useLayoutEffect, useState } from "react";
import BlogComponent from "../components/Blog_component";

const Blog = () => {
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);

    // allow layout calculations to finish before showing UI
    requestAnimationFrame(() => {
      setReady(true);
    });
  }, []);

  if (!ready) return null;

  return (
    <div>
      <BlogComponent />
    </div>
  );
};

export default Blog;

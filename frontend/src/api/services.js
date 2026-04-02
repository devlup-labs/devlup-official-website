import api from "./axios";

// BLOGS
export const getBlogs = () => api.get("/blogs");
export const getBlogById = (id) => api.get(`/blogs/${id}`);

// TEAM
export const getTeam = () => api.get("/team");

// VIDEOS
export const getVideos = () => api.get("/videos");

// TEST
export const testConnection = () => api.get("/test");
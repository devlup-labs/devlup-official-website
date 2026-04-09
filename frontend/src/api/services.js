import api from "./axios";

//HOME
export const getHomeData = () => api.get("/home");

// BLOGS
export const getBlogs = () => api.get("/blogs");
export const getBlogById = (id) => api.get(`/blogs/${id}`); //OPTIONAL
export const getBlog = (blogId) => api.get(`/blogs/${blogId}/`);


// ==================== COMMENTS ====================
export const getComments = (blogId) => api.get(`/comments/${blogId}`);
export const postComment = (comment) => api.post("/comments/", comment);
export const deleteComment = (commentId) =>
  api.delete(`/comments/delete/${commentId}`);
export const getAllComments = () => api.get("/comments/admin/all");

// TEAM
export const getTeam = () => api.get("/team");

// VIDEOS
export const getVideos = () => api.get("/videos");

//PODCASTS
export const getPodcasts = () => api.get("/podcasts");

//TIMELINE
export const getTimeline = () => api.get("/timeline");

// TEST
export const testConnection = () => api.get("/test");
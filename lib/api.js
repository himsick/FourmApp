import axios from 'axios';

// Flip this to true when you want to hit the real Express server on port 3001
const useRealServer = true;

export const api = axios.create({
  baseURL: useRealServer ? 'http://localhost:3001' : '/',
  withCredentials: true, // <-- important for express-session
  headers: { 'Content-Type': 'application/json' },
});

// === React Query helpers ===

// Users
export const getUsers = async () => {
  const res = await api.get('/user/list');
  return res.data;
};

export const getUser = async (id) => {
  const res = await api.get(`/user/${id}`);
  return res.data;
};

// Counts (advanced features)
export const getCounts = async () => {
  const res = await api.get('/counts');
  return res.data;
};

// Comments
export const getCommentsOfUser = async (userId) => {
  const res = await api.get(`/commentsOfUser/${userId}`);
  return res.data;
};

// Photos
export const getPhotosOfUser = async (userId) => {
  try {
    const res = await api.get(`/photos/${userId}`);
    return res.data;
  } catch {
    // Fallback for older endpoint name
    const res2 = await api.get(`/photosOfUser/${userId}`);
    return res2.data;
  }
};

// Login / Logout
export const login = async ({ login_name }) => {
  const res = await api.post('/admin/login', { login_name });
  return res.data; // { _id, first_name, last_name, login_name }
};

export const logout = async () => {
  const res = await api.post('/admin/logout', {});
  return res.data;
};

export default api;

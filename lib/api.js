import axios from 'axios';

// Flip this to true when you want to hit the real Express server on port 3001
const useRealServer = true;

export const api = axios.create({
  baseURL: useRealServer ? 'http://localhost:3001' : '/',
  withCredentials: false,
  headers: { 'Content-Type': 'application/json' },
});

export default api;

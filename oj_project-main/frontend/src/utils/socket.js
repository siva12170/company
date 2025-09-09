import { io } from 'socket.io-client';

const apiUrl = import.meta.env.VITE_BACKEND_URL || '';
const baseUrl = (() => {
  try {
    if (!apiUrl) return window.location.origin;
    const url = new URL(apiUrl);
    // Remove common API suffixes like /api or /api/v1
    const cleanedPath = url.pathname.replace(/\/?api(\/v\d+)?\/?$/, '/');
    url.pathname = cleanedPath;
    return url.toString().replace(/\/$/, '');
  } catch {
    return window.location.origin;
  }
})();

const socket = io(baseUrl, { withCredentials: true });
export default socket;

// Central API base URL — swap here for local vs production
const API_BASE = import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || "http://localhost:5000"}`;

export default API_BASE;

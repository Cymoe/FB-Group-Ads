// API Configuration
// Use environment variable or fallback to localhost for development
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export const API_ENDPOINTS = {
  AUTH: {
    GOOGLE: `${API_BASE_URL}/api/auth/google`,
    VERIFY: `${API_BASE_URL}/api/auth/verify`,
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
  },
  DATA: `${API_BASE_URL}/api/data`,
  POSTS: `${API_BASE_URL}/api/posts`,
  GROUPS: `${API_BASE_URL}/api/groups`,
  COMPANIES: `${API_BASE_URL}/api/companies`,
}


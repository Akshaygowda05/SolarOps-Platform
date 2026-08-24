import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Helper function to handle clean redirects
const handleUnauthorizedRedirect = () => {
  localStorage.removeItem("auth");
  localStorage.removeItem("selectedApplicationId");
  localStorage.removeItem("selectedApplicationNameForAdmin");

  if (window.location.pathname !== "/") {
    window.location.href = "/?sessionExpired=true";
  }
};

// Request Interceptor (Attaches Token or Blocks Request)
api.interceptors.request.use(
  (config: any) => {
    const authRaw = localStorage.getItem("auth");
    const auth = authRaw ? JSON.parse(authRaw) : null;

    // 1. Check if token is missing for non-auth requests (adjust bypass paths if needed)
    const isPublicRoute = config.url?.includes("/login") || config.url?.includes("/public");
    
    if (!auth?.token && !isPublicRoute) {
      handleUnauthorizedRedirect();
      return Promise.reject(new Error("No authentication token found. Please log in."));
    }

    // 2. Attach Authorization Header
    if (auth?.token) {
      config.headers.Authorization = `Bearer ${auth.token}`;
    }

    // 3. Attach Application ID header for ADMIN role
    if (auth?.role === "ADMIN") {
      const selectedApplicationId = localStorage.getItem("selectedApplicationId");
      if (selectedApplicationId) {
        config.headers["x-application-id"] = selectedApplicationId;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor (Catches 401 Unauthorized from Server)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      handleUnauthorizedRedirect();
    }
    return Promise.reject(error);
  }
);
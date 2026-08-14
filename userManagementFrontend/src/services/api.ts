import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Request Interceptor (Attaches Token)
api.interceptors.request.use((config: any) => {
  const auth = localStorage.getItem("auth")
    ? JSON.parse(localStorage.getItem("auth")!)
    : null;

  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }

  if (auth?.role === "ADMIN") {
    const selectedApplicationId = localStorage.getItem("selectedApplicationId");

    if (selectedApplicationId) {
      config.headers["x-application-id"] = selectedApplicationId;
    }
  }

  return config;
});

// Response Interceptor (Catches Expired JWT / 401 Unauthorized)
api.interceptors.response.use(
  (response) => response, // Pass successful responses through directly
  (error) => {
    if (error.response?.status === 401) {
      // 1. Clear stored credentials so the user isn't stuck with an invalid token
      localStorage.removeItem("auth");
      localStorage.removeItem("selectedApplicationId");

      // 2. Prevent infinite loops if already on the login page
      if (window.location.pathname !== "/") {
        // Redirect to login page and pass a query param to show an alert/toast
        window.location.href = "/?sessionExpired=true";
      }
    }

    return Promise.reject(error);
  }
);
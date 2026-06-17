import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

api.interceptors.request.use((config: any) => {
  const auth = localStorage.getItem("auth")
    ? JSON.parse(localStorage.getItem("auth")!)
    : null;

  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }

  if (auth?.role === "ADMIN") {
    const selectedApplicationId =
      localStorage.getItem("selectedApplicationId");

    if (selectedApplicationId) {
      config.headers["x-application-id"] =
        selectedApplicationId;
    }
  }

  return config;
});
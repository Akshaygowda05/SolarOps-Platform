import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3000/api",
});


api.interceptors.request.use((config:any) => {
  const token = localStorage.getItem("auth") ? JSON.parse(localStorage.getItem("auth")!).token : null;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if(token?.role === "ADMIN"){
    const selectedApplicationId = localStorage.getItem("selectedApplicationId");
    if(selectedApplicationId){
      config.headers["X-Application-Id"] = selectedApplicationId;
    }
  }

  return config;
});
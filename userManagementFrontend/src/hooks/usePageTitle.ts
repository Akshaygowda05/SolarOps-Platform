import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Map routes to tab titles
const routeTitles: Record<string, string> = {
  "/": "Login | aegeusConnect",
  "/dashboard": "Dashboard | aegeusConnect",
  "/devices": "Devices | aegeusConnect",
  "/multicast-groups": "Multicast Groups | aegeusConnect",
  "/Robotsbatteies": "Batteries | aegeusConnect",
  "/logs": "Logs | aegeusConnect",
  "/reports": "Reports | aegeusConnect",
  "/site-config": "Site Config | aegeusConnect",
  "/admin": "Admin Dashboard | aegeusConnect",
  "/users": "Users Management | aegeusConnect",
  "/tenants": "Tenants | aegeusConnect",
};

export const usePageTitle = () => {
  const location = useLocation();

  useEffect(() => {
    // Dynamic matching for routes or fallbacks
    let title = routeTitles[location.pathname];

    // Handle dynamic params like /devices/:devEui or /users/edit/:id
    if (!title) {
      if (location.pathname.startsWith("/devices/")) {
        title = "Device Detail | aegeusConnect";
      } else if (location.pathname.startsWith("/users/edit/")) {
        title = "Edit User | aegeusConnect";
      } else {
        title = "aegeusConnect";
      }
    }

    document.title = title;
  }, [location]);
};
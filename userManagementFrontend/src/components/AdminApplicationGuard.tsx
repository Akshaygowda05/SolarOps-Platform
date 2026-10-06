// components/AdminApplicationGuard.tsx

import { Navigate } from "react-router-dom";

interface Props {
  children: React.ReactNode;
}

export default function AdminApplicationGuard({
  children,
}: Props) {
  const auth = JSON.parse(
    localStorage.getItem("auth") || "{}"
  );

  if (auth.role === "ADMIN" || auth.role === "SUPERADMIN") {
    const appId =
      localStorage.getItem("selectedApplicationId");

    if (!appId) {
      return <Navigate to={auth.role === "SUPERADMIN" ? "/tenants" : "/admin"} replace />;
    }
  }

  return <>{children}</>;
}
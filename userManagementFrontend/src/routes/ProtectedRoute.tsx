import { Navigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { authState } from "../store/authState";
import type { JSX } from "react";

const ProtectedRoute = ({ allowedRoles, children }: { allowedRoles: string[], children: JSX.Element }) => {
  const auth = useRecoilValue(authState);

  if (!auth.initialized) return null; 

  if (!auth.token) return <Navigate to="/" replace />;

  if (!allowedRoles.includes(auth.role as string)) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
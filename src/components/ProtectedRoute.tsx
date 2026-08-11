import { Navigate, Outlet } from "react-router-dom";

interface PrivateProps {
  redirecionar?: string;
}

export const Private = ({ redirecionar = "/" }: PrivateProps) => {
  const token = localStorage.getItem("token");

  const estaAutenticado = Boolean(
    token && token !== "undefined" && token !== "null",
  );
  if (!estaAutenticado) {
    return <Navigate to={redirecionar} replace />;
  }

  return <Outlet />;
};

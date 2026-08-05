import { Navigate, Outlet } from "react-router-dom";

interface PrivateProps {
  autorizado: boolean;
  redirecionar?: string;
}

export const Private = ({ autorizado, redirecionar = "/" }: PrivateProps) => {
  if (!autorizado) {
    return <Navigate to={redirecionar} />;
  }

  return <Outlet />;
};

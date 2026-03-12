import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, checkSessionExpiration } = useAuth();

  // Verificar expiración de sesión en cada renderizado
  useEffect(() => {
    if (isAuthenticated) {
      checkSessionExpiration();
    }
  }, [isAuthenticated, checkSessionExpiration]);

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ message: "Debes iniciar sesión para acceder a esta sección" }}
      />
    );
  }

  return <Outlet />;
};

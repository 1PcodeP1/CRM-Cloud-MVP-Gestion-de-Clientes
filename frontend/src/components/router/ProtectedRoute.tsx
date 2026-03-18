import React, { useEffect, useRef } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const SESSION_CHECK_INTERVAL = 60 * 1000; // 1 minuto

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, checkSessionExpiration } = useAuth();
  const checkRef = useRef(checkSessionExpiration);
  checkRef.current = checkSessionExpiration;

  // Verificar expiración al entrar a una ruta protegida
  useEffect(() => {
    if (isAuthenticated) {
      checkSessionExpiration();
    }
  }, [isAuthenticated, checkSessionExpiration]);

  // Verificar periódicamente mientras el usuario está en una página protegida
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      checkRef.current();
    }, SESSION_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

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

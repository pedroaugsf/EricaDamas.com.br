import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const RotaProtegida = () => {
  // Verificação simples sem hooks assíncronos
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  // Verificar se o token expirou (24 horas)
  const loginTime = localStorage.getItem("loginTime");
  if (loginTime) {
    const now = Date.now();
    const loginDate = parseInt(loginTime, 10);
    const hoursPassed = (now - loginDate) / (1000 * 60 * 60);

    if (hoursPassed > 24) {
      localStorage.removeItem("token");
      localStorage.removeItem("adminName");
      localStorage.removeItem("loginTime");
      return <Navigate to="/admin/login" replace />;
    }
  }

  // Renovar a sessão
  localStorage.setItem("loginTime", Date.now().toString());

  return <Outlet />;
};

export default RotaProtegida;

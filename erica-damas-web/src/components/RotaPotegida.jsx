import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import authService from "../services/AuthService";

// Mesma janela de tolerância do backend: um token vencido dentro dela ainda é
// renovável, então não faz sentido expulsar o admin aqui.
const TOLERANCIA_MS = 30 * 24 * 60 * 60 * 1000;

const RotaProtegida = () => {
  const token = localStorage.getItem("token");
  const restante = authService.tempoRestanteSessao();

  // Sessão renovável: pede um token novo em segundo plano enquanto a tela abre.
  useEffect(() => {
    if (token) {
      authService.renovarSessao();
    }
  }, [token]);

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  // Vencido além da tolerância — aí não há renovação possível.
  if (restante !== null && restante < -TOLERANCIA_MS) {
    authService.logout();
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default RotaProtegida;

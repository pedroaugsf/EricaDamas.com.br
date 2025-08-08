import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const RotaProtegida = () => {
  // Verificar se o usuário está autenticado
  const estaAutenticado = localStorage.getItem("adminAutenticado") === "true";

  // Se autenticado, renderiza o conteúdo da rota (Outlet)
  // Se não, redireciona para a página de login
  return estaAutenticado ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

export default RotaProtegida;

import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/AuthService";

const Dashboard = () => {
  const navigate = useNavigate();
  const adminName = localStorage.getItem("adminName") || "Administrador";

  // Verificar autenticação ao carregar
  useEffect(() => {
    const verificarAutenticacao = async () => {
      const autenticado = await authService.isAuthenticated();
      if (!autenticado) {
        navigate("/admin/login");
      }
    };

    verificarAutenticacao();
  }, [navigate]);

  // Renovar sessão quando o usuário interagir com o dashboard
  useEffect(() => {
    const renovarSessao = () => {
      authService.renovarSessao();
    };

    // Adicionar event listeners para renovar sessão
    window.addEventListener("click", renovarSessao);
    window.addEventListener("keypress", renovarSessao);

    return () => {
      // Limpar event listeners
      window.removeEventListener("click", renovarSessao);
      window.removeEventListener("keypress", renovarSessao);
    };
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate("/admin/login");
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.titulo}>Painel Administrativo</h1>
        <div style={styles.userInfo}>
          <span style={styles.welcomeText}>Olá, {adminName}</span>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Sair
          </button>
        </div>
      </div>

      <div style={styles.menuContainer}>
        <Link to="/admin/produtos/vestidos" style={styles.menuItem}>
          <div style={styles.menuCard}>
            <h2>Gerenciar Vestidos</h2>
            <p>Adicionar, editar ou remover vestidos de noiva</p>
          </div>
        </Link>
        <Link to="/admin/produtos/ternos" style={styles.menuItem}>
          <div style={styles.menuCard}>
            <h2>Gerenciar Ternos</h2>
            <p>Adicionar, editar ou remover ternos</p>
          </div>
        </Link>
        <Link to="/admin/produtos/debutantes" style={styles.menuItem}>
          <div style={styles.menuCard}>
            <h2>Gerenciar Debutantes</h2>
            <p>Adicionar, editar ou remover vestidos de debutante</p>
          </div>
        </Link>
        <Link to="/admin/contratos" style={styles.menuItem}>
          <div style={styles.menuCard}>
            <h2>Gerenciar Contratos</h2>
            <p>Criar e gerenciar contratos de locação</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "2rem",
    fontFamily: '"Cormorant Garamond", serif',
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
  },
  titulo: {
    fontSize: "2.5rem",
    fontWeight: "300",
    color: "#5d4037",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  welcomeText: {
    fontSize: "1rem",
    color: "#666",
  },
  logoutButton: {
    backgroundColor: "#f5f5f5",
    color: "#333",
    border: "1px solid #ddd",
    padding: "0.5rem 1rem",
    borderRadius: "4px",
    cursor: "pointer",
  },
  menuContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "2rem",
  },
  menuItem: {
    textDecoration: "none",
    color: "inherit",
  },
  menuCard: {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "5px",
    boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
    textAlign: "center",
    transition: "transform 0.3s ease",
    cursor: "pointer",
    border: "1px solid #e0e0e0",
  },
};

export default Dashboard;

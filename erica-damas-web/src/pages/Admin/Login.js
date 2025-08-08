import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  // Credenciais hard-coded (temporárias)
  const ADMIN_EMAIL = "admin@ericadamas.com";
  const ADMIN_SENHA = "admin123";

  const handleSubmit = (e) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    // Verificação simples das credenciais
    if (email === ADMIN_EMAIL && senha === ADMIN_SENHA) {
      // Armazenar estado de autenticação no localStorage
      localStorage.setItem("adminAutenticado", "true");
      navigate("/admin/dashboard");
    } else {
      setErro("Email ou senha incorretos");
    }

    setCarregando(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginCard}>
        <h1 style={styles.titulo}>Área Administrativa</h1>

        {erro && <div style={styles.erro}>{erro}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="senha">Senha:</label>
            <input
              type="password"
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            style={styles.loginButton}
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f9f9f9",
    padding: "1rem",
    fontFamily: '"Cormorant Garamond", serif',
  },
  loginCard: {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "5px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "400px",
  },
  titulo: {
    fontSize: "2rem",
    fontWeight: "300",
    color: "#5d4037",
    textAlign: "center",
    marginBottom: "2rem",
  },
  erro: {
    backgroundColor: "#ffebee",
    color: "#c62828",
    padding: "1rem",
    borderRadius: "4px",
    marginBottom: "1rem",
    fontSize: "0.9rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  input: {
    padding: "0.75rem",
    borderRadius: "4px",
    border: "1px solid #ddd",
    fontSize: "1rem",
  },
  loginButton: {
    backgroundColor: "#b6a06a",
    color: "white",
    border: "none",
    padding: "0.75rem",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "1rem",
    marginTop: "1rem",
  },
};

export default Login;

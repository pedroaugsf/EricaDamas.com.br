import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/AuthService";
const Login = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  // Verificar se já está autenticado
  useEffect(() => {
    const verificarAutenticacao = async () => {
      try {
        const autenticado = await authService.isAuthenticated();
        if (autenticado) {
          navigate("/admin/dashboard");
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
      }
    };

    verificarAutenticacao();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      await authService.login(email, senha);
      navigate("/admin/dashboard");
    } catch (error) {
      setErro(error.message || "Email ou senha incorretos");
      // Limpar senha em caso de erro
      setSenha("");
    } finally {
      setCarregando(false);
    }
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
              autoComplete="username"
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
              autoComplete="current-password"
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

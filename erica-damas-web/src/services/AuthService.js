import axios from "axios";

// Detectar se estamos no GitHub Codespaces
const isCodespaces = window.location.hostname.includes(".app.github.dev");

// Construir a URL da API baseada no ambiente
let API_URL;
if (isCodespaces) {
  // Extrair o prefixo do Codespaces da URL atual
  const codespacePrefix = window.location.hostname.split("-3000")[0];
  API_URL = `https://${codespacePrefix}-5000.app.github.dev/api`;
} else {
  API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
}

console.log(
  "Ambiente detectado:",
  isCodespaces ? "GitHub Codespaces" : "Local/Produção"
);
console.log("API_URL configurada para:", API_URL);

// Configuração do axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("Enviando requisição para:", config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Erro na requisição:", error.response || error);

    // Tratar erro de autenticação (token expirado)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("adminName");
      localStorage.removeItem("loginTime");

      if (!window.location.pathname.includes("/admin/login")) {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);

// Serviço de autenticação
const authService = {
  // Login
  login: async (email, senha) => {
    try {
      console.log(`Tentando login em ${API_URL}/login com email: ${email}`);
      const response = await api.post("/login", { email, senha });
      console.log("Resposta do login:", response.data);

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("adminName", response.data.user.name);
        localStorage.setItem("loginTime", Date.now().toString());
      }
      return response.data;
    } catch (error) {
      console.error("Erro completo:", error);
      console.error("Detalhes da resposta:", error.response?.data);
      console.error("Status do erro:", error.response?.status);
      throw new Error(
        error.response?.data?.message ||
          "Erro ao fazer login. Verifique suas credenciais."
      );
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminName");
    localStorage.removeItem("loginTime");
  },

  // Verificar se está autenticado
  isAuthenticated: async () => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    // Verificar se o token expirou localmente (24h)
    const loginTime = localStorage.getItem("loginTime");
    if (loginTime) {
      const now = Date.now();
      const loginDate = parseInt(loginTime, 10);
      const hoursPassed = (now - loginDate) / (1000 * 60 * 60);

      if (hoursPassed > 24) {
        authService.logout();
        return false;
      }
    }

    try {
      console.log("Verificando autenticação...");
      const response = await api.get("/admin/verificar");
      console.log("Resposta da verificação:", response.data);
      return response.data.success;
    } catch (error) {
      console.error(
        "Erro na verificação de autenticação:",
        error.response?.data || error.message
      );
      authService.logout();
      return false;
    }
  },

  // Renovar sessão (atualizar timestamp)
  renovarSessao: () => {
    localStorage.setItem("loginTime", Date.now().toString());
  },
};

export default authService;
export { api };

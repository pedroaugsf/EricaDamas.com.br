import axios from "axios";

// Detectar ambiente
const isCodespaces = window.location.hostname.includes(".app.github.dev");
const isVercel = window.location.hostname.includes("vercel.app");
const isLocalhost = window.location.hostname === "localhost";

// Construir a URL da API baseada no ambiente
let API_URL;

if (isCodespaces) {
  // GitHub Codespaces
  const codespacePrefix = window.location.hostname.split("-3000")[0];
  API_URL = "https://ericadamas-com-br.onrender.com/api";
} else if (isVercel) {
  // Vercel - usar Render backend
  API_URL = `https://ericadamas-com-br.onrender.com/api`;
} else if (isLocalhost) {
  // Desenvolvimento local
  API_URL = "http://localhost:5000/api";
} else {
  // Produção - usar Render backend
  API_URL =
    process.env.REACT_APP_API_URL ||
    "https://ericadamas-com-br.onrender.com/api";
}

console.log(
  "Ambiente detectado:",
  isCodespaces
    ? "GitHub Codespaces"
    : isVercel
    ? "Vercel (Frontend) + Render (Backend)"
    : isLocalhost
    ? "Local"
    : "Produção"
);
console.log("API_URL configurada para:", API_URL);

// Configuração do axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 segundos para Render cold start
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
    console.log("Enviando requisição para:", config.baseURL + config.url);
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

    // Tratar erro específico do Render (cold start)
    if (error.code === "ECONNABORTED" && error.message.includes("timeout")) {
      console.warn(
        "Timeout na requisição - Render pode estar 'acordando' o servidor"
      );
      return Promise.reject(
        new Error("Servidor está iniciando, tente novamente em alguns segundos")
      );
    }

    // Tratar erro de conexão
    if (error.code === "ERR_NETWORK") {
      console.warn("Erro de rede - verificando conexão com servidor");
      return Promise.reject(
        new Error("Erro de conexão. Verifique sua internet ou tente novamente.")
      );
    }

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

      // Mostrar loading para cold start do Render
      if (API_URL.includes("onrender.com")) {
        console.log(
          "🔄 Conectando ao servidor (pode levar alguns segundos na primeira vez)..."
        );
      }

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

      // Mensagem específica para timeout do Render
      if (error.message.includes("iniciando")) {
        throw new Error(
          "Servidor está iniciando. Aguarde alguns segundos e tente novamente."
        );
      }

      // Mensagem específica para erro de rede
      if (error.message.includes("conexão")) {
        throw new Error(
          "Erro de conexão. Verifique sua internet e tente novamente."
        );
      }

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
    console.log("Logout realizado com sucesso");
  },

  // Verificar se está autenticado
  isAuthenticated: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("Token não encontrado");
      return false;
    }

    // Verificar se o token expirou localmente (24h)
    const loginTime = localStorage.getItem("loginTime");
    if (loginTime) {
      const now = Date.now();
      const loginDate = parseInt(loginTime, 10);
      const hoursPassed = (now - loginDate) / (1000 * 60 * 60);

      if (hoursPassed > 24) {
        console.log("Token expirado localmente (>24h)");
        authService.logout();
        return false;
      }
    }

    try {
      console.log("Verificando autenticação no servidor...");
      const response = await api.get("/admin/verificar");
      console.log("Resposta da verificação:", response.data);
      return response.data.success;
    } catch (error) {
      console.error(
        "Erro na verificação de autenticação:",
        error.response?.data || error.message
      );

      // Se for erro 401, fazer logout
      if (error.response?.status === 401) {
        authService.logout();
      }

      return false;
    }
  },

  // Renovar sessão (atualizar timestamp)
  renovarSessao: () => {
    localStorage.setItem("loginTime", Date.now().toString());
    console.log("Sessão renovada");
  },

  // Função para "acordar" o servidor Render (útil para cold starts)
  wakeUpServer: async () => {
    if (API_URL.includes("onrender.com")) {
      try {
        console.log("🔄 Acordando servidor Render...");
        await api.get("/", { timeout: 30000 });
        console.log("✅ Servidor acordado!");
        return true;
      } catch (error) {
        console.log("⚠️ Servidor ainda inicializando...");
        return false;
      }
    }
    return true;
  },

  // Função para testar conectividade
  testConnection: async () => {
    try {
      console.log("🧪 Testando conexão com a API...");
      const response = await api.get("/", { timeout: 10000 });
      console.log("✅ Conexão OK:", response.data);
      return true;
    } catch (error) {
      console.error("❌ Erro na conexão:", error.message);
      return false;
    }
  },

  // Obter informações do usuário logado
  getUserInfo: () => {
    const adminName = localStorage.getItem("adminName");
    const loginTime = localStorage.getItem("loginTime");
    const token = localStorage.getItem("token");

    return {
      name: adminName,
      loginTime: loginTime ? new Date(parseInt(loginTime)) : null,
      hasToken: !!token,
      isExpired: loginTime
        ? (Date.now() - parseInt(loginTime)) / (1000 * 60 * 60) > 24
        : true,
    };
  },
};

// Função helper para fazer requisições com retry automático
const apiWithRetry = async (requestFn, maxRetries = 2) => {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      console.log(
        `Tentativa ${i + 1}/${maxRetries + 1} falhou:`,
        error.message
      );

      if (i === maxRetries) {
        throw error;
      }

      // Aguardar antes de tentar novamente (especialmente útil para Render cold start)
      if (
        error.message.includes("iniciando") ||
        error.code === "ECONNABORTED"
      ) {
        console.log(
          `Aguardando ${(i + 1) * 3} segundos antes de tentar novamente...`
        );
        await new Promise((resolve) => setTimeout(resolve, (i + 1) * 3000));
      }
    }
  }
};

export default authService;
export { api, apiWithRetry };

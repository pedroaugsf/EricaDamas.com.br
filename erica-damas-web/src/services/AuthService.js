import axios from "axios";

// Detectar ambiente
const isCodespaces = window.location.hostname.includes(".app.github.dev");
const isVercel = window.location.hostname.includes("vercel.app");
const isLocalhost = window.location.hostname === "localhost";

// Construir a URL da API baseada no ambiente
let API_URL;

if (isCodespaces) {
  // GitHub Codespaces
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


// Configuração do axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 50000, // Aumentado para 50s para dar tempo total ao Render de subir o processo
  headers: {
    "Content-Type": "application/json",
  },
});

// ==================== SESSÃO E TOKEN ====================

// Renova o token quando falta menos que isso para vencer. Precisa ser bem maior
// que o tempo de preenchimento de um contrato, senão o token vence com o
// formulário aberto e a requisição de salvar é a que descobre isso.
const MARGEM_RENOVACAO_MS = 12 * 60 * 60 * 1000; // 12h

// De quanto em quanto tempo checar o token com a aba aberta e parada.
const INTERVALO_CHECAGEM_MS = 30 * 60 * 1000; // 30min

// Lê o payload do JWT. Serve só para saber quando ele vence — a validação de
// verdade é sempre no servidor.
const decodificarToken = (token) => {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(json);
  } catch (error) {
    return null;
  }
};

// Quanto tempo falta para o token vencer, em ms. Negativo = já venceu.
// null = não há token ou não foi possível ler a expiração.
const tempoRestanteToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const payload = decodificarToken(token);
  if (!payload?.exp) return null;

  return payload.exp * 1000 - Date.now();
};

const limparSessao = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("adminName");
  localStorage.removeItem("loginTime");
};

// Navegação sem recarregar a página. O reload destruía o estado do React e,
// com ele, o formulário de contrato que estava sendo preenchido.
const redirecionarParaLogin = () => {
  if (window.location.pathname.includes("/admin/login")) return;

  window.history.pushState({}, "", "/admin/login");
  window.dispatchEvent(new PopStateEvent("popstate"));
};

// Uma renovação por vez. Sem isso, várias requisições paralelas com token
// vencido disparariam vários refresh e um sobrescreveria o token do outro.
let renovacaoEmAndamento = null;

const renovarToken = async () => {
  if (renovacaoEmAndamento) return renovacaoEmAndamento;

  const token = localStorage.getItem("token");
  if (!token) return false;

  renovacaoEmAndamento = (async () => {
    try {
      const response = await api.post(
        "/refresh",
        {},
        { _semRenovacao: true, timeout: 30000 }
      );

      if (response.data?.success && response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("loginTime", Date.now().toString());
        return true;
      }

      return false;
    } catch (error) {
      // 401 aqui significa sessão realmente perdida (fora da janela de
      // tolerância ou token adulterado). Qualquer outro erro é falha de rede /
      // servidor dormindo: mantém o token para tentar de novo depois.
      if (error.response?.status === 401) {
        limparSessao();
      }
      return false;
    } finally {
      renovacaoEmAndamento = null;
    }
  })();

  return renovacaoEmAndamento;
};

// Renova de forma preventiva se estiver perto de vencer.
const garantirTokenValido = async () => {
  const restante = tempoRestanteToken();
  if (restante === null) return;

  if (restante < MARGEM_RENOVACAO_MS) {
    await renovarToken();
  }
};

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  async (config) => {
    // A própria chamada de refresh não pode passar por aqui, senão vira loop.
    if (!config._semRenovacao) {
      await garantirTokenValido();
    }

    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Retry automático 1x para cold start (timeout ou rede)
const retryRequest = (config) => {
  return new Promise((resolve) => setTimeout(resolve, 4000))
    .then(() => api.request({ ...config, _retry: true }));
};

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const isColdStart =
      (error.code === "ECONNABORTED" && error.message.includes("timeout")) ||
      error.code === "ERR_NETWORK";

    // Retry automático 1x durante cold start
    if (isColdStart && !error.config?._retry) {
      console.warn("Cold start detectado — retentando em 4s...");
      return retryRequest(error.config);
    }

    // Tratar erro específico do Render (cold start)
    if (error.code === "ECONNABORTED" && error.message.includes("timeout")) {
      return Promise.reject(
        new Error("Servidor está iniciando, tente novamente em alguns segundos")
      );
    }

    // Tratar erro de conexão
    if (error.code === "ERR_NETWORK") {
      return Promise.reject(
        new Error("Erro de conexão. Verifique sua internet ou tente novamente.")
      );
    }

    // Tratar erro de autenticação: antes de derrubar a sessão, tenta renovar o
    // token e repetir a requisição. É o que evita perder um contrato inteiro
    // porque o token venceu durante o preenchimento.
    if (error.response && error.response.status === 401) {
      const config = error.config || {};

      if (!config._semRenovacao && !config._authRetry) {
        const renovou = await renovarToken();

        if (renovou) {
          return api.request({ ...config, _authRetry: true });
        }
      }

      limparSessao();
      redirecionarParaLogin();
    }

    return Promise.reject(error);
  }
);

// Com a aba aberta e parada não há requisição nenhuma para disparar o
// interceptor, então o token venceria em silêncio. Esse timer cobre esse caso.
let timerRenovacao = null;

const iniciarRenovacaoAutomatica = () => {
  if (timerRenovacao) return;

  timerRenovacao = setInterval(() => {
    if (localStorage.getItem("token")) {
      garantirTokenValido();
    }
  }, INTERVALO_CHECAGEM_MS);
};

if (localStorage.getItem("token")) {
  iniciarRenovacaoAutomatica();
}

// Serviço de autenticação
const authService = {
  // Login
  login: async (email, senha) => {
    try {

      // Mostrar loading para cold start do Render
      if (API_URL.includes("onrender.com")) {
      }

      const response = await api.post("/login", { email, senha });

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("adminName", response.data.user.name);
        localStorage.setItem("loginTime", Date.now().toString());
        iniciarRenovacaoAutomatica();
      }
      return response.data;
    } catch (error) {

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
    limparSessao();
  },

  // Verificar se está autenticado
  isAuthenticated: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      return false;
    }

    // Se o token venceu, tenta renovar antes de desistir. O servidor aceita
    // token vencido dentro da janela de tolerância.
    const restante = tempoRestanteToken();
    if (restante !== null && restante <= 0) {
      const renovou = await renovarToken();
      if (!renovou) {
        return false;
      }
    }

    try {
      const response = await api.get("/admin/verificar");
      return response.data.success;
    } catch (error) {
      // Só considera desautenticado num 401 — servidor fora do ar ou sem
      // internet não é motivo para expulsar quem tem token válido.
      if (error.response?.status === 401) {
        return false;
      }

      return tempoRestanteToken() > 0;
    }
  },

  // Renovar sessão de verdade (troca o token, não só o timestamp local)
  renovarSessao: () => {
    localStorage.setItem("loginTime", Date.now().toString());
    garantirTokenValido();
  },

  // Quanto tempo resta de sessão, em ms (null se não houver token)
  tempoRestanteSessao: tempoRestanteToken,

  // Força a renovação do token agora
  forcarRenovacao: renovarToken,

  // Função para "acordar" o servidor Render (útil para cold starts)
  wakeUpServer: async () => {
    if (API_URL.includes("onrender.com")) {
      try {
        await api.get("/", { timeout: 30000 });
        return true;
      } catch (error) {
        return false;
      }
    }
    return true;
  },

  // Função para testar conectividade
  testConnection: async () => {
    try {
      const response = await api.get("/", { timeout: 10000 });
      return true;
    } catch (error) {
      return false;
    }
  },

  // Obter informações do usuário logado
  getUserInfo: () => {
    const adminName = localStorage.getItem("adminName");
    const loginTime = localStorage.getItem("loginTime");
    const token = localStorage.getItem("token");
    const restante = tempoRestanteToken();

    return {
      name: adminName,
      loginTime: loginTime ? new Date(parseInt(loginTime)) : null,
      hasToken: !!token,
      isExpired: restante === null ? true : restante <= 0,
    };
  },
};

// Função helper para fazer requisições com retry automático
const apiWithRetry = async (requestFn, maxRetries = 2) => {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {

      if (i === maxRetries) {
        throw error;
      }

      // Aguardar antes de tentar novamente (especialmente útil para Render cold start)
      if (
        error.message.includes("iniciando") ||
        error.code === "ECONNABORTED"
      ) {
        await new Promise((resolve) => setTimeout(resolve, (i + 1) * 3000));
      }
    }
  }
};

export default authService;
export { api, apiWithRetry };

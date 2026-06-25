import React, { useEffect, useState, useMemo, lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

// Componentes críticos (carregados imediatamente — aparecem no First Paint)
import Header from "./components/Header";
import Footer from "./components/Footer";
import HeroFeature from "./components/HeroFeature";
import RotaProtegida from "./components/RotaPotegida";

// CategoriasCarrossel carrega react-slick (~30KB) + 2 CSS — lazy para não bloquear o First Paint
const CategoriasCarrossel = lazy(() => import("./components/CategoriasCarrossel"));

// Componentes secundários da home (lazy — abaixo da dobra)
const About = lazy(() => import("./components/About"));
const Depoimentos = lazy(() => import("./components/Depoimentos"));
const Localizacao = lazy(() => import("./components/Localizacao"));
const FAQ = lazy(() => import("./components/Faq"));
const NossosServicos = lazy(() => import("./components/NovosServicos"));
const GerenciadorContratos = lazy(() => import("./pages/Admin/GerenciadorContrato"));

// Páginas de produtos (lazy — só carregam quando o usuário navega)
const Vestidos = lazy(() => import("./pages/Vestidos"));
const Ternos = lazy(() => import("./pages/Ternos"));
const Debutantes = lazy(() => import("./pages/Debutantes"));

// Páginas administrativas (lazy — 99% dos usuários nunca acessam)
const Login = lazy(() => import("./pages/Admin/Login"));
const Dashboard = lazy(() => import("./pages/Admin/Dashboard"));
const GerenciadorProdutos = lazy(() => import("./pages/Admin/GerenciarProdutos"));

// Fallback minimalista de carregamento
const PageLoader = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "40vh" }}>
    <div style={{
      width: "32px", height: "32px",
      border: "2px solid #e8e8e8",
      borderTopColor: "#b6a06a",
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ========== DETECÇÃO MOBILE INSTANTÂNEA ==========

// Detecção síncrona ultra-rápida
const getInitialDeviceInfo = () => {
  if (typeof window === "undefined") {
    return { isMobile: false, screenWidth: 0, screenHeight: 0 };
  }

  // Verificação principal baseada na largura (mais rápida)
  const screenWidth = window.innerWidth;
  const isMobile = screenWidth <= 768;

  return {
    isMobile,
    screenWidth,
    screenHeight: window.innerHeight,
    userAgent:
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ),
  };
};

// Hook de detecção otimizado
const useDeviceDetection = () => {
  const [deviceInfo, setDeviceInfo] = useState(getInitialDeviceInfo);

  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth <= 768;

      // Só atualizar se realmente mudou
      if (newIsMobile !== deviceInfo.isMobile) {
        setDeviceInfo({
          isMobile: newIsMobile,
          screenWidth: window.innerWidth,
          screenHeight: window.innerHeight,
          userAgent: deviceInfo.userAgent,
        });
      }
    };

    // Debounce otimizado
    let resizeTimeout;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 50);
    };

    window.addEventListener("resize", debouncedResize, { passive: true });

    return () => {
      window.removeEventListener("resize", debouncedResize);
      clearTimeout(resizeTimeout);
    };
  }, [deviceInfo.isMobile]);

  return deviceInfo;
};

// Context do dispositivo
const DeviceContext = React.createContext();

const DeviceProvider = ({ children }) => {
  const deviceInfo = useDeviceDetection();

  const contextValue = useMemo(() => deviceInfo, [deviceInfo.isMobile]);

  return (
    <DeviceContext.Provider value={contextValue}>
      {children}
    </DeviceContext.Provider>
  );
};

// Hook para usar o dispositivo
export const useDevice = () => {
  const context = React.useContext(DeviceContext);
  return context || getInitialDeviceInfo();
};

// ========== COMPONENTES DE PÁGINA ==========

// Componente para redirecionamentos
const RedirectToComponent = ({ targetId }) => {
  useEffect(() => {
    window.location.href = `/#${targetId}`;
  }, [targetId]);

  return <div>Redirecionando...</div>;
};

// Página inicial
const Home = () => {
  const location = useLocation();
  const { isMobile } = useDevice();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        setTimeout(
          () => {
            element.scrollIntoView({
              behavior: "smooth",
              block: isMobile ? "center" : "start",
            });
          },
          isMobile ? 50 : 25
        );
      }
    }
  }, [location, isMobile]);

  return (
    <div>
      <HeroFeature />
      <Suspense fallback={null}>
        <CategoriasCarrossel />
        <div id="nossos-servicos">
          <NossosServicos />
        </div>
        <div id="localizacao">
          <Localizacao />
        </div>
        <FAQ />
      </Suspense>
    </div>
  );
};

// Layout público
const PublicLayout = () => {
  const { isMobile } = useDevice();

  const layoutStyles = useMemo(
    () => ({
      flex: 1,
      padding: 0,
      margin: 0,
      overflowX: "hidden",
      ...(isMobile && {
        WebkitOverflowScrolling: "touch",
      }),
    }),
    [isMobile]
  );

  return (
    <div>
      <Header />
      <main style={layoutStyles}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/vestidos" element={<Vestidos />} />
            <Route path="/ternos" element={<Ternos />} />
            <Route path="/debutantes" element={<Debutantes />} />
            <Route
              path="/sobre"
              element={<RedirectToComponent targetId="nossos-servicos" />}
            />
            <Route
              path="/contato"
              element={<RedirectToComponent targetId="localizacao" />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

// ========== BANNER COLD START ==========

const ColdStartBanner = ({ visible, onHide }) => {
  if (!visible) return null;
  return (
    <div style={{
      position: "fixed",
      bottom: "24px",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 9999,
      backgroundColor: "#3a2f28",
      color: "#f6f1ea",
      padding: "14px 24px",
      borderRadius: "999px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
      fontSize: "0.85rem",
      letterSpacing: "0.03em",
      whiteSpace: "nowrap",
      animation: "slideUp 0.4s ease",
    }}>
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateX(-50%) translateY(16px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
      <span style={{
        width: "14px", height: "14px",
        border: "2px solid rgba(246,241,234,0.3)",
        borderTopColor: "#b6a06a",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
        flexShrink: 0,
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      Servidor iniciando, aguarde um instante...
    </div>
  );
};

// ========== COMPONENTE PRINCIPAL ==========

function App() {
  const [serverWaking, setServerWaking] = useState(false);

  // Acordar o backend Render — mostra banner se demorar mais de 10s
  useEffect(() => {
    const apiBase = process.env.REACT_APP_API_URL ||
      "https://ericadamas-com-br.onrender.com/api";
    const healthUrl = apiBase.replace("/api", "") + "/health";

    const bannerTimer = setTimeout(() => setServerWaking(true), 10000);

    const warmup = async () => {
      try {
        await fetch(healthUrl, {
          method: "GET",
          cache: "no-store",
          signal: AbortSignal.timeout(50000),
        });
      } catch (_) {
        // silencioso
      } finally {
        clearTimeout(bannerTimer);
        setServerWaking(false);
      }
    };
    warmup();

    return () => clearTimeout(bannerTimer);
  }, []);

  // Aplicar configurações imediatas
  useEffect(() => {
    const initialInfo = getInitialDeviceInfo();

    // Aplicar classes CSS imediatamente
    document.body.classList.toggle("is-mobile", initialInfo.isMobile);
    document.body.classList.toggle("is-desktop", !initialInfo.isMobile);

    // Configurar viewport
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      viewportMeta = document.createElement("meta");
      viewportMeta.name = "viewport";
      document.head.appendChild(viewportMeta);
    }

    viewportMeta.content = initialInfo.isMobile
      ? "width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes"
      : "width=device-width, initial-scale=1.0";
  }, []);

  return (
    <DeviceProvider>
      <Router>
        <div style={styles.appContainer}>
          <ColdStartBanner visible={serverWaking} />
          <Routes>
            {/* Rotas administrativas */}
            <Route path="/admin/login" element={<Suspense fallback={<PageLoader />}><Login /></Suspense>} />
            <Route path="/admin" element={<RotaProtegida />}>
              <Route path="dashboard" element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
              <Route path="contratos" element={<Suspense fallback={<PageLoader />}><GerenciadorContratos /></Suspense>} />
              <Route
                path="produtos/:tipoProduto"
                element={<Suspense fallback={<PageLoader />}><GerenciadorProdutos /></Suspense>}
              />
              <Route
                index
                element={<Navigate to="/admin/dashboard" replace />}
              />
            </Route>

            {/* Rotas públicas */}
            <Route path="/*" element={<PublicLayout />} />
          </Routes>
        </div>
      </Router>
    </DeviceProvider>
  );
}

const styles = {
  appContainer: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    margin: 0,
    padding: 0,
    backgroundColor: "#f9f9f9",
  },
};

// CSS crítico para evitar flash
const criticalCSS = `
body.is-mobile {
  -webkit-overflow-scrolling: touch;
  -webkit-tap-highlight-color: transparent;
  overflow-x: hidden;
}

body.is-desktop {
  overflow-x: hidden;
}

/* Garantir que o conteúdo só apareça após a detecção */
body:not(.is-mobile):not(.is-desktop) {
  visibility: hidden;
}

body.is-mobile, body.is-desktop {
  visibility: visible;
  transition: visibility 0.1s;
}

/* Scroll suave */
@media (prefers-reduced-motion: no-preference) {
  html {
    scroll-behavior: smooth;
  }
}

/* Prevenir zoom em inputs mobile */
@media (max-width: 768px) {
  input[type="text"],
  input[type="email"], 
  input[type="tel"],
  select,
  textarea {
    font-size: 16px !important;
  }
}

/* Otimizações de performance */
* {
  box-sizing: border-box;
}

img {
  max-width: 100%;
  height: auto;
}
`;

// Injetar CSS imediatamente
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = criticalCSS;
  document.head.appendChild(style);
}

export default App;

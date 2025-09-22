import React, { useEffect, useState, useMemo } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

// Componentes da página inicial
import Header from "./components/Header";
import Footer from "./components/Footer";
import About from "./components/About";
import Depoimentos from "./components/Depoimentos";
import CarrosselVitrine from "./components/CarrosselVitrine";
import Localizacao from "./components/Localizacao";
import FAQ from "./components/Faq";
import CategoriasCarrossel from "./components/CategoriasCarrossel";
import NossosServicos from "./components/NovosServicos";
import GerenciadorContratos from "./pages/Admin/GerenciadorContrato";

// Páginas de produtos
import Vestidos from "./pages/Vestidos";
import Ternos from "./pages/Ternos";
import Debutantes from "./pages/Debutantes";

// Páginas administrativas
import Login from "./pages/Admin/Login";
import Dashboard from "./pages/Admin/Dashboard";
import GerenciadorProdutos from "./pages/Admin/GerenciarProdutos";

// Importar o componente RotaProtegida
import RotaProtegida from "./components/RotaPotegida";

// ========== SISTEMA DE DETECÇÃO ULTRA-RÁPIDA DE MOBILE ==========

// Detecção instantânea via User Agent (mais rápida)
const detectMobileUserAgent = () => {
  const ua = navigator.userAgent;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    ua
  );
};

// Detecção via características do dispositivo
const detectMobileFeatures = () => {
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
};

// Detecção via media query (mais precisa)
const detectMobileMediaQuery = () => {
  return window.matchMedia("(max-width: 768px)").matches;
};

// Detecção combinada ultra-rápida
const detectMobileDevice = () => {
  const performance_start = performance.now();

  // Primeira verificação: User Agent (mais rápida)
  const isMobileUA = detectMobileUserAgent();

  // Segunda verificação: Largura da tela
  const isMobileWidth = window.innerWidth <= 768;

  // Terceira verificação: Características touch
  const isMobileTouch = detectMobileFeatures();

  // Quarta verificação: Media Query
  const isMobileMedia = detectMobileMediaQuery();

  // Algoritmo de decisão ponderado
  let mobileScore = 0;
  if (isMobileUA) mobileScore += 3; // Peso alto para UA
  if (isMobileWidth) mobileScore += 2; // Peso médio para largura
  if (isMobileTouch) mobileScore += 2; // Peso médio para touch
  if (isMobileMedia) mobileScore += 1; // Peso baixo para media query

  const isMobile = mobileScore >= 3; // Threshold para considerar mobile

  const performance_end = performance.now();

  // Log apenas em desenvolvimento
  if (process.env.NODE_ENV === "development") {
    console.log(
      `📱 Detecção mobile executada em ${(
        performance_end - performance_start
      ).toFixed(2)}ms`
    );
    console.log(
      `🔍 Resultado: ${
        isMobile ? "MOBILE" : "DESKTOP"
      } (Score: ${mobileScore}/8)`
    );
  }

  return {
    isMobile,
    details: {
      userAgent: isMobileUA,
      width: isMobileWidth,
      touch: isMobileTouch,
      mediaQuery: isMobileMedia,
      score: mobileScore,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
    },
  };
};

// Hook customizado para detecção de mobile com cache
const useMobileDetection = () => {
  const [deviceInfo, setDeviceInfo] = useState(() => {
    // Detecção inicial síncrona
    return detectMobileDevice();
  });

  useEffect(() => {
    let resizeTimeout;

    const handleResize = () => {
      // Debounce para evitar múltiplas execuções
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setDeviceInfo(detectMobileDevice());
      }, 100);
    };

    // Listener otimizado para resize
    window.addEventListener("resize", handleResize, { passive: true });

    // Listener para mudança de orientação
    window.addEventListener(
      "orientationchange",
      () => {
        setTimeout(() => {
          setDeviceInfo(detectMobileDevice());
        }, 200);
      },
      { passive: true }
    );

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  return deviceInfo;
};

// Context para compartilhar informações do dispositivo
const DeviceContext = React.createContext();

// Provider para informações do dispositivo
const DeviceProvider = ({ children }) => {
  const deviceInfo = useMobileDetection();

  return (
    <DeviceContext.Provider value={deviceInfo}>
      {children}
    </DeviceContext.Provider>
  );
};

// Hook para usar o contexto do dispositivo
export const useDevice = () => {
  const context = React.useContext(DeviceContext);
  if (!context) {
    throw new Error("useDevice deve ser usado dentro de DeviceProvider");
  }
  return context;
};

// ========== COMPONENTES OTIMIZADOS ==========

// Componente para lidar com redirecionamentos específicos
const RedirectToComponent = ({ targetId }) => {
  useEffect(() => {
    window.location.href = `/#${targetId}`;
  }, [targetId]);

  return <div>Redirecionando...</div>;
};

// Componente da página inicial
const Home = () => {
  const location = useLocation();
  const { isMobile } = useDevice();

  // Efeito para lidar com navegação por hash na URL
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        const scrollDelay = isMobile ? 150 : 100; // Delay maior para mobile
        setTimeout(() => {
          element.scrollIntoView({
            behavior: "smooth",
            block: isMobile ? "center" : "start", // Ajuste para mobile
          });
        }, scrollDelay);
      }
    }
  }, [location, isMobile]);

  return (
    <div>
      <CarrosselVitrine />
      <CategoriasCarrossel />
      <div id="nossos-servicos">
        <NossosServicos />
      </div>
      <About />
      <div id="localizacao">
        <Localizacao />
      </div>
      {/* <Depoimentos /> */}
      <FAQ />
    </div>
  );
};

// Layout para páginas públicas otimizado
const PublicLayout = () => {
  const { isMobile, details } = useDevice();

  // Estilos condicionais baseados no dispositivo
  const layoutStyles = useMemo(
    () => ({
      ...styles.mainContent,
      // Otimizações específicas para mobile
      ...(isMobile && {
        overflowX: "hidden",
        WebkitOverflowScrolling: "touch", // Scroll suave no iOS
        transform: "translateZ(0)", // Força aceleração de hardware
      }),
    }),
    [isMobile]
  );

  return (
    <div>
      <Header />
      <main style={layoutStyles}>
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
        </Routes>
      </main>
      <Footer />

      {/* Debug info apenas em desenvolvimento */}
      {process.env.NODE_ENV === "development" && (
        <div style={styles.debugInfo}>
          <small>
            📱 {isMobile ? "MOBILE" : "DESKTOP"} | 📏 {details.screenWidth}x
            {details.screenHeight} | 🎯 Score: {details.score}/8
          </small>
        </div>
      )}
    </div>
  );
};

// Componente principal da aplicação
function App() {
  // Aplicar classes CSS globais baseadas no dispositivo
  useEffect(() => {
    const { isMobile } = detectMobileDevice();

    // Adicionar classes CSS ao body
    document.body.classList.toggle("is-mobile", isMobile);
    document.body.classList.toggle("is-desktop", !isMobile);

    // Meta tag para viewport otimizado
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      viewportMeta = document.createElement("meta");
      viewportMeta.name = "viewport";
      document.head.appendChild(viewportMeta);
    }

    // Viewport otimizado para cada tipo de dispositivo
    viewportMeta.content = isMobile
      ? "width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes"
      : "width=device-width, initial-scale=1.0";

    // Preload de recursos críticos para mobile
    if (isMobile) {
      const preloadLink = document.createElement("link");
      preloadLink.rel = "preload";
      preloadLink.as = "style";
      preloadLink.href =
        "data:text/css,body.is-mobile{-webkit-overflow-scrolling:touch;transform:translateZ(0);}";
      document.head.appendChild(preloadLink);
    }
  }, []);

  return (
    <DeviceProvider>
      <Router>
        <div style={styles.appContainer}>
          <Routes>
            {/* Rotas administrativas */}
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin" element={<RotaProtegida />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="contratos" element={<GerenciadorContratos />} />
              <Route
                path="produtos/:tipoProduto"
                element={<GerenciadorProdutos />}
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
  mainContent: {
    flex: 1,
    padding: 0,
    margin: 0,
    overflowX: "hidden",
    // Otimizações de performance
    willChange: "transform",
    backfaceVisibility: "hidden",
  },
  debugInfo: {
    position: "fixed",
    bottom: "10px",
    right: "10px",
    background: "rgba(0,0,0,0.8)",
    color: "white",
    padding: "5px 10px",
    borderRadius: "4px",
    fontSize: "10px",
    zIndex: 9999,
    pointerEvents: "none",
  },
};

// CSS Global para otimizações de dispositivo
const globalStyles = `
/* Otimizações para mobile */
body.is-mobile {
  -webkit-overflow-scrolling: touch;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  transform: translateZ(0);
}

body.is-mobile * {
  -webkit-tap-highlight-color: transparent;
}

/* Otimizações para desktop */
body.is-desktop {
  overflow-x: hidden;
}

/* Scroll suave universal */
html {
  scroll-behavior: smooth;
}

/* Prevenção de zoom acidental no mobile */
@media (max-width: 768px) {
  input, select, textarea {
    font-size: 16px !important;
  }
}
`;

// Injetar estilos globais
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = globalStyles;
  document.head.appendChild(styleSheet);
}

export default App;

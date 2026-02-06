import React, { useEffect, useState, useMemo } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

// Componentes da página inicial
import Header from "./components/Header";
import Footer from "./components/Footer";
import About from "./components/About";
import Depoimentos from "./components/Depoimentos";
import Localizacao from "./components/Localizacao";
import FAQ from "./components/Faq";
import CategoriasCarrossel from "./components/CategoriasCarrossel";
import HeroFeature from "./components/HeroFeature";
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
      <CategoriasCarrossel />
      <div id="nossos-servicos">
        <NossosServicos />
      </div>
      <div id="localizacao">
        <Localizacao />
      </div>
      <FAQ />
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
    </div>
  );
};

// ========== COMPONENTE PRINCIPAL ==========

function App() {
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

import React, { useEffect } from "react";
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

  // Efeito para lidar com navegação por hash na URL
  useEffect(() => {
    // Verificar se há um hash na URL
    if (location.hash) {
      const id = location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }
  }, [location]);

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
      <Depoimentos />
      <FAQ />
    </div>
  );
};

// Layout para páginas públicas
const PublicLayout = () => {
  return (
    <div>
      <Header />
      <main style={styles.mainContent}>
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

function App() {
  return (
    <Router>
      <div style={styles.appContainer}>
        <Routes>
          {/* Rotas administrativas */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<RotaProtegida />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="/admin/contratos" element={<GerenciadorContratos />} />

            <Route
              path="produtos/:tipoProduto"
              element={<GerenciadorProdutos />}
            />
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
          </Route>

          {/* Rotas públicas */}
          <Route path="/*" element={<PublicLayout />} />
        </Routes>
      </div>
    </Router>
  );
}

const styles = {
  appContainer: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    margin: 0,
    padding: 0,
    backgroundColor: "#f9f9f9", // Cor de fundo para as outras seções
  },
  mainContent: {
    flex: 1,
    padding: 0,
    margin: 0,
    // Remove qualquer overflow que possa cortar o carrossel
    overflowX: "hidden",
  },
};

export default App;

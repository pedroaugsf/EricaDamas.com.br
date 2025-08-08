import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
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
// Páginas de produtos
import Vestidos from "./pages/Vestidos";
import Ternos from "./pages/Ternos";

// Páginas administrativas
import Login from "./pages/Admin/Login";
import Dashboard from "./pages/Admin/Dashboard";
import GerenciadorProdutos from "./pages/Admin/GerenciarProdutos";
// Componente de rota protegida
import RotaProtegida from "./components/RotaPotegida";
// Componente da página inicial
const Home = () => {
  return (
    <div>
      <CarrosselVitrine />
      <CategoriasCarrossel />
      <NossosServicos />
      <About />
      <Localizacao />
      <Depoimentos />
      <FAQ />
    </div>
  );
};

// Layout para páginas públicas
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

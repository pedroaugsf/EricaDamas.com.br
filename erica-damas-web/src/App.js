import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import About from "./components/About";
import Depoimentos from "./components/Depoimentos";
import CarrosselVitrine from "./components/CarrosselVitrine";
import Localizacao from "./components/Localizacao";
import FAQ from "./components/Faq";

function App() {
  return (
    <Router>
      <div style={styles.appContainer}>
        <Header />

        <main style={styles.mainContent}>
          <CarrosselVitrine />
          <About />
          <Localizacao />
          <Depoimentos />
          <FAQ />
        </main>

        <Footer />
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

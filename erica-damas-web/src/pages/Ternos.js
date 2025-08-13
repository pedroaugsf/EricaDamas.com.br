import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";

const Ternos = () => {
  const [ternos, setTernos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [ternoSelecionado, setTernoSelecionado] = useState(null);
  const [erro, setErro] = useState("");

  // Detectar URL da API
  const getApiUrl = () => {
    const isCodespaces = window.location.hostname.includes(".app.github.dev");
    if (isCodespaces) {
      const codespacePrefix = window.location.hostname.split("-3000")[0];
      return `https://${codespacePrefix}-5000.app.github.dev`;
    }
    return process.env.REACT_APP_API_URL || "http://localhost:5000";
  };

  // Carregar ternos da API
  const carregarTernos = async () => {
    try {
      setCarregando(true);
      const API_URL = getApiUrl();

      console.log(
        "Carregando ternos da API:",
        `${API_URL}/api/produtos/ternos`
      );

      const response = await fetch(`${API_URL}/api/produtos/ternos`);
      const result = await response.json();

      if (result.success) {
        setTernos(result.produtos);
        console.log(`✅ ${result.produtos.length} ternos carregados`);
      } else {
        setErro("Erro ao carregar ternos: " + result.message);
        console.error("Erro na API:", result.message);
      }
    } catch (error) {
      console.error("Erro ao carregar ternos:", error);
      setErro("Erro ao conectar com o servidor");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarTernos();
  }, []);

  const abrirModal = (terno) => {
    setTernoSelecionado(terno);
    document.body.style.overflow = "hidden";
  };

  const fecharModal = () => {
    setTernoSelecionado(null);
    document.body.style.overflow = "auto";
  };

  const gerarMensagemWhatsApp = (terno) => {
    const mensagem = `Olá! Gostaria de saber mais sobre o terno "${terno.nome}". Poderia me dar mais informações sobre disponibilidade e valores?`;
    return `https://wa.me/5511999999999?text=${encodeURIComponent(mensagem)}`;
  };

  return (
    <section style={styles.ternosContainer}>
      <Helmet>
        <title>Erica Damas - Ternos</title>
        <meta
          name="description"
          content="Conheça nossa coleção exclusiva de ternos elegantes e sofisticados."
        />
        <meta
          name="keywords"
          content="ternos, casamento, noivo, terno masculino"
        />
      </Helmet>

      <div style={styles.tituloContainer}>
        <h1 style={styles.titulo}>TERNOS</h1>
        <div style={styles.divisor}></div>
      </div>

      {erro && (
        <div style={styles.erro}>
          {erro}
          <button onClick={carregarTernos} style={styles.retryButton}>
            Tentar novamente
          </button>
        </div>
      )}

      {carregando ? (
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>Carregando nossa coleção...</p>
        </div>
      ) : ternos.length === 0 ? (
        <div style={styles.emptyMessage}>
          <h2>Em breve, novos ternos exclusivos</h2>
          <p>
            Nossa coleção está sendo atualizada. Entre em contato para conhecer
            nossas opções disponíveis.
          </p>
          <a
            href="https://wa.me/5511999999999?text=Olá,%20gostaria%20de%20conhecer%20os%20ternos%20disponíveis"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.contactButton}
          >
            Fale Conosco
          </a>
        </div>
      ) : (
        <div style={styles.ternosGrid}>
          {ternos.map((terno) => (
            <div
              key={terno._id}
              style={styles.ternoCard}
              onClick={() => abrirModal(terno)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.05)";
              }}
            >
              {terno.imagens && terno.imagens[0] && (
                <div style={styles.ternoImageContainer}>
                  <img
                    src={terno.imagens[0]}
                    alt={terno.nome}
                    style={styles.ternoImage}
                    onError={(e) => {
                      e.target.style.backgroundColor = "#f5f5f5";
                      e.target.alt = "Imagem não disponível";
                    }}
                  />
                  {terno.imagens.length > 1 && (
                    <div style={styles.imageCount}>
                      +{terno.imagens.length - 1}
                    </div>
                  )}
                </div>
              )}
              <div style={styles.ternoInfo}>
                <h3 style={styles.ternoName}>{terno.nome}</h3>
                <p style={styles.ternoDescription}>
                  {terno.descricao.length > 100
                    ? terno.descricao.substring(0, 100) + "..."
                    : terno.descricao}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {ternoSelecionado && (
        <div style={styles.modalOverlay} onClick={fecharModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeButton} onClick={fecharModal}>
              ×
            </button>

            <div style={styles.modalGrid}>
              <div style={styles.modalImageSection}>
                {ternoSelecionado.imagens &&
                  ternoSelecionado.imagens.length > 0 && (
                    <img
                      src={ternoSelecionado.imagens[0]}
                      alt={ternoSelecionado.nome}
                      style={styles.modalImage}
                    />
                  )}
              </div>

              <div style={styles.modalInfoSection}>
                <h2 style={styles.modalTitle}>{ternoSelecionado.nome}</h2>
                <div style={styles.modalDescription}>
                  {ternoSelecionado.descricao}
                </div>

                <div style={styles.modalActions}>
                  <a
                    href={gerarMensagemWhatsApp(ternoSelecionado)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.whatsappButton}
                  >
                    💬 Consultar no WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

// Estilos (iguais ao Vestidos.jsx, só mudando as classes)
const styles = {
  ternosContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "4rem 2rem",
    fontFamily: '"Cormorant Garamond", serif',
  },
  tituloContainer: {
    textAlign: "center",
    marginBottom: "3rem",
  },
  titulo: {
    fontSize: "2.5rem",
    fontWeight: "300",
    letterSpacing: "3px",
    color: "#5d4037",
    marginBottom: "1rem",
    textTransform: "uppercase",
  },
  divisor: {
    width: "80px",
    height: "2px",
    backgroundColor: "#b6a06a",
    margin: "0 auto",
  },
  erro: {
    backgroundColor: "#ffebee",
    color: "#c62828",
    padding: "1rem",
    borderRadius: "4px",
    marginBottom: "2rem",
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "1rem",
  },
  retryButton: {
    backgroundColor: "#c62828",
    color: "white",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "4px",
    cursor: "pointer",
  },
  loading: {
    textAlign: "center",
    fontSize: "1.2rem",
    color: "#666",
    padding: "4rem 0",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid #f3f3f3",
    borderTop: "3px solid #b6a06a",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 1rem",
  },
  emptyMessage: {
    textAlign: "center",
    padding: "4rem 2rem",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
  },
  contactButton: {
    display: "inline-block",
    backgroundColor: "#b6a06a",
    color: "white",
    padding: "1rem 2rem",
    borderRadius: "4px",
    textDecoration: "none",
    marginTop: "1rem",
    transition: "background-color 0.3s",
  },
  ternosGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "2rem",
  },
  ternoCard: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    cursor: "pointer",
    transition: "all 0.3s ease",
    position: "relative",
  },
  ternoImageContainer: {
    height: "350px",
    overflow: "hidden",
    position: "relative",
  },
  ternoImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.5s ease",
  },
  imageCount: {
    position: "absolute",
    top: "10px",
    right: "10px",
    backgroundColor: "rgba(0,0,0,0.7)",
    color: "white",
    padding: "0.25rem 0.5rem",
    borderRadius: "12px",
    fontSize: "0.8rem",
  },
  ternoInfo: {
    padding: "1.5rem",
    textAlign: "center",
  },
  ternoName: {
    fontSize: "1.3rem",
    fontWeight: "400",
    color: "#5d4037",
    marginBottom: "0.5rem",
  },
  ternoDescription: {
    fontSize: "0.9rem",
    color: "#666",
    lineHeight: "1.4",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "1rem",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    maxWidth: "1000px",
    width: "100%",
    maxHeight: "90vh",
    overflow: "auto",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: "15px",
    right: "20px",
    fontSize: "2rem",
    background: "rgba(0,0,0,0.5)",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    cursor: "pointer",
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    minHeight: "500px",
  },
  modalImageSection: {
    padding: "2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalImage: {
    width: "100%",
    height: "auto",
    maxHeight: "60vh",
    objectFit: "contain",
    borderRadius: "4px",
  },
  modalInfoSection: {
    padding: "2rem",
    display: "flex",
    flexDirection: "column",
  },
  modalTitle: {
    fontSize: "2rem",
    fontWeight: "400",
    color: "#5d4037",
    marginBottom: "1rem",
  },
  modalDescription: {
    fontSize: "1.1rem",
    lineHeight: "1.8",
    color: "#666",
    marginBottom: "2rem",
    flex: 1,
  },
  modalActions: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  whatsappButton: {
    backgroundColor: "#25D366",
    color: "white",
    padding: "1rem",
    borderRadius: "6px",
    textAlign: "center",
    textDecoration: "none",
    fontSize: "1.1rem",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    transition: "background-color 0.3s",
  },
};

export default Ternos;

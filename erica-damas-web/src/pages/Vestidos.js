import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";

const Vestidos = () => {
  const [vestidos, setVestidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [vestidoSelecionado, setVestidoSelecionado] = useState(null);
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

  // Carregar vestidos da API
  const carregarVestidos = async () => {
    try {
      setCarregando(true);
      const API_URL = getApiUrl();

      console.log(
        "Carregando vestidos da API:",
        `${API_URL}/api/produtos/vestidos`
      );

      const response = await fetch(`${API_URL}/api/produtos/vestidos`);
      const result = await response.json();

      if (result.success) {
        setVestidos(result.produtos);
        console.log(`✅ ${result.produtos.length} vestidos carregados`);
      } else {
        setErro("Erro ao carregar vestidos: " + result.message);
        console.error("Erro na API:", result.message);
      }
    } catch (error) {
      console.error("Erro ao carregar vestidos:", error);
      setErro("Erro ao conectar com o servidor");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarVestidos();
  }, []);

  const abrirModal = (vestido) => {
    setVestidoSelecionado(vestido);
    document.body.style.overflow = "hidden";
  };

  const fecharModal = () => {
    setVestidoSelecionado(null);
    document.body.style.overflow = "auto";
  };

  const gerarMensagemWhatsApp = (vestido) => {
    const mensagem = `Olá! Gostaria de saber mais sobre o vestido "${vestido.nome}". Poderia me dar mais informações sobre disponibilidade e valores?`;
    return `https://wa.me/5511999999999?text=${encodeURIComponent(mensagem)}`;
  };

  return (
    <section style={styles.vestidosContainer}>
      <Helmet>
        <title>Erica Damas - Vestidos de Noiva</title>
        <meta
          name="description"
          content="Descubra nossa coleção exclusiva de vestidos de noiva. Peças únicas e elegantes para o seu dia especial."
        />
        <meta
          name="keywords"
          content="vestidos de noiva, casamento, noiva, vestido"
        />
      </Helmet>

      <div style={styles.tituloContainer}>
        <h1 style={styles.titulo}>VESTIDOS DE NOIVA</h1>
        <div style={styles.divisor}></div>
      </div>

      {erro && (
        <div style={styles.erro}>
          {erro}
          <button onClick={carregarVestidos} style={styles.retryButton}>
            Tentar novamente
          </button>
        </div>
      )}

      {carregando ? (
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>Carregando nossa coleção...</p>
        </div>
      ) : vestidos.length === 0 ? (
        <div style={styles.emptyMessage}>
          <h2>Em breve, novos vestidos exclusivos</h2>
          <p>
            Nossa coleção está sendo atualizada. Entre em contato para conhecer
            nossas opções disponíveis.
          </p>
          <a
            href="https://wa.me/5511999999999?text=Olá,%20gostaria%20de%20conhecer%20os%20vestidos%20disponíveis"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.contactButton}
          >
            Fale Conosco
          </a>
        </div>
      ) : (
        <div style={styles.vestidosGrid}>
          {vestidos.map((vestido) => (
            <div
              key={vestido._id}
              style={styles.vestidoCard}
              onClick={() => abrirModal(vestido)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.05)";
              }}
            >
              {vestido.imagens && vestido.imagens[0] && (
                <div style={styles.vestidoImageContainer}>
                  <img
                    src={vestido.imagens[0]}
                    alt={vestido.nome}
                    style={styles.vestidoImage}
                    onError={(e) => {
                      e.target.style.backgroundColor = "#f5f5f5";
                      e.target.alt = "Imagem não disponível";
                    }}
                  />
                  {vestido.imagens.length > 1 && (
                    <div style={styles.imageCount}>
                      +{vestido.imagens.length - 1}
                    </div>
                  )}
                </div>
              )}
              <div style={styles.vestidoInfo}>
                <h3 style={styles.vestidoName}>{vestido.nome}</h3>
                <p style={styles.vestidoDescription}>
                  {vestido.descricao.length > 100
                    ? vestido.descricao.substring(0, 100) + "..."
                    : vestido.descricao}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {vestidoSelecionado && (
        <div style={styles.modalOverlay} onClick={fecharModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeButton} onClick={fecharModal}>
              ×
            </button>

            <div style={styles.modalGrid}>
              <div style={styles.modalImageSection}>
                {vestidoSelecionado.imagens &&
                  vestidoSelecionado.imagens.length > 0 && (
                    <img
                      src={vestidoSelecionado.imagens[0]}
                      alt={vestidoSelecionado.nome}
                      style={styles.modalImage}
                    />
                  )}
              </div>

              <div style={styles.modalInfoSection}>
                <h2 style={styles.modalTitle}>{vestidoSelecionado.nome}</h2>
                <div style={styles.modalDescription}>
                  {vestidoSelecionado.descricao}
                </div>

                <div style={styles.modalActions}>
                  <a
                    href={gerarMensagemWhatsApp(vestidoSelecionado)}
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

const styles = {
  vestidosContainer: {
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
  vestidosGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", // ✅ Aumentei de 280px para 300px
    gap: "2rem",
  },
  vestidoCard: {
    backgroundColor: "#fff",
    borderRadius: "12px", // ✅ Bordas mais suaves
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)", // ✅ Sombra mais suave
    cursor: "pointer",
    transition: "all 0.3s ease",
    position: "relative",
  },
  vestidoImageContainer: {
    height: "400px", // ✅ Altura maior
    overflow: "hidden",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f8f8", // ✅ Fundo neutro
  },
  vestidoImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain", // ✅ PRINCIPAL: mostra imagem completa
    objectPosition: "center",
    transition: "transform 0.3s ease",
    padding: "15px", // ✅ Espaçamento interno
  },
  imageCount: {
    position: "absolute",
    top: "15px",
    right: "15px",
    backgroundColor: "rgba(0,0,0,0.8)", // ✅ Mais opaco
    color: "white",
    padding: "0.4rem 0.8rem",
    borderRadius: "20px", // ✅ Mais arredondado
    fontSize: "0.8rem",
    fontWeight: "500",
  },
  vestidoInfo: {
    padding: "2rem 1.5rem", // ✅ Padding maior no topo/baixo
    textAlign: "center",
  },
  vestidoName: {
    fontSize: "1.4rem", // ✅ Fonte ligeiramente maior
    fontWeight: "500",
    color: "#5d4037",
    marginBottom: "0.8rem",
    lineHeight: "1.3",
  },
  vestidoDescription: {
    fontSize: "0.95rem", // ✅ Fonte ligeiramente maior
    color: "#666",
    lineHeight: "1.5",
    marginBottom: "0.5rem",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.85)", // ✅ Mais escuro
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "2rem", // ✅ Padding maior
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: "12px", // ✅ Bordas mais suaves
    maxWidth: "1100px", // ✅ Ligeiramente maior
    width: "100%",
    maxHeight: "90vh",
    overflow: "auto",
    position: "relative",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)", // ✅ Sombra mais dramática
  },
  closeButton: {
    position: "absolute",
    top: "20px",
    right: "25px",
    fontSize: "2rem",
    background: "rgba(0,0,0,0.7)",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "45px", // ✅ Ligeiramente maior
    height: "45px",
    cursor: "pointer",
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.3s",
  },
  modalGrid: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr", // ✅ Mais espaço para a imagem
    minHeight: "500px",
  },
  modalImageSection: {
    padding: "3rem", // ✅ Padding maior
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fafafa", // ✅ Fundo neutro
  },
  modalImage: {
    width: "100%",
    height: "auto",
    maxHeight: "75vh", // ✅ Altura maior
    objectFit: "contain", // ✅ Imagem completa
    borderRadius: "6px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)", // ✅ Sombra suave
  },
  modalInfoSection: {
    padding: "3rem 2rem", // ✅ Padding maior
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#fff",
  },
  modalTitle: {
    fontSize: "2.2rem", // ✅ Ligeiramente maior
    fontWeight: "400",
    color: "#5d4037",
    marginBottom: "1.5rem",
    lineHeight: "1.2",
  },
  modalDescription: {
    fontSize: "1.15rem", // ✅ Ligeiramente maior
    lineHeight: "1.7",
    color: "#555", // ✅ Cor mais suave
    marginBottom: "3rem",
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
    padding: "1.2rem", // ✅ Padding maior
    borderRadius: "8px", // ✅ Bordas mais suaves
    textAlign: "center",
    textDecoration: "none",
    fontSize: "1.1rem",
    fontWeight: "600", // ✅ Mais bold
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.8rem",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(37, 211, 102, 0.3)", // ✅ Sombra verde
  },
};

export default Vestidos;

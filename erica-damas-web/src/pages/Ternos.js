import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";

const Ternos = () => {
  const [ternos, setTernos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [ternoSelecionado, setTernoSelecionado] = useState(null);

  useEffect(() => {
    // Carregar ternos do localStorage
    const ternosArmazenados = localStorage.getItem("produtos_ternos");
    if (ternosArmazenados) {
      setTernos(JSON.parse(ternosArmazenados));
    }
    setCarregando(false);
  }, []);

  const abrirModal = (terno) => {
    setTernoSelecionado(terno);
    document.body.style.overflow = "hidden";
  };

  const fecharModal = () => {
    setTernoSelecionado(null);
    document.body.style.overflow = "auto";
  };

  return (
    <section style={styles.ternosContainer}>
      <Helmet>
        <title>Erica Damas - Ternos</title>
        <meta
          name="description"
          content="Conheça nossa coleção exclusiva de ternos"
        />
      </Helmet>

      <div style={styles.tituloContainer}>
        <h1 style={styles.titulo}>TERNOS</h1>
        <div style={styles.divisor}></div>
      </div>

      {carregando ? (
        <div style={styles.loading}>Carregando ternos...</div>
      ) : ternos.length === 0 ? (
        <div style={styles.emptyMessage}>
          Novos ternos em breve. Entre em contato para mais informações.
        </div>
      ) : (
        <div style={styles.ternosGrid}>
          {ternos.map((terno) => (
            <div
              key={terno.id}
              style={styles.ternoCard}
              onClick={() => abrirModal(terno)}
            >
              {terno.imagens && terno.imagens[0] && (
                <div style={styles.ternoImageContainer}>
                  <img
                    src={terno.imagens[0]}
                    alt={terno.nome}
                    style={styles.ternoImage}
                  />
                </div>
              )}
              <div style={styles.ternoInfo}>
                <h3 style={styles.ternoName}>{terno.nome}</h3>
                <p style={styles.ternoPrice}>
                  {terno.preco
                    ? `R$ ${parseFloat(terno.preco)
                        .toFixed(2)
                        .replace(".", ",")}`
                    : "Sob consulta"}
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
                <p style={styles.modalPrice}>
                  {ternoSelecionado.preco
                    ? `R$ ${parseFloat(ternoSelecionado.preco)
                        .toFixed(2)
                        .replace(".", ",")}`
                    : "Sob consulta"}
                </p>
                <div style={styles.modalDescription}>
                  {ternoSelecionado.descricao}
                </div>

                <a
                  href="https://wa.me/5511999999999?text=Olá,%20gostaria%20de%20saber%20mais%20sobre%20o%20terno"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.whatsappButton}
                >
                  Consultar disponibilidade
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

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
  loading: {
    textAlign: "center",
    fontSize: "1.2rem",
    color: "#666",
    padding: "2rem 0",
  },
  emptyMessage: {
    textAlign: "center",
    fontSize: "1.2rem",
    color: "#666",
    padding: "3rem 0",
  },
  ternosGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "2rem",
  },
  ternoCard: {
    backgroundColor: "#fff",
    borderRadius: "5px",
    overflow: "hidden",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    cursor: "pointer",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },
  ternoImageContainer: {
    height: "350px",
    overflow: "hidden",
  },
  ternoImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.5s ease",
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
  ternoPrice: {
    fontSize: "1.1rem",
    color: "#b6a06a",
    fontWeight: "500",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "1rem",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: "5px",
    maxWidth: "900px",
    width: "100%",
    maxHeight: "90vh",
    overflow: "auto",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: "10px",
    right: "15px",
    fontSize: "2rem",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#333",
    zIndex: 10,
  },
  modalGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
  },
  modalImageSection: {
    padding: "2rem",
  },
  modalImage: {
    width: "100%",
    height: "auto",
    maxHeight: "70vh",
    objectFit: "contain",
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
  modalPrice: {
    fontSize: "1.5rem",
    color: "#b6a06a",
    fontWeight: "500",
    marginBottom: "1.5rem",
  },
  modalDescription: {
    fontSize: "1.1rem",
    lineHeight: "1.8",
    color: "#666",
    marginBottom: "2rem",
    flex: 1,
  },
  whatsappButton: {
    backgroundColor: "#25D366",
    color: "white",
    padding: "1rem",
    borderRadius: "4px",
    textAlign: "center",
    textDecoration: "none",
    fontSize: "1.1rem",
    fontWeight: "500",
    display: "block",
  },
};

export default Ternos;

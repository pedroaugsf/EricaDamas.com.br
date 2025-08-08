import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";

const Vestidos = () => {
  const [vestidos, setVestidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [vestidoSelecionado, setVestidoSelecionado] = useState(null);

  useEffect(() => {
    // Carregar vestidos do localStorage
    const vestidosArmazenados = localStorage.getItem("produtos_vestidos");
    if (vestidosArmazenados) {
      setVestidos(JSON.parse(vestidosArmazenados));
    }
    setCarregando(false);
  }, []);

  const abrirModal = (vestido) => {
    setVestidoSelecionado(vestido);
    document.body.style.overflow = "hidden";
  };

  const fecharModal = () => {
    setVestidoSelecionado(null);
    document.body.style.overflow = "auto";
  };

  return (
    <section style={styles.vestidosContainer}>
      <Helmet>
        <title>Erica Damas - Vestidos de Noiva</title>
        <meta
          name="description"
          content="Conheça nossa coleção exclusiva de vestidos de noiva"
        />
      </Helmet>

      <div style={styles.tituloContainer}>
        <h1 style={styles.titulo}>VESTIDOS DE NOIVA</h1>
        <div style={styles.divisor}></div>
      </div>

      {carregando ? (
        <div style={styles.loading}>Carregando vestidos...</div>
      ) : vestidos.length === 0 ? (
        <div style={styles.emptyMessage}>
          Novos vestidos em breve. Entre em contato para mais informações.
        </div>
      ) : (
        <div style={styles.vestidosGrid}>
          {vestidos.map((vestido) => (
            <div
              key={vestido.id}
              style={styles.vestidoCard}
              onClick={() => abrirModal(vestido)}
            >
              {vestido.imagens && vestido.imagens[0] && (
                <div style={styles.vestidoImageContainer}>
                  <img
                    src={vestido.imagens[0]}
                    alt={vestido.nome}
                    style={styles.vestidoImage}
                  />
                </div>
              )}
              <div style={styles.vestidoInfo}>
                <h3 style={styles.vestidoName}>{vestido.nome}</h3>
                <p style={styles.vestidoPrice}>
                  {vestido.preco
                    ? `R$ ${parseFloat(vestido.preco)
                        .toFixed(2)
                        .replace(".", ",")}`
                    : "Sob consulta"}
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
                <p style={styles.modalPrice}>
                  {vestidoSelecionado.preco
                    ? `R$ ${parseFloat(vestidoSelecionado.preco)
                        .toFixed(2)
                        .replace(".", ",")}`
                    : "Sob consulta"}
                </p>
                <div style={styles.modalDescription}>
                  {vestidoSelecionado.descricao}
                </div>

                <a
                  href="https://wa.me/5511999999999?text=Olá,%20gostaria%20de%20saber%20mais%20sobre%20o%20vestido%20de%20noiva"
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
  vestidosGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "2rem",
  },
  vestidoCard: {
    backgroundColor: "#fff",
    borderRadius: "5px",
    overflow: "hidden",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    cursor: "pointer",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },
  vestidoImageContainer: {
    height: "350px",
    overflow: "hidden",
  },
  vestidoImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.5s ease",
  },
  vestidoInfo: {
    padding: "1.5rem",
    textAlign: "center",
  },
  vestidoName: {
    fontSize: "1.3rem",
    fontWeight: "400",
    color: "#5d4037",
    marginBottom: "0.5rem",
  },
  vestidoPrice: {
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

export default Vestidos;

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet";
import { api } from "../services/AuthService";

const Vestidos = () => {
  const [vestidos, setVestidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [vestidoSelecionado, setVestidoSelecionado] = useState(null);
  const [erro, setErro] = useState("");
  const [pagina, setPagina] = useState(1);
  const [temMais, setTemMais] = useState(true);
  const [totalVestidos, setTotalVestidos] = useState(0);
  const itensPorPagina = 12;

  // Memoizar a função para evitar recriações desnecessárias
  const carregarVestidos = useCallback(
    async (paginaAtual = 1, acumular = false) => {
      try {
        if (paginaAtual === 1) {
          setCarregando(true);
        } else {
          setCarregandoMais(true);
        }

        setErro("");

        // Adicionar timeout para cancelar requisição se demorar muito
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos timeout

        const response = await api.get(
          `/produtos/vestidos?pagina=${paginaAtual}&limite=${itensPorPagina}`,
          { signal: controller.signal }
        );

        clearTimeout(timeoutId);

        const result = response.data;

        if (result.success) {
          // Processar imagens para pré-carregamento
          const produtos = result.produtos.map((produto) => ({
            ...produto,
            // Adicionar propriedade para controlar se a imagem principal já foi carregada
            imagemCarregada: false,
          }));

          if (acumular) {
            setVestidos((prev) => [...prev, ...produtos]);
          } else {
            setVestidos(produtos);
          }

          setTotalVestidos(result.total);
          setTemMais(result.produtos.length === itensPorPagina);
        } else {
          setErro("Erro ao carregar vestidos: " + result.message);
        }
      } catch (error) {
        if (error.name === "AbortError") {
          setErro("Tempo limite excedido. Verifique sua conexão.");
        } else {
          setErro("Erro ao conectar com o servidor");
        }
      } finally {
        setCarregando(false);
        setCarregandoMais(false);
      }
    },
    [itensPorPagina]
  );

  // Função para pré-carregar imagens
  const preCarregarImagem = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(src);
      img.onerror = () => reject();
    });
  };

  useEffect(() => {
    carregarVestidos();

    // Limpar estado ao desmontar
    return () => {
      setVestidos([]);
      setVestidoSelecionado(null);
    };
  }, [carregarVestidos]);

  // Configurar observador de interseção para lazy loading
  useEffect(() => {
    if (vestidos.length === 0) return;

    const imgObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.getAttribute("data-src");
            if (src) {
              // Usar técnica de fade-in para imagens
              img.style.opacity = "0";
              img.src = src;
              img.onload = () => {
                img.style.transition = "opacity 0.3s ease";
                img.style.opacity = "1";
              };
              img.removeAttribute("data-src");
              imgObserver.unobserve(img);
            }
          }
        });
      },
      { rootMargin: "200px 0px", threshold: 0.1 }
    );

    // Observar todas as imagens com data-src
    document.querySelectorAll("img[data-src]").forEach((img) => {
      imgObserver.observe(img);
    });

    return () => {
      imgObserver.disconnect();
    };
  }, [vestidos]);

  const carregarMais = useCallback(() => {
    const proximaPagina = pagina + 1;
    setPagina(proximaPagina);
    carregarVestidos(proximaPagina, true);
  }, [pagina, carregarVestidos]);

  const abrirModal = useCallback((vestido) => {
    setVestidoSelecionado(vestido);
    document.body.style.overflow = "hidden";

    // Pré-carregar todas as imagens do vestido selecionado
    if (vestido.imagens && vestido.imagens.length > 0) {
      vestido.imagens.forEach((src) => {
        preCarregarImagem(src).catch(() => {
          // Silenciosamente ignorar erros de pré-carregamento
        });
      });
    }
  }, []);

  const fecharModal = useCallback(() => {
    setVestidoSelecionado(null);
    document.body.style.overflow = "auto";
  }, []);

  const gerarMensagemWhatsApp = useMemo(
    () => (vestido) => {
      const mensagem = `Olá! Gostaria de saber mais sobre o vestido "${vestido.nome}". Poderia me dar mais informações sobre disponibilidade e valores?`;
      return `https://wa.me/5511999999999?text=${encodeURIComponent(mensagem)}`;
    },
    []
  );

  // Renderização condicional otimizada
  const renderVestidosGrid = useMemo(() => {
    if (vestidos.length === 0) return null;

    return (
      <div style={styles.vestidosGrid}>
        {vestidos.map((vestido) => (
          <div
            key={vestido._id}
            style={styles.vestidoCard}
            onClick={() => abrirModal(vestido)}
            className="vestido-card"
          >
            {vestido.imagens && vestido.imagens[0] && (
              <div style={styles.vestidoImageContainer}>
                <img
                  src={vestido.imagens[0]} // Carregar diretamente para primeira renderização
                  alt={vestido.nome}
                  style={styles.vestidoImage}
                  onError={(e) => {
                    e.target.style.backgroundColor = "#f5f5f5";
                    e.target.alt = "Imagem não disponível";
                  }}
                  loading="lazy"
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
    );
  }, [vestidos, abrirModal]);

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
        {/* Preload para melhorar performance */}
        <link rel="preconnect" href={api.defaults.baseURL} />
        <link rel="dns-prefetch" href={api.defaults.baseURL} />
      </Helmet>

      <div style={styles.tituloContainer}>
        <h1 style={styles.titulo}>VESTIDOS DE NOIVA</h1>
        <div style={styles.divisor}></div>
        {!carregando && totalVestidos > 0 && (
          <p style={styles.resultCount}>
            Exibindo {vestidos.length} de {totalVestidos} vestidos
          </p>
        )}
      </div>

      {erro && (
        <div style={styles.erro}>
          {erro}
          <button
            onClick={() => carregarVestidos(1)}
            style={styles.retryButton}
          >
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
        <div>
          {renderVestidosGrid}

          {temMais && (
            <div style={styles.loadMoreContainer}>
              <button
                style={styles.loadMoreButton}
                onClick={carregarMais}
                disabled={carregandoMais}
              >
                {carregandoMais ? (
                  <React.Fragment>
                    <div style={styles.smallSpinner}></div>
                    Carregando...
                  </React.Fragment>
                ) : (
                  "Carregar mais vestidos"
                )}
              </button>
            </div>
          )}
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

                {vestidoSelecionado.imagens &&
                  vestidoSelecionado.imagens.length > 1 && (
                    <div style={styles.thumbnailContainer}>
                      {vestidoSelecionado.imagens
                        .slice(0, 5)
                        .map((img, index) => (
                          <img
                            key={index}
                            src={img}
                            alt={`${vestidoSelecionado.nome} - imagem ${
                              index + 1
                            }`}
                            style={styles.thumbnail}
                            onClick={(e) => {
                              // Trocar imagem principal ao clicar na miniatura
                              const mainImg =
                                e.currentTarget.parentNode.previousSibling;
                              mainImg.src = img;
                            }}
                          />
                        ))}
                    </div>
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
                    className="whatsapp-button"
                  >
                    💬 Consultar no WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .vestido-card {
          transition: all 0.3s ease;
        }

        .vestido-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
        }

        .whatsapp-button {
          transition: all 0.3s ease;
        }

        .whatsapp-button:hover {
          background-color: #128c7e;
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .modalGrid {
            grid-template-columns: 1fr !important;
          }

          .modalImageSection {
            padding: 1.5rem !important;
          }

          .modalInfoSection {
            padding: 2rem 1.5rem !important;
          }

          .vestidosContainer {
            padding: 2rem 1rem !important;
          }

          .titulo {
            font-size: 2rem !important;
            letter-spacing: 2px !important;
          }

          .vestidosGrid {
            grid-template-columns: repeat(
              auto-fill,
              minmax(280px, 1fr)
            ) !important;
            gap: 1.5rem !important;
          }

          .vestidoImageContainer {
            height: 350px !important;
          }

          .modalTitle {
            font-size: 1.8rem !important;
          }

          .thumbnailContainer {
            flex-wrap: wrap !important;
          }
        }

        @media (max-width: 480px) {
          .vestidosGrid {
            grid-template-columns: 1fr !important;
          }

          .modalOverlay {
            padding: 1rem !important;
          }

          .vestidoInfo {
            padding: 1.5rem 1rem !important;
          }
        }
      `}</style>
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
  resultCount: {
    marginTop: "1rem",
    color: "#666",
    fontSize: "0.95rem",
  },
  erro: {
    backgroundColor: "#ffebee",
    color: "#c62828",
    padding: "1rem",
    borderRadius: "8px",
    marginBottom: "2rem",
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "1rem",
    flexWrap: "wrap",
  },
  retryButton: {
    backgroundColor: "#c62828",
    color: "white",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.9rem",
    transition: "background-color 0.3s",
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
  smallSpinner: {
    width: "20px",
    height: "20px",
    border: "2px solid #f3f3f3",
    borderTop: "2px solid #b6a06a",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginRight: "10px",
  },
  emptyMessage: {
    textAlign: "center",
    padding: "4rem 2rem",
    backgroundColor: "#f9f9f9",
    borderRadius: "12px",
    margin: "2rem 0",
  },
  contactButton: {
    display: "inline-block",
    backgroundColor: "#b6a06a",
    color: "white",
    padding: "1rem 2rem",
    borderRadius: "6px",
    textDecoration: "none",
    marginTop: "1rem",
    transition: "all 0.3s",
    fontWeight: "500",
  },
  vestidosGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "2rem",
    marginTop: "2rem",
  },
  vestidoCard: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    cursor: "pointer",
    transition: "all 0.3s ease",
    position: "relative",
    border: "1px solid #f0f0f0",
  },
  vestidoImageContainer: {
    height: "400px",
    overflow: "hidden",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f8f8",
  },
  vestidoImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    objectPosition: "center",
    transition: "transform 0.3s ease",
    padding: "15px",
  },
  imageCount: {
    position: "absolute",
    top: "15px",
    right: "15px",
    backgroundColor: "rgba(0,0,0,0.8)",
    color: "white",
    padding: "0.4rem 0.8rem",
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontWeight: "500",
  },
  vestidoInfo: {
    padding: "2rem 1.5rem",
    textAlign: "center",
  },
  vestidoName: {
    fontSize: "1.4rem",
    fontWeight: "500",
    color: "#5d4037",
    marginBottom: "0.8rem",
    lineHeight: "1.3",
  },
  vestidoDescription: {
    fontSize: "0.95rem",
    color: "#666",
    lineHeight: "1.5",
    marginBottom: "0.5rem",
  },
  loadMoreContainer: {
    textAlign: "center",
    margin: "3rem 0 1rem",
  },
  loadMoreButton: {
    backgroundColor: "#b6a06a",
    color: "white",
    border: "none",
    padding: "1rem 2rem",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "500",
    transition: "all 0.3s",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.85)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "2rem",
    backdropFilter: "blur(2px)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    maxWidth: "1100px",
    width: "100%",
    maxHeight: "90vh",
    overflow: "auto",
    position: "relative",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  },
  closeButton: {
    position: "absolute",
    top: "20px",
    right: "25px",
    fontSize: "1.8rem",
    background: "rgba(0,0,0,0.7)",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "45px",
    height: "45px",
    cursor: "pointer",
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s",
    fontWeight: "300",
  },
  modalGrid: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    minHeight: "500px",
  },
  modalImageSection: {
    padding: "3rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fafafa",
  },
  modalImage: {
    width: "100%",
    height: "auto",
    maxHeight: "60vh",
    objectFit: "contain",
    borderRadius: "6px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
  },
  thumbnailContainer: {
    display: "flex",
    gap: "10px",
    marginTop: "15px",
    justifyContent: "center",
  },
  thumbnail: {
    width: "60px",
    height: "60px",
    objectFit: "cover",
    borderRadius: "4px",
    cursor: "pointer",
    border: "2px solid transparent",
    transition: "all 0.2s",
  },
  modalInfoSection: {
    padding: "3rem 2rem",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#fff",
  },
  modalTitle: {
    fontSize: "2.2rem",
    fontWeight: "400",
    color: "#5d4037",
    marginBottom: "1.5rem",
    lineHeight: "1.2",
  },
  modalDescription: {
    fontSize: "1.15rem",
    lineHeight: "1.7",
    color: "#555",
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
    padding: "1.2rem",
    borderRadius: "8px",
    textAlign: "center",
    textDecoration: "none",
    fontSize: "1.1rem",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.8rem",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(37, 211, 102, 0.3)",
    border: "none",
    cursor: "pointer",
  },
};

export default Vestidos;

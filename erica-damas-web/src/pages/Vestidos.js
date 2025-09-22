import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Helmet } from "react-helmet";
import { api } from "../services/AuthService";

const Vestidos = () => {
  const [vestidos, setVestidos] = useState([]);
  const [vestidosFiltrados, setVestidosFiltrados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [vestidoSelecionado, setVestidoSelecionado] = useState(null);
  const [erro, setErro] = useState("");
  const [imagemModalAtual, setImagemModalAtual] = useState(0);

  // Estados para paginação e filtros
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroTextoDebounced, setFiltroTextoDebounced] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [ordenacao, setOrdenacao] = useState("nome");
  const [buscandoTexto, setBuscandoTexto] = useState(false);

  // Refs para otimização
  const debounceRef = useRef(null);
  const vestidosIndexadosRef = useRef(new Map());
  const filtrosAnterioresRef = useRef({});

  // Detectar se é mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Configurações
  const ITENS_POR_PAGINA = isMobile ? 12 : 20;
  const DEBOUNCE_DELAY = 150;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Função para criar índice de busca otimizado
  const criarIndiceBusca = useCallback((produtos) => {
    const indice = new Map();

    produtos.forEach((produto, index) => {
      const textoBusca = `${produto.nome} ${produto.descricao}`
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      const palavras = textoBusca
        .split(/\s+/)
        .filter((palavra) => palavra.length > 1);

      indice.set(produto._id, {
        index,
        produto,
        textoBusca,
        palavras,
        categoria: produto.categoria?.toLowerCase() || "",
      });
    });

    return indice;
  }, []);

  // Debounce otimizado para busca
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    setBuscandoTexto(true);

    debounceRef.current = setTimeout(() => {
      setFiltroTextoDebounced(filtroTexto);
      setBuscandoTexto(false);
    }, DEBOUNCE_DELAY);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [filtroTexto, DEBOUNCE_DELAY]);

  // Carregar vestidos da API
  const carregarVestidos = useCallback(async () => {
    try {
      setCarregando(true);
      setErro("");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await api.get("/produtos/vestidos", {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const result = response.data;

      if (result.success) {
        const produtosProcessados = result.produtos.map((produto) => ({
          ...produto,
          imagemCarregada: false,
        }));

        setVestidos(produtosProcessados);

        // Criar índice de busca
        vestidosIndexadosRef.current = criarIndiceBusca(produtosProcessados);

        // Aplicar filtros iniciais
        setVestidosFiltrados(produtosProcessados);
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
    }
  }, [criarIndiceBusca]);

  // Algoritmo de busca ultra-rápido
  const buscarVestidos = useCallback((texto, categoria, ordenacaoTipo) => {
    const indice = vestidosIndexadosRef.current;
    if (!indice.size) return [];

    const performance_start = performance.now();

    const textoNormalizado = texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

    let resultados = [];

    if (!textoNormalizado) {
      resultados = Array.from(indice.values()).map((item) => item.produto);
    } else {
      const palavrasBusca = textoNormalizado
        .split(/\s+/)
        .filter((p) => p.length > 0);

      const resultadosComScore = [];

      for (const [id, item] of indice) {
        let score = 0;
        let matches = 0;

        if (item.produto.nome.toLowerCase().includes(textoNormalizado)) {
          score += 100;
          matches++;
        }

        for (const palavraBusca of palavrasBusca) {
          if (item.produto.nome.toLowerCase().includes(palavraBusca)) {
            score += 50;
            matches++;
          }

          if (item.palavras.some((palavra) => palavra.includes(palavraBusca))) {
            score += 20;
            matches++;
          }

          if (item.textoBusca.includes(palavraBusca)) {
            score += 10;
            matches++;
          }
        }

        if (matches > 0) {
          if (matches === palavrasBusca.length) {
            score += 30;
          }

          resultadosComScore.push({ produto: item.produto, score });
        }
      }

      resultados = resultadosComScore
        .sort((a, b) => b.score - a.score)
        .map((item) => item.produto);
    }

    if (categoria !== "todas") {
      resultados = resultados.filter(
        (produto) =>
          produto.categoria?.toLowerCase() === categoria.toLowerCase()
      );
    }

    resultados.sort((a, b) => {
      switch (ordenacaoTipo) {
        case "nome":
          return a.nome.localeCompare(b.nome);
        case "nome-desc":
          return b.nome.localeCompare(a.nome);
        case "recente":
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case "antigo":
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        default:
          return 0;
      }
    });

    const performance_end = performance.now();

    if (process.env.NODE_ENV === "development") {
      console.log(
        `🔍 Busca executada em ${(performance_end - performance_start).toFixed(
          2
        )}ms`
      );
      console.log(
        `📊 ${resultados.length} resultados encontrados de ${indice.size} total`
      );
    }

    return resultados;
  }, []);

  // Memoização da busca com cache inteligente
  const vestidosFiltradosMemo = useMemo(() => {
    const cacheKey = `${filtroTextoDebounced}-${filtroCategoria}-${ordenacao}`;

    if (filtrosAnterioresRef.current.key === cacheKey) {
      return filtrosAnterioresRef.current.resultados;
    }

    const resultados = buscarVestidos(
      filtroTextoDebounced,
      filtroCategoria,
      ordenacao
    );

    filtrosAnterioresRef.current = {
      key: cacheKey,
      resultados,
    };

    return resultados;
  }, [filtroTextoDebounced, filtroCategoria, ordenacao, buscarVestidos]);

  // Atualizar estado quando filtros mudarem
  useEffect(() => {
    setVestidosFiltrados(vestidosFiltradosMemo);
    setPaginaAtual(1);
  }, [vestidosFiltradosMemo]);

  // Obter categorias únicas
  const categorias = useMemo(() => {
    const categoriasUnicas = [
      ...new Set(vestidos.map((vestido) => vestido.categoria).filter(Boolean)),
    ];
    return categoriasUnicas;
  }, [vestidos]);

  // Vestidos para exibir (paginação otimizada)
  const vestidosParaExibir = useMemo(() => {
    const inicio = 0;
    const fim = paginaAtual * ITENS_POR_PAGINA;
    return vestidosFiltrados.slice(inicio, fim);
  }, [vestidosFiltrados, paginaAtual, ITENS_POR_PAGINA]);

  // Verificar se há mais itens
  const temMaisItens = vestidosParaExibir.length < vestidosFiltrados.length;

  // Carregar mais itens
  const carregarMaisItens = useCallback(async () => {
    if (carregandoMais || !temMaisItens) return;

    setCarregandoMais(true);
    await new Promise((resolve) => setTimeout(resolve, 100));
    setPaginaAtual((prev) => prev + 1);
    setCarregandoMais(false);
  }, [carregandoMais, temMaisItens]);

  // Handler otimizado para mudança de texto
  const handleTextoChange = useCallback((e) => {
    const novoTexto = e.target.value;
    setFiltroTexto(novoTexto);
  }, []);

  // Scroll infinito para mobile
  useEffect(() => {
    if (!isMobile) return;

    let isThrottled = false;

    const handleScroll = () => {
      if (isThrottled) return;

      isThrottled = true;
      requestAnimationFrame(() => {
        if (
          window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 1000
        ) {
          carregarMaisItens();
        }
        isThrottled = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile, carregarMaisItens]);

  useEffect(() => {
    carregarVestidos();

    return () => {
      setVestidos([]);
      setVestidoSelecionado(null);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [carregarVestidos]);

  // Intersection Observer otimizado
  useEffect(() => {
    if (vestidosParaExibir.length === 0) return;

    const imgObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.getAttribute("data-src");
            if (src) {
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
      { rootMargin: "100px 0px", threshold: 0.1 }
    );

    const observeImages = () => {
      document.querySelectorAll("img[data-src]").forEach((img) => {
        imgObserver.observe(img);
      });
    };

    if (window.requestIdleCallback) {
      window.requestIdleCallback(observeImages);
    } else {
      setTimeout(observeImages, 0);
    }

    return () => {
      imgObserver.disconnect();
    };
  }, [vestidosParaExibir]);

  const abrirModal = useCallback((vestido) => {
    setVestidoSelecionado(vestido);
    setImagemModalAtual(0);
    document.body.style.overflow = "hidden";

    if (vestido.imagens && vestido.imagens.length > 0) {
      const img = new Image();
      img.src = vestido.imagens[0];

      if (vestido.imagens.length > 1) {
        requestIdleCallback(() => {
          vestido.imagens.slice(1).forEach((src) => {
            const img = new Image();
            img.src = src;
          });
        });
      }
    }
  }, []);

  const fecharModal = useCallback(() => {
    setVestidoSelecionado(null);
    setImagemModalAtual(0);
    document.body.style.overflow = "auto";
  }, []);

  const proximaImagem = useCallback(() => {
    if (vestidoSelecionado && vestidoSelecionado.imagens) {
      setImagemModalAtual((prev) =>
        prev === vestidoSelecionado.imagens.length - 1 ? 0 : prev + 1
      );
    }
  }, [vestidoSelecionado]);

  const imagemAnterior = useCallback(() => {
    if (vestidoSelecionado && vestidoSelecionado.imagens) {
      setImagemModalAtual((prev) =>
        prev === 0 ? vestidoSelecionado.imagens.length - 1 : prev - 1
      );
    }
  }, [vestidoSelecionado]);

  const gerarMensagemWhatsApp = useMemo(
    () => (vestido) => {
      const mensagem = `Olá! Gostaria de saber mais sobre o vestido "${vestido.nome}". Poderia me dar mais informações sobre disponibilidade e valores?`;
      return `https://wa.me/5511999999999?text=${encodeURIComponent(mensagem)}`;
    },
    []
  );

  // Renderizar filtros otimizados
  const renderFiltros = useMemo(
    () => (
      <div style={styles.filtrosContainer}>
        <div style={styles.filtrosRow}>
          <div style={styles.filtroItem}>
            <div style={styles.inputContainer}>
              <input
                type="text"
                placeholder="Buscar vestidos..."
                value={filtroTexto}
                onChange={handleTextoChange}
                style={{
                  ...styles.inputBusca,
                  ...(buscandoTexto ? styles.inputBuscando : {}),
                }}
              />
              {buscandoTexto && (
                <div style={styles.buscaIndicador}>
                  <div style={styles.miniSpinner}></div>
                </div>
              )}
            </div>
          </div>

          {categorias.length > 0 && (
            <div style={styles.filtroItem}>
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                style={styles.selectFiltro}
              >
                <option value="todas">Todas as categorias</option>
                {categorias.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={styles.filtroItem}>
            <select
              value={ordenacao}
              onChange={(e) => setOrdenacao(e.target.value)}
              style={styles.selectFiltro}
            >
              <option value="nome">Nome ↑</option>
              <option value="nome-desc">Nome ↓</option>
              <option value="recente">Mais recentes</option>
              <option value="antigo">Mais antigos</option>
            </select>
          </div>
        </div>

        <div style={styles.resultadosInfo}>
          {vestidosFiltrados.length > 0 ? (
            <span>
              Exibindo {vestidosParaExibir.length} de {vestidosFiltrados.length}{" "}
              vestidos
              {filtroTextoDebounced && (
                <span style={styles.textoBusca}>
                  • Busca: "{filtroTextoDebounced}"
                </span>
              )}
            </span>
          ) : filtroTextoDebounced || filtroCategoria !== "todas" ? (
            <span style={styles.nenhumResultado}>
              Nenhum vestido encontrado para os filtros aplicados
            </span>
          ) : null}
        </div>
      </div>
    ),
    [
      filtroTexto,
      filtroTextoDebounced,
      filtroCategoria,
      ordenacao,
      categorias,
      vestidosFiltrados.length,
      vestidosParaExibir.length,
      buscandoTexto,
      handleTextoChange,
    ]
  );

  // Renderização da grid super otimizada com UX/UI de e-commerce premium
  const renderVestidosGrid = useMemo(() => {
    if (vestidosParaExibir.length === 0) return null;

    return (
      <div style={styles.vestidosGrid}>
        {vestidosParaExibir.map((vestido, index) => (
          <div
            key={`${vestido._id}-${index}`}
            style={styles.vestidoCard}
            onClick={() => abrirModal(vestido)}
            className="vestido-card"
          >
            <div style={styles.vestidoImageContainer}>
              <img
                data-src={vestido.imagens[0]}
                alt={vestido.nome}
                style={styles.vestidoImage}
                onError={(e) => {
                  e.target.style.backgroundColor = "#f8f8f8";
                  e.target.alt = "Imagem não disponível";
                }}
                loading="lazy"
              />
              {vestido.imagens && vestido.imagens.length > 1 && (
                <div style={styles.imageCount}>
                  +{vestido.imagens.length - 1}
                </div>
              )}
              <div style={styles.hoverOverlay}>
                <span style={styles.viewDetailsText}>Ver Detalhes</span>
              </div>
            </div>
            <div style={styles.vestidoInfo}>
              <h3 style={styles.vestidoName}>{vestido.nome}</h3>
              <p style={styles.vestidoDescription}>
                {vestido.descricao.length > (isMobile ? 70 : 85)
                  ? vestido.descricao.substring(0, isMobile ? 70 : 85) + "..."
                  : vestido.descricao}
              </p>
              <div style={styles.disponibilidadeIndicador}>
                <span style={styles.disponibilidadeTexto}>
                  Disponível para consulta
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }, [vestidosParaExibir, abrirModal, isMobile]);

  return (
    <section style={styles.vestidosContainer}>
      <Helmet>
        <title>{`Erica Damas - Vestidos de Noiva (${vestidosFiltrados.length} modelos)`}</title>
        <meta
          name="description"
          content={`Descubra nossa coleção exclusiva de ${vestidosFiltrados.length} vestidos de noiva. Peças únicas e elegantes para o seu dia especial.`}
        />
        <meta
          name="keywords"
          content="vestidos de noiva, casamento, noiva, vestido"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href={api.defaults.baseURL} />
        <link rel="dns-prefetch" href={api.defaults.baseURL} />
      </Helmet>

      <div style={styles.tituloContainer}>
        <h1 style={styles.titulo}>VESTIDOS DE NOIVA</h1>
        <div style={styles.divisor}></div>
      </div>

      {erro && (
        <div style={styles.erro}>
          <div style={styles.erroTexto}>{erro}</div>
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
          <h2 style={styles.emptyTitle}>Em breve, novos vestidos exclusivos</h2>
          <p style={styles.emptyText}>
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
          {renderFiltros}
          {renderVestidosGrid}

          {/* Carregar mais - Desktop */}
          {!isMobile && temMaisItens && (
            <div style={styles.carregarMaisContainer}>
              <button
                onClick={carregarMaisItens}
                disabled={carregandoMais}
                style={styles.carregarMaisButton}
                className="carregar-mais-button"
              >
                {carregandoMais ? (
                  <React.Fragment>
                    <div style={styles.miniSpinner}></div>
                    Carregando...
                  </React.Fragment>
                ) : (
                  `Carregar mais (${
                    vestidosFiltrados.length - vestidosParaExibir.length
                  } restantes)`
                )}
              </button>
            </div>
          )}

          {/* Loading infinito - Mobile */}
          {isMobile && carregandoMais && (
            <div style={styles.loadingInfinito}>
              <div style={styles.miniSpinner}></div>
              <span>Carregando mais vestidos...</span>
            </div>
          )}
        </div>
      )}

      {vestidoSelecionado && (
        <div style={styles.modalOverlay} onClick={fecharModal}>
          <div
            style={{
              ...styles.modalContent,
              ...(isMobile ? styles.modalContentMobile : {}),
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button style={styles.closeButton} onClick={fecharModal}>
              ×
            </button>

            <div
              style={{
                ...styles.modalGrid,
                ...(isMobile ? styles.modalGridMobile : {}),
              }}
            >
              <div
                style={{
                  ...styles.modalImageSection,
                  ...(isMobile ? styles.modalImageSectionMobile : {}),
                }}
              >
                {vestidoSelecionado.imagens &&
                  vestidoSelecionado.imagens.length > 0 && (
                    <div style={styles.imageCarousel}>
                      <img
                        src={vestidoSelecionado.imagens[imagemModalAtual]}
                        alt={vestidoSelecionado.nome}
                        style={{
                          ...styles.modalImage,
                          ...(isMobile ? styles.modalImageMobile : {}),
                        }}
                      />

                      {vestidoSelecionado.imagens.length > 1 && (
                        <React.Fragment>
                          <button
                            style={{
                              ...styles.navButton,
                              ...styles.navButtonPrev,
                            }}
                            onClick={imagemAnterior}
                          >
                            ‹
                          </button>
                          <button
                            style={{
                              ...styles.navButton,
                              ...styles.navButtonNext,
                            }}
                            onClick={proximaImagem}
                          >
                            ›
                          </button>
                          <div style={styles.imageIndicators}>
                            {vestidoSelecionado.imagens.map((_, index) => (
                              <div
                                key={index}
                                style={{
                                  ...styles.indicator,
                                  ...(index === imagemModalAtual
                                    ? styles.indicatorActive
                                    : {}),
                                }}
                                onClick={() => setImagemModalAtual(index)}
                              />
                            ))}
                          </div>
                        </React.Fragment>
                      )}
                    </div>
                  )}

                {!isMobile &&
                  vestidoSelecionado.imagens &&
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
                            style={{
                              ...styles.thumbnail,
                              ...(index === imagemModalAtual
                                ? styles.thumbnailActive
                                : {}),
                            }}
                            onClick={() => setImagemModalAtual(index)}
                          />
                        ))}
                    </div>
                  )}
              </div>

              <div
                style={{
                  ...styles.modalInfoSection,
                  ...(isMobile ? styles.modalInfoSectionMobile : {}),
                }}
              >
                <h2
                  style={{
                    ...styles.modalTitle,
                    ...(isMobile ? styles.modalTitleMobile : {}),
                  }}
                >
                  {vestidoSelecionado.nome}
                </h2>
                <div
                  style={{
                    ...styles.modalDescription,
                    ...(isMobile ? styles.modalDescriptionMobile : {}),
                  }}
                >
                  {vestidoSelecionado.descricao}
                </div>

                <div style={styles.modalActions}>
                  <a
                    href={gerarMensagemWhatsApp(vestidoSelecionado)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      ...styles.whatsappButton,
                      ...(isMobile ? styles.whatsappButtonMobile : {}),
                    }}
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

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .vestido-card {
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          animation: fadeInUp 0.6s ease forwards;
        }

        .vestido-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1) !important;
        }

        .vestido-card:hover .vestido-image {
          transform: scale(1.08);
        }

        .vestido-card:hover .hover-overlay {
          opacity: 1;
        }

        .carregar-mais-button {
          transition: all 0.3s ease;
        }

        .carregar-mais-button:hover:not(:disabled) {
          background-color: #9a8655;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(154, 134, 85, 0.3);
        }

        .carregar-mais-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .whatsapp-button:hover {
          background-color: #128c7e;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(37, 211, 102, 0.3);
        }

        .contact-button:hover {
          background-color: #9a8655;
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .vestido-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 25px rgba(0, 0, 0, 0.08) !important;
          }

          .vestido-card:hover .vestido-image {
            transform: scale(1.03);
          }
        }

        @media (max-width: 480px) {
          .vestido-card:hover {
            transform: translateY(-2px);
          }

          .vestido-card:hover .vestido-image {
            transform: scale(1.02);
          }
        }
      `}</style>
    </section>
  );
};

const styles = {
  vestidosContainer: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "2rem 1rem",
    fontFamily: '"Cormorant Garamond", serif',
    backgroundColor: "#ffffff",
    "@media (min-width: 768px)": {
      padding: "4rem 2rem",
    },
  },

  tituloContainer: {
    textAlign: "center",
    marginBottom: "3rem",
    "@media (min-width: 768px)": {
      marginBottom: "4rem",
    },
  },

  titulo: {
    fontSize: "2rem",
    fontWeight: "300",
    letterSpacing: "3px",
    color: "#2c2c2c",
    marginBottom: "1.5rem",
    textTransform: "uppercase",
    lineHeight: "1.2",
    "@media (min-width: 768px)": {
      fontSize: "2.8rem",
      letterSpacing: "4px",
    },
  },

  divisor: {
    width: "80px",
    height: "2px",
    backgroundColor: "#b6a06a",
    margin: "0 auto",
    "@media (min-width: 768px)": {
      width: "100px",
    },
  },

  filtrosContainer: {
    marginBottom: "3rem",
    padding: "2rem",
    backgroundColor: "#fafafa",
    borderRadius: "12px",
    border: "1px solid #f0f0f0",
    "@media (min-width: 768px)": {
      marginBottom: "4rem",
    },
  },

  filtrosRow: {
    display: "flex",
    flexDirection: "column",
    gap: "1.2rem",
    marginBottom: "1.5rem",
    "@media (min-width: 768px)": {
      flexDirection: "row",
      alignItems: "center",
      gap: "1.5rem",
    },
  },

  filtroItem: {
    flex: 1,
    minWidth: "200px",
  },

  inputContainer: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },

  inputBusca: {
    width: "100%",
    padding: "1rem 1.2rem",
    paddingRight: "3.5rem",
    border: "2px solid #e8e8e8",
    borderRadius: "10px",
    fontSize: "1rem",
    fontFamily: "inherit",
    transition: "all 0.3s ease",
    outline: "none",
    backgroundColor: "white",
    boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
  },

  inputBuscando: {
    borderColor: "#b6a06a",
    boxShadow: "0 0 0 4px rgba(182, 160, 106, 0.1)",
  },

  buscaIndicador: {
    position: "absolute",
    right: "15px",
    display: "flex",
    alignItems: "center",
  },

  selectFiltro: {
    width: "100%",
    padding: "1rem 1.2rem",
    border: "2px solid #e8e8e8",
    borderRadius: "10px",
    fontSize: "1rem",
    fontFamily: "inherit",
    backgroundColor: "white",
    cursor: "pointer",
    outline: "none",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
  },

  resultadosInfo: {
    fontSize: "0.95rem",
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
    fontWeight: "400",
  },

  textoBusca: {
    color: "#b6a06a",
    fontWeight: "600",
    marginLeft: "0.5rem",
  },

  nenhumResultado: {
    color: "#c62828",
    fontWeight: "500",
  },

  // GRID DE PRODUTOS - UX/UI PREMIUM E-COMMERCE
  vestidosGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "2rem",
    marginTop: "2rem",
    "@media (min-width: 640px)": {
      gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
      gap: "2.5rem",
    },
    "@media (min-width: 768px)": {
      gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
      gap: "3rem",
    },
    "@media (min-width: 1024px)": {
      gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
      gap: "3.5rem",
    },
  },

  vestidoCard: {
    backgroundColor: "#ffffff",
    borderRadius: "0",
    overflow: "hidden",
    boxShadow: "none",
    cursor: "pointer",
    transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    position: "relative",
    border: "none",
    "&:hover": {
      transform: "translateY(-8px)",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
    },
  },

  vestidoImageContainer: {
    height: "420px",
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#fafafa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "@media (min-width: 768px)": {
      height: "500px",
    },
    "@media (min-width: 1024px)": {
      height: "520px",
    },
  },

  vestidoImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center top",
    transition: "transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    className: "vestido-image",
  },

  imageCount: {
    position: "absolute",
    top: "16px",
    right: "16px",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    color: "#2c2c2c",
    padding: "0.5rem 0.9rem",
    borderRadius: "25px",
    fontSize: "0.8rem",
    fontWeight: "600",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(255,255,255,0.3)",
    letterSpacing: "0.5px",
    "@media (min-width: 768px)": {
      top: "20px",
      right: "20px",
      fontSize: "0.85rem",
      padding: "0.6rem 1rem",
    },
  },

  hoverOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0,
    transition: "opacity 0.3s ease",
    className: "hover-overlay",
  },

  viewDetailsText: {
    color: "white",
    fontSize: "1.1rem",
    fontWeight: "600",
    letterSpacing: "1px",
    textTransform: "uppercase",
    padding: "0.8rem 2rem",
    border: "2px solid white",
    borderRadius: "2px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(4px)",
  },

  vestidoInfo: {
    padding: "2rem 1rem 2.5rem",
    textAlign: "left",
    backgroundColor: "#ffffff",
    "@media (min-width: 768px)": {
      padding: "2.5rem 1.5rem 3rem",
    },
  },

  vestidoName: {
    fontSize: "1.15rem",
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: "0.8rem",
    lineHeight: "1.3",
    letterSpacing: "0.3px",
    fontFamily: '"Cormorant Garamond", serif',
    "@media (min-width: 768px)": {
      fontSize: "1.3rem",
      marginBottom: "1rem",
    },
  },

  vestidoDescription: {
    fontSize: "0.9rem",
    color: "#666",
    lineHeight: "1.5",
    marginBottom: "1.2rem",
    fontWeight: "400",
    "@media (min-width: 768px)": {
      fontSize: "0.95rem",
      lineHeight: "1.6",
      marginBottom: "1.5rem",
    },
  },

  disponibilidadeIndicador: {
    marginTop: "auto",
  },

  disponibilidadeTexto: {
    fontSize: "0.8rem",
    color: "#28a745",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    display: "inline-flex",
    alignItems: "center",
    "&::before": {
      content: "•",
      marginRight: "0.5rem",
      fontSize: "1.2rem",
    },
  },

  // OUTROS ESTILOS PERMANECEM IGUAIS...
  erro: {
    backgroundColor: "#ffebee",
    color: "#c62828",
    padding: "1.5rem",
    borderRadius: "12px",
    marginBottom: "2rem",
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "1rem",
    flexDirection: "column",
    "@media (min-width: 768px)": {
      flexDirection: "row",
      flexWrap: "wrap",
    },
  },

  erroTexto: {
    fontSize: "0.95rem",
    lineHeight: "1.4",
    "@media (min-width: 768px)": {
      fontSize: "1rem",
    },
  },

  retryButton: {
    backgroundColor: "#c62828",
    color: "white",
    border: "none",
    padding: "0.8rem 1.5rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.9rem",
    transition: "background-color 0.3s",
    minWidth: "140px",
    fontWeight: "600",
  },

  loading: {
    textAlign: "center",
    fontSize: "1.1rem",
    color: "#666",
    padding: "4rem 0",
    "@media (min-width: 768px)": {
      fontSize: "1.3rem",
      padding: "5rem 0",
    },
  },

  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid #f3f3f3",
    borderTop: "3px solid #b6a06a",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 1.5rem",
    "@media (min-width: 768px)": {
      width: "50px",
      height: "50px",
    },
  },

  miniSpinner: {
    width: "18px",
    height: "18px",
    border: "2px solid #f3f3f3",
    borderTop: "2px solid #b6a06a",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    display: "inline-block",
  },

  emptyMessage: {
    textAlign: "center",
    padding: "3rem 1.5rem",
    backgroundColor: "#fafafa",
    borderRadius: "16px",
    margin: "3rem 0",
    "@media (min-width: 768px)": {
      padding: "5rem 3rem",
    },
  },

  emptyTitle: {
    fontSize: "1.6rem",
    marginBottom: "1.2rem",
    color: "#2c2c2c",
    fontWeight: "400",
    "@media (min-width: 768px)": {
      fontSize: "2rem",
    },
  },

  emptyText: {
    fontSize: "1.05rem",
    lineHeight: "1.6",
    color: "#666",
    marginBottom: "2rem",
  },

  contactButton: {
    display: "inline-block",
    backgroundColor: "#b6a06a",
    color: "white",
    padding: "1rem 2rem",
    borderRadius: "8px",
    textDecoration: "none",
    marginTop: "1rem",
    transition: "all 0.3s",
    fontWeight: "600",
    fontSize: "1rem",
    letterSpacing: "0.5px",
    "@media (min-width: 768px)": {
      padding: "1.2rem 2.5rem",
      fontSize: "1.1rem",
    },
  },

  carregarMaisContainer: {
    textAlign: "center",
    marginTop: "4rem",
  },

  carregarMaisButton: {
    backgroundColor: "#b6a06a",
    color: "white",
    border: "none",
    padding: "1.2rem 2.5rem",
    borderRadius: "10px",
    fontSize: "1.05rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.8rem",
    margin: "0 auto",
    minWidth: "220px",
    letterSpacing: "0.5px",
  },

  loadingInfinito: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "1rem",
    padding: "3rem 0",
    color: "#666",
    fontSize: "1rem",
  },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.92)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "1rem",
    backdropFilter: "blur(4px)",
    "@media (min-width: 768px)": {
      backgroundColor: "rgba(0,0,0,0.88)",
      padding: "2rem",
    },
  },

  modalContent: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    maxWidth: "1200px",
    width: "100%",
    maxHeight: "95vh",
    overflow: "auto",
    position: "relative",
    boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
    "@media (min-width: 768px)": {
      borderRadius: "16px",
      maxHeight: "90vh",
      boxShadow: "0 30px 60px rgba(0,0,0,0.4)",
    },
  },

  modalContentMobile: {
    margin: "0",
    borderRadius: "12px",
    maxHeight: "95vh",
  },

  closeButton: {
    position: "absolute",
    top: "15px",
    right: "20px",
    fontSize: "1.8rem",
    background: "rgba(0,0,0,0.8)",
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
    "@media (min-width: 768px)": {
      top: "25px",
      right: "30px",
      fontSize: "2rem",
      width: "50px",
      height: "50px",
    },
  },

  modalGrid: {
    display: "flex",
    flexDirection: "column",
    minHeight: "500px",
    "@media (min-width: 768px)": {
      display: "grid",
      gridTemplateColumns: "1.3fr 1fr",
      minHeight: "600px",
    },
  },

  modalGridMobile: {
    display: "flex",
    flexDirection: "column",
  },

  modalImageSection: {
    padding: "2rem 1.5rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fafafa",
    position: "relative",
    "@media (min-width: 768px)": {
      padding: "3.5rem",
    },
  },

  modalImageSectionMobile: {
    padding: "1.5rem",
    minHeight: "350px",
  },

  imageCarousel: {
    position: "relative",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  modalImage: {
    width: "100%",
    height: "auto",
    maxHeight: "500px",
    objectFit: "contain",
    borderRadius: "8px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
    "@media (min-width: 768px)": {
      maxHeight: "70vh",
      borderRadius: "12px",
      boxShadow: "0 12px 30px rgba(0,0,0,0.2)",
    },
  },

  modalImageMobile: {
    maxHeight: "350px",
  },

  navButton: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    backgroundColor: "rgba(0,0,0,0.75)",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "45px",
    height: "45px",
    fontSize: "1.6rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s",
    zIndex: 5,
    "&:hover": {
      backgroundColor: "rgba(0,0,0,0.9)",
      transform: "translateY(-50%) scale(1.1)",
    },
  },

  navButtonPrev: {
    left: "15px",
  },

  navButtonNext: {
    right: "15px",
  },

  imageIndicators: {
    position: "absolute",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: "10px",
    zIndex: 5,
  },

  indicator: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.5)",
    cursor: "pointer",
    transition: "all 0.3s",
  },

  indicatorActive: {
    backgroundColor: "white",
    transform: "scale(1.3)",
  },

  thumbnailContainer: {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
    justifyContent: "center",
    flexWrap: "wrap",
  },

  thumbnail: {
    width: "60px",
    height: "60px",
    objectFit: "cover",
    borderRadius: "6px",
    cursor: "pointer",
    border: "3px solid transparent",
    transition: "all 0.3s",
    opacity: 0.7,
    "@media (min-width: 768px)": {
      width: "70px",
      height: "70px",
    },
  },

  thumbnailActive: {
    border: "3px solid #b6a06a",
    opacity: 1,
    transform: "scale(1.05)",
  },

  modalInfoSection: {
    padding: "2.5rem 2rem",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#fff",
    "@media (min-width: 768px)": {
      padding: "3.5rem 2.5rem",
    },
  },

  modalInfoSectionMobile: {
    padding: "2rem 1.5rem",
  },

  modalTitle: {
    fontSize: "1.8rem",
    fontWeight: "400",
    color: "#2c2c2c",
    marginBottom: "1.5rem",
    lineHeight: "1.3",
    fontFamily: '"Cormorant Garamond", serif',
    "@media (min-width: 768px)": {
      fontSize: "2.4rem",
      marginBottom: "2rem",
    },
  },

  modalTitleMobile: {
    fontSize: "1.6rem",
    marginBottom: "1.2rem",
  },

  modalDescription: {
    fontSize: "1.05rem",
    lineHeight: "1.7",
    color: "#555",
    marginBottom: "2.5rem",
    flex: 1,
    "@media (min-width: 768px)": {
      fontSize: "1.15rem",
      lineHeight: "1.8",
      marginBottom: "3rem",
    },
  },

  modalDescriptionMobile: {
    fontSize: "1rem",
    lineHeight: "1.6",
    marginBottom: "2rem",
  },

  modalActions: {
    display: "flex",
    flexDirection: "column",
    gap: "1.2rem",
  },

  whatsappButton: {
    backgroundColor: "#25D366",
    color: "white",
    padding: "1.3rem",
    borderRadius: "10px",
    textAlign: "center",
    textDecoration: "none",
    fontSize: "1.1rem",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.8rem",
    transition: "all 0.3s ease",
    boxShadow: "0 6px 15px rgba(37, 211, 102, 0.3)",
    border: "none",
    cursor: "pointer",
    letterSpacing: "0.5px",
    "@media (min-width: 768px)": {
      padding: "1.5rem",
      borderRadius: "12px",
      fontSize: "1.2rem",
      gap: "1rem",
      boxShadow: "0 8px 20px rgba(37, 211, 102, 0.35)",
    },
  },

  whatsappButtonMobile: {
    padding: "1.2rem",
    fontSize: "1.05rem",
  },
};

export default Vestidos;

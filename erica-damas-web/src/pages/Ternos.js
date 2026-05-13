import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Helmet } from "react-helmet";
import { api } from "../services/AuthService";

const Ternos = () => {
  const [ternos, setTernos] = useState([]);
  const [ternosFiltrados, setTernosFiltrados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [ternoSelecionado, setTernoSelecionado] = useState(null);
  const [erro, setErro] = useState("");
  const [imagemModalAtual, setImagemModalAtual] = useState(0);
  const [modalHeight, setModalHeight] = useState(0);

  // Estados para paginação e filtros
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroTextoDebounced, setFiltroTextoDebounced] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [ordenacao, setOrdenacao] = useState("nome");
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [buscandoTexto, setBuscandoTexto] = useState(false);

  // Refs para otimização
  const debounceRef = useRef(null);
  const ternosIndexadosRef = useRef(new Map());
  const filtrosAnterioresRef = useRef({});

  // Detectar se é mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Configurações de paginação
  const ITENS_POR_PAGINA = isMobile ? 8 : 12;
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

  // Carregar ternos da API
  const carregarTernos = useCallback(async () => {
    try {
      setCarregando(true);
      setErro("");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await api.get("/produtos/ternos", {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const result = response.data;

      if (result.success) {
        const produtosProcessados = result.produtos.map((produto) => ({
          ...produto,
          imagemCarregada: false,
          preco: produto.preco || "Consulte",
        }));

        setTernos(produtosProcessados);
        ternosIndexadosRef.current = criarIndiceBusca(produtosProcessados);
        setTernosFiltrados(produtosProcessados);
      } else {
        setErro("Erro ao carregar ternos: " + result.message);
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
  const buscarTernos = useCallback((texto, categoria, ordenacaoTipo) => {
    const indice = ternosIndexadosRef.current;
    if (!indice.size) return [];

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

    return resultados;
  }, []);

  // Memoização da busca com cache inteligente
  const ternosFiltradosMemo = useMemo(() => {
    const cacheKey = `${filtroTextoDebounced}-${filtroCategoria}-${ordenacao}`;

    if (filtrosAnterioresRef.current.key === cacheKey) {
      return filtrosAnterioresRef.current.resultados;
    }

    const resultados = buscarTernos(
      filtroTextoDebounced,
      filtroCategoria,
      ordenacao
    );

    filtrosAnterioresRef.current = {
      key: cacheKey,
      resultados,
    };

    return resultados;
  }, [filtroTextoDebounced, filtroCategoria, ordenacao, buscarTernos]);

  // Atualizar estado quando filtros mudarem
  useEffect(() => {
    setTernosFiltrados(ternosFiltradosMemo);
    setPaginaAtual(1);
  }, [ternosFiltradosMemo]);

  // Obter categorias únicas (memoizado)
  const categorias = useMemo(() => {
    const categoriasUnicas = [
      ...new Set(ternos.map((terno) => terno.categoria).filter(Boolean)),
    ];
    return categoriasUnicas;
  }, [ternos]);

  // Ternos para exibir (paginação otimizada)
  const ternosParaExibir = useMemo(() => {
    const inicio = 0;
    const fim = paginaAtual * ITENS_POR_PAGINA;
    return ternosFiltrados.slice(inicio, fim);
  }, [ternosFiltrados, paginaAtual, ITENS_POR_PAGINA]);

  // Verificar se há mais itens para carregar
  const temMaisItens = ternosParaExibir.length < ternosFiltrados.length;

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

  // Scroll infinito otimizado para mobile
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
    carregarTernos();

    return () => {
      setTernos([]);
      setTernoSelecionado(null);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [carregarTernos]);

  // Intersection Observer otimizado
  useEffect(() => {
    if (ternosParaExibir.length === 0) return;

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
  }, [ternosParaExibir]);

  const abrirModal = useCallback((terno) => {
    setTernoSelecionado(terno);
    setImagemModalAtual(0);
    setModalHeight(Math.floor(window.innerHeight * 0.92));
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    if (terno.imagens && terno.imagens.length > 0) {
      const img = new Image();
      img.src = terno.imagens[0];

      if (terno.imagens.length > 1) {
        requestIdleCallback(() => {
          terno.imagens.slice(1).forEach((src) => {
            const img = new Image();
            img.src = src;
          });
        });
      }
    }
  }, []);

  const fecharModal = useCallback(() => {
    setTernoSelecionado(null);
    setImagemModalAtual(0);
    setModalHeight(0);
    const scrollY = document.body.style.top;
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    document.body.style.overflow = "";
    window.scrollTo(0, parseInt(scrollY || "0") * -1);
  }, []);

  const proximaImagem = useCallback(() => {
    if (ternoSelecionado && ternoSelecionado.imagens) {
      setImagemModalAtual((prev) =>
        prev === ternoSelecionado.imagens.length - 1 ? 0 : prev + 1
      );
    }
  }, [ternoSelecionado]);

  const imagemAnterior = useCallback(() => {
    if (ternoSelecionado && ternoSelecionado.imagens) {
      setImagemModalAtual((prev) =>
        prev === 0 ? ternoSelecionado.imagens.length - 1 : prev - 1
      );
    }
  }, [ternoSelecionado]);

  const gerarMensagemWhatsApp = useMemo(
    () => (terno) => {
      const mensagem = `Olá! Gostaria de saber mais sobre o terno "${terno.nome}". Poderia me dar mais informações sobre disponibilidade e valores?`;
      return `https://wa.me/5537999153738?text=${encodeURIComponent(mensagem)}`;
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
                placeholder="Buscar ternos..."
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
          {ternosFiltrados.length > 0 ? (
            <span>
              Exibindo {ternosParaExibir.length} de {ternosFiltrados.length}{" "}
              ternos
              {filtroTextoDebounced && (
                <span style={styles.textoBusca}>
                  • Busca: "{filtroTextoDebounced}"
                </span>
              )}
            </span>
          ) : filtroTextoDebounced || filtroCategoria !== "todas" ? (
            <span style={styles.nenhumResultado}>
              Nenhum terno encontrado para os filtros aplicados
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
      ternosFiltrados.length,
      ternosParaExibir.length,
      buscandoTexto,
      handleTextoChange,
    ]
  );

  // Renderização da grid estilo Louis Vuitton (sem botão de favorito)
  const renderTernosGrid = useMemo(() => {
    if (ternosParaExibir.length === 0) return null;

    return (
      <div style={styles.ternosGrid}>
        {ternosParaExibir.map((terno, index) => (
          <div
            key={`${terno._id}-${index}`}
            style={styles.ternoCard}
            className="terno-card"
            onClick={() => abrirModal(terno)}
          >
            {/* Container da Imagem */}
            <div style={styles.ternoImageContainer}>
              <img
                data-src={terno.imagens[0]}
                alt={terno.nome}
                style={styles.ternoImage}
                onError={(e) => {
                  e.target.style.backgroundColor = "#f8f8f8";
                  e.target.alt = "Imagem não disponível";
                }}
                loading="lazy"
              />

              {/* Overlay de hover */}
              <div style={styles.hoverOverlay} className="hover-overlay">
                <span style={styles.viewDetailsText}>Ver Detalhes</span>
              </div>
            </div>

            {/* Informações do Produto */}
            <div style={styles.ternoInfo}>
              <h3 style={styles.ternoName}>{terno.nome}</h3>
              <p style={styles.ternoPrice}>
                {typeof terno.preco === "number"
                  ? `R$ ${terno.preco.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}`
                  : "Consulte o preço"}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }, [ternosParaExibir, abrirModal]);

  return (
    <section style={styles.ternosContainer}>
      <Helmet>
        <title>{`Erica Damas - Ternos (${ternosFiltrados.length} modelos)`}</title>
        <meta
          name="description"
          content={`Conheça nossa coleção exclusiva de ${ternosFiltrados.length} ternos elegantes e sofisticados.`}
        />
        <meta
          name="keywords"
          content="ternos, casamento, noivo, terno masculino"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href={api.defaults.baseURL} />
        <link rel="dns-prefetch" href={api.defaults.baseURL} />
      </Helmet>

      <div style={styles.tituloContainer}>
        <h1 style={styles.titulo}>TERNOS</h1>
        <div style={styles.divisor}></div>
      </div>

      {erro && (
        <div style={styles.erro}>
          <div style={styles.erroTexto}>{erro}</div>
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
          <h2 style={styles.emptyTitle}>Em breve, novos ternos exclusivos</h2>
          <p style={styles.emptyText}>
            Nossa coleção está sendo atualizada. Entre em contato para conhecer
            nossas opções disponíveis.
          </p>
          <a
            href="https://wa.me/5537999153738?text=Ol%C3%A1%2C%20gostaria%20de%20conhecer%20os%20ternos%20dispon%C3%ADveis"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.contactButton}
            className="contact-button"
          >
            Fale Conosco
          </a>
        </div>
      ) : (
        <React.Fragment>
          {renderTernosGrid}

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
                    ternosFiltrados.length - ternosParaExibir.length
                  } restantes)`
                )}
              </button>
            </div>
          )}

          {/* Loading infinito - Mobile */}
          {isMobile && carregandoMais && (
            <div style={styles.loadingInfinito}>
              <div style={styles.miniSpinner}></div>
              <span>Carregando mais ternos...</span>
            </div>
          )}
        </React.Fragment>
      )}

      {/* Modal desktop */}
      {ternoSelecionado && !isMobile && (
        <div style={styles.modalOverlay} onClick={fecharModal}>
          <div style={styles.modalPanel} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeButton} onClick={fecharModal} aria-label="Fechar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div style={styles.modalBody}>
              <div style={styles.modalImageCol}>
                <div style={styles.mainImageWrap}>
                  <img src={ternoSelecionado.imagens?.[imagemModalAtual]} alt={ternoSelecionado.nome} style={styles.modalMainImage} />
                  {ternoSelecionado.imagens?.length > 1 && (
                    <>
                      <button style={{ ...styles.arrowBtn, left: "12px" }} onClick={imagemAnterior} aria-label="Imagem anterior">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                      </button>
                      <button style={{ ...styles.arrowBtn, right: "12px" }} onClick={proximaImagem} aria-label="Próxima imagem">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                      </button>
                    </>
                  )}
                </div>
                {ternoSelecionado.imagens?.length > 1 && (
                  <div style={styles.thumbRow}>
                    {ternoSelecionado.imagens.slice(0, 6).map((img, i) => (
                      <button key={i} style={{ ...styles.thumbBtn, ...(i === imagemModalAtual ? styles.thumbBtnActive : {}) }} onClick={() => setImagemModalAtual(i)} aria-label={`Imagem ${i + 1}`}>
                        <img src={img} alt="" style={styles.thumbImg} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div style={styles.modalInfoCol}>
                <div style={styles.modalInfoScroll}>
                  {ternoSelecionado.categoria && <p style={styles.modalCategory}>{ternoSelecionado.categoria.toUpperCase()}</p>}
                  <h2 style={styles.modalTitle}>{ternoSelecionado.nome}</h2>
                  <p style={styles.modalPrice}>{typeof ternoSelecionado.preco === "number" ? `R$ ${ternoSelecionado.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "Consulte o preço"}</p>
                  <hr style={styles.modalDivider} />
                  <p style={styles.modalDesc}>{ternoSelecionado.descricao}</p>
                  {ternoSelecionado.imagens?.length > 1 && <p style={styles.modalImageCount}>{imagemModalAtual + 1} / {ternoSelecionado.imagens.length}</p>}
                </div>
                <div style={styles.modalCta}>
                  <a href={gerarMensagemWhatsApp(ternoSelecionado)} target="_blank" rel="noopener noreferrer" style={styles.ctaPrimary} className="cta-primary-btn">Agendar Consulta</a>
                  <p style={styles.ctaNote}>Atendimento exclusivo e personalizado</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal mobile — X independente do sheet, impossível de sumir */}
      {ternoSelecionado && isMobile && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 1001, backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }} onClick={fecharModal} />
          <button onClick={fecharModal} aria-label="Fechar" style={{ position: "fixed", top: "16px", right: "16px", zIndex: 10001, width: "44px", height: "44px", background: "rgba(20,20,20,0.82)", border: "none", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", WebkitTransform: "translateZ(0)", transform: "translateZ(0)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: `${modalHeight}px`, backgroundColor: "#fff", borderRadius: "16px 16px 0 0", zIndex: 1002, display: "flex", flexDirection: "column", animation: "sheetSlideUp 0.32s cubic-bezier(0.32,0.72,0,1)", WebkitTransform: "translateZ(0)", transform: "translateZ(0)" }}>
            <div style={{ height: "20px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, paddingTop: "8px" }}>
              <div style={{ width: "36px", height: "4px", borderRadius: "2px", backgroundColor: "#ddd" }} />
            </div>
            <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", overscrollBehavior: "contain", minHeight: 0 }}>
              <div style={{ position: "relative", width: "100%", backgroundColor: "#f5f5f5" }}>
                <img src={ternoSelecionado.imagens?.[imagemModalAtual]} alt={ternoSelecionado.nome} style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover", display: "block" }} />
                {ternoSelecionado.imagens?.length > 1 && (
                  <>
                    <button style={{ ...styles.arrowBtn, left: "12px" }} onClick={imagemAnterior} aria-label="Imagem anterior">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                    </button>
                    <button style={{ ...styles.arrowBtn, right: "12px" }} onClick={proximaImagem} aria-label="Próxima imagem">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                    </button>
                  </>
                )}
              </div>
              {ternoSelecionado.imagens?.length > 1 && (
                <div style={styles.thumbRow}>
                  {ternoSelecionado.imagens.slice(0, 6).map((img, i) => (
                    <button key={i} style={{ ...styles.thumbBtn, ...(i === imagemModalAtual ? styles.thumbBtnActive : {}) }} onClick={() => setImagemModalAtual(i)} aria-label={`Imagem ${i + 1}`}>
                      <img src={img} alt="" style={styles.thumbImg} />
                    </button>
                  ))}
                </div>
              )}
              <div style={{ padding: "1.25rem 1.25rem 0" }}>
                {ternoSelecionado.categoria && <p style={styles.modalCategory}>{ternoSelecionado.categoria.toUpperCase()}</p>}
                <h2 style={{ ...styles.modalTitle, fontSize: "1.4rem" }}>{ternoSelecionado.nome}</h2>
                <p style={styles.modalPrice}>{typeof ternoSelecionado.preco === "number" ? `R$ ${ternoSelecionado.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "Consulte o preço"}</p>
                <hr style={styles.modalDivider} />
                <p style={styles.modalDesc}>{ternoSelecionado.descricao}</p>
                {ternoSelecionado.imagens?.length > 1 && <p style={{ ...styles.modalImageCount, marginBottom: "0.5rem" }}>{imagemModalAtual + 1} / {ternoSelecionado.imagens.length}</p>}
              </div>
            </div>
            <div style={{ ...styles.modalCta, flexShrink: 0 }}>
              <a href={gerarMensagemWhatsApp(ternoSelecionado)} target="_blank" rel="noopener noreferrer" style={styles.ctaPrimary} className="cta-primary-btn">Agendar Consulta</a>
              <p style={styles.ctaNote}>Atendimento exclusivo e personalizado</p>
            </div>
          </div>
        </>
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

        .terno-card {
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          animation: fadeInUp 0.6s ease forwards;
        }

        .terno-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .terno-card:hover .terno-image {
          transform: scale(1.05);
        }

        .terno-card:hover .hover-overlay {
          opacity: 1;
        }

        .carregar-mais-button:hover:not(:disabled) {
          background-color: #9a8655;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(154, 134, 85, 0.3);
        }

        .cta-primary-btn:hover {
          background-color: #333 !important;
        }

        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(24px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes sheetSlideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .terno-card:hover {
            transform: none;
            box-shadow: none;
          }
        }
      `}</style>
    </section>
  );
};

const styles = {
  ternosContainer: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "2rem 1rem",
    fontFamily: '"Cormorant Garamond", serif',
    backgroundColor: "#ffffff",
  },

  tituloContainer: {
    textAlign: "center",
    marginBottom: "3rem",
  },

  titulo: {
    fontSize: "2.5rem",
    fontWeight: "300",
    letterSpacing: "3px",
    color: "#2c2c2c",
    marginBottom: "1.5rem",
    textTransform: "uppercase",
    lineHeight: "1.2",
  },

  divisor: {
    width: "80px",
    height: "2px",
    backgroundColor: "#b6a06a",
    margin: "0 auto",
  },

  // GRID ESTILO LOUIS VUITTON (SEM BOTÃO DE FAVORITO)
  ternosGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "2rem",
    marginTop: "2rem",
    "@media (min-width: 768px)": {
      gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
      gap: "2.5rem",
    },
    "@media (min-width: 1200px)": {
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "2rem",
    },
  },

  ternoCard: {
    backgroundColor: "#ffffff",
    borderRadius: "0",
    overflow: "hidden",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    position: "relative",
    border: "none",
    boxShadow: "none",
  },

  ternoImageContainer: {
    height: "450px",
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#f8f8f8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  ternoImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center",
    transition: "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  },

  hoverOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0,
    transition: "opacity 0.3s ease",
  },

  viewDetailsText: {
    color: "white",
    fontSize: "1rem",
    fontWeight: "600",
    letterSpacing: "1px",
    textTransform: "uppercase",
    padding: "0.8rem 1.5rem",
    border: "2px solid white",
    borderRadius: "0",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(4px)",
  },

  // Informações do produto estilo LV
  ternoInfo: {
    padding: "1.5rem 0 2rem 0",
    textAlign: "left",
    backgroundColor: "#ffffff",
  },

  ternoName: {
    fontSize: "1.1rem",
    fontWeight: "400",
    color: "#1a1a1a",
    marginBottom: "0.5rem",
    lineHeight: "1.3",
    letterSpacing: "0.5px",
    fontFamily: '"Helvetica Neue", Arial, sans-serif',
    textTransform: "capitalize",
  },

  ternoPrice: {
    fontSize: "1rem",
    color: "#666",
    fontWeight: "500",
    letterSpacing: "0.3px",
    fontFamily: '"Helvetica Neue", Arial, sans-serif',
  },

  // Outros estilos permanecem iguais...
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
  },

  erroTexto: {
    fontSize: "0.95rem",
    lineHeight: "1.4",
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
  },

  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid #f3f3f3",
    borderTop: "3px solid #b6a06a",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 1.5rem",
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
  },

  emptyTitle: {
    fontSize: "1.6rem",
    marginBottom: "1.2rem",
    color: "#2c2c2c",
    fontWeight: "400",
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

  // ─── Modal ────────────────────────────────────────────────

  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "1rem",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
  },

  modalPanel: {
    backgroundColor: "#fff",
    width: "100%",
    maxWidth: "1060px",
    maxHeight: "92vh",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    animation: "modalSlideIn 0.28s ease",
    overflow: "hidden",
  },

  modalSheetMobile: {
    width: "100%",
    backgroundColor: "#fff",
    maxHeight: "92vh",
    display: "flex",
    flexDirection: "column",
    borderRadius: "16px 16px 0 0",
    animation: "sheetSlideUp 0.32s cubic-bezier(0.32,0.72,0,1)",
    overflow: "hidden",
    WebkitTransform: "translateZ(0)",
    transform: "translateZ(0)",
  },

  closeButton: {
    position: "absolute",
    top: "16px",
    right: "16px",
    width: "36px",
    height: "36px",
    background: "#fff",
    border: "1px solid #e5e5e5",
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
    color: "#111",
    transition: "background 0.2s",
  },

  mobileModalTopBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "10px 14px 8px",
    flexShrink: 0,
    position: "relative",
    borderBottom: "1px solid #f0f0f0",
  },

  mobileModalHandle: {
    position: "absolute",
    left: "50%",
    top: "10px",
    transform: "translateX(-50%)",
    width: "36px",
    height: "4px",
    borderRadius: "2px",
    backgroundColor: "#ddd",
  },

  mobileCloseButton: {
    width: "34px",
    height: "34px",
    background: "#f5f5f5",
    border: "none",
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#111",
    flexShrink: 0,
  },

  modalBody: {
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    flex: 1,
    overflow: "hidden",
  },

  modalBodyMobile: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    overflowY: "auto",
  },

  // Coluna imagem
  modalImageCol: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#f7f7f7",
    overflow: "hidden",
  },

  mainImageWrap: {
    position: "relative",
    flex: 1,
    overflow: "hidden",
    minHeight: "0",
  },

  modalMainImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  arrowBtn: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    width: "36px",
    height: "36px",
    backgroundColor: "rgba(255,255,255,0.92)",
    border: "none",
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#111",
    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
    zIndex: 5,
  },

  thumbRow: {
    display: "flex",
    gap: "6px",
    padding: "10px",
    overflowX: "auto",
    flexShrink: 0,
    backgroundColor: "#f7f7f7",
  },

  thumbBtn: {
    width: "56px",
    height: "56px",
    flexShrink: 0,
    padding: 0,
    border: "2px solid transparent",
    borderRadius: "4px",
    cursor: "pointer",
    overflow: "hidden",
    background: "transparent",
    transition: "border-color 0.15s",
  },

  thumbBtnActive: {
    borderColor: "#111",
  },

  thumbImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  // Coluna info
  modalInfoCol: {
    display: "flex",
    flexDirection: "column",
    borderLeft: "1px solid #f0f0f0",
    overflow: "hidden",
  },

  modalInfoScroll: {
    flex: 1,
    overflowY: "auto",
    padding: "3rem 2.5rem 1.5rem",
  },

  modalCategory: {
    fontSize: "0.7rem",
    letterSpacing: "2px",
    color: "#999",
    marginBottom: "0.75rem",
    fontFamily: '"Helvetica Neue", Arial, sans-serif',
  },

  modalTitle: {
    fontSize: "1.75rem",
    fontWeight: "400",
    color: "#111",
    marginBottom: "1rem",
    lineHeight: "1.25",
    fontFamily: '"Cormorant Garamond", Georgia, serif',
  },

  modalPrice: {
    fontSize: "1.1rem",
    color: "#111",
    fontWeight: "500",
    marginBottom: "1.5rem",
    fontFamily: '"Helvetica Neue", Arial, sans-serif',
  },

  modalDivider: {
    border: "none",
    borderTop: "1px solid #f0f0f0",
    marginBottom: "1.5rem",
  },

  modalDesc: {
    fontSize: "0.95rem",
    lineHeight: "1.75",
    color: "#555",
    fontFamily: '"Helvetica Neue", Arial, sans-serif',
  },

  modalImageCount: {
    marginTop: "1.5rem",
    fontSize: "0.75rem",
    color: "#bbb",
    fontFamily: '"Helvetica Neue", Arial, sans-serif',
  },

  // CTA
  modalCta: {
    padding: "1.5rem 2.5rem",
    borderTop: "1px solid #f0f0f0",
    backgroundColor: "#fff",
    flexShrink: 0,
  },

  ctaPrimary: {
    display: "block",
    width: "100%",
    padding: "1rem",
    backgroundColor: "#111",
    color: "#fff",
    textAlign: "center",
    textDecoration: "none",
    fontSize: "0.85rem",
    fontWeight: "600",
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    borderRadius: "0",
    transition: "background 0.2s ease",
    fontFamily: '"Helvetica Neue", Arial, sans-serif',
  },

  ctaNote: {
    marginTop: "0.75rem",
    fontSize: "0.75rem",
    color: "#aaa",
    textAlign: "center",
    fontFamily: '"Helvetica Neue", Arial, sans-serif',
  },
};

export default Ternos;

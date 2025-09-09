import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Adicionando estilos CSS para os efeitos de hover e responsividade
const addResponsiveStyles = () => {
  const style = document.createElement("style");
  style.innerHTML = `
  .slick-slide:hover .categoria-imagem {
    transform: scale(1.05);
  }
  .categoria-button:hover {
    background-color: #b6a06a !important;
    border-color: #b6a06a !important;
  }
  .categoria-overlay:hover {
    background-color: rgba(0, 0, 0, 0.5) !important;
  }

  /* Ajustes para o carrossel */
  .categorias-carrossel .slick-list {
    margin: 0 10px;
  }

  .categorias-carrossel .slick-prev {
    left: -5px;
    z-index: 10;
  }

  .categorias-carrossel .slick-next {
    right: -5px;
    z-index: 10;
  }

  /* Ajustes para dispositivos móveis */
  @media (max-width: 767px) {
    .categorias-carrossel .slick-dots {
      bottom: -30px;
    }
    
    .categorias-carrossel .slick-dots li button:before {
      font-size: 8px;
    }
    
    .categoria-card {
      height: 350px !important;
    }
    
    .categoria-overlay {
      padding: 1.2rem !important;
    }
    
    .categoria-titulo {
      font-size: 1.8rem !important;
      margin-bottom: 0.2rem !important;
    }
    
    .categoria-subtitulo {
      font-size: 0.9rem !important;
      margin-bottom: 1rem !important;
    }
    
    .categoria-button {
      padding: 0.5rem 1.5rem !important;
      font-size: 0.85rem !important;
    }
    
    .section-title {
      font-size: 1.8rem !important;
      margin-bottom: 0.5rem !important;
    }
    
    .divisor {
      margin-bottom: 1.8rem !important;
    }
  }

  @media (min-width: 768px) {
    .categorias-carrossel .slick-list {
      margin: 0 40px;
    }

    .categorias-carrossel .slick-prev {
      left: 10px;
    }

    .categorias-carrossel .slick-next {
      right: 10px;
    }
  }

  @media (min-width: 1200px) {
    .categorias-carrossel .slick-list {
      margin: 0 60px;
    }

    .categorias-carrossel .slick-prev {
      left: 20px;
    }

    .categorias-carrossel .slick-next {
      right: 20px;
    }
  }
`;
  document.head.appendChild(style);
};

const CategoriasCarrossel = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1200;

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Adicionar os estilos responsivos quando o componente for montado
  useEffect(() => {
    addResponsiveStyles();
  }, []);

  // Categorias com imagens temporárias de serviços de placeholder
  const categorias = [
    {
      id: 1,
      titulo: "NOIVAS",
      subtitulo: "elegância e sofisticação",
      imagem:
        "https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
      link: "/vestidos",
    },
    {
      id: 2,
      titulo: "DEBUTANTES",
      subtitulo: "para momentos especiais",
      imagem:
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=783&q=80",
      link: "/debutantes",
    },
    {
      id: 3,
      titulo: "TERNOS",
      subtitulo: "estilo e distinção",
      imagem:
        "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80",
      link: "/ternos",
    },
  ];

  // Configurações responsivas para o slider
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: isMobile ? 1 : isTablet ? 2 : 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    arrows: !isMobile, // Esconder setas em dispositivos móveis
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,
          dots: true,
        },
      },
    ],
  };

  // Estilos dinâmicos baseados no tamanho da tela
  const dynamicStyles = {
    categoriaSection: {
      padding: isMobile ? "2rem 0" : "3rem 0",
      backgroundColor: "#f9f9f9",
    },
    container: {
      maxWidth: "1400px",
      margin: "0 auto",
      padding: isMobile ? "0 1rem" : "0 2rem",
    },
    carrosselContainer: {
      padding: isMobile ? "0 10px" : "0 20px",
      marginBottom: isMobile ? "30px" : "0",
    },
    sectionTitle: {
      fontSize: isMobile ? "1.8rem" : "2.2rem",
      fontWeight: "300",
      color: "#5d4037",
      textAlign: "center",
      marginBottom: isMobile ? "0.5rem" : "0.8rem",
      fontFamily: '"Cormorant Garamond", serif',
      className: "section-title",
    },
    divisor: {
      width: isMobile ? "60px" : "80px",
      height: "2px",
      backgroundColor: "#b6a06a",
      margin: isMobile ? "0 auto 1.8rem auto" : "0 auto 2.5rem auto",
      className: "divisor",
    },
    categoriaCard: {
      position: "relative",
      overflow: "hidden",
      borderRadius: "5px",
      boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)",
      height: isMobile ? "350px" : "400px",
      className: "categoria-card",
    },
    categoriaOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-end",
      padding: isMobile ? "1.2rem" : "1.8rem",
      className: "categoria-overlay",
    },
    categoriaTitulo: {
      fontSize: isMobile ? "1.8rem" : "2.2rem",
      fontWeight: "300",
      marginBottom: isMobile ? "0.2rem" : "0.4rem",
      fontFamily: '"Cormorant Garamond", serif',
      letterSpacing: "1px",
      className: "categoria-titulo",
    },
    categoriaSubtitulo: {
      fontSize: isMobile ? "0.9rem" : "1rem",
      fontWeight: "300",
      marginBottom: isMobile ? "1rem" : "1.2rem",
      fontFamily: '"Cormorant Garamond", serif',
      fontStyle: "italic",
      className: "categoria-subtitulo",
    },
    categoriaButton: {
      display: "inline-block",
      padding: isMobile ? "0.5rem 1.5rem" : "0.6rem 1.8rem",
      backgroundColor: "transparent",
      color: "#fff",
      border: "1px solid #fff",
      borderRadius: "3px",
      textDecoration: "none",
      fontSize: isMobile ? "0.85rem" : "0.9rem",
      textTransform: "lowercase",
      letterSpacing: "1px",
      transition: "all 0.3s ease",
      cursor: "pointer",
    },
  };

  // Manter os estilos estáticos separados
  const staticStyles = {
    slider: {
      margin: "0 auto",
    },
    categoriaItem: {
      padding: "0 15px",
      boxSizing: "border-box",
    },
    categoriaImagem: {
      width: "100%",
      height: "100%",
      backgroundSize: "cover",
      backgroundPosition: "center",
      transition: "transform 0.5s ease",
    },
    categoriaTexto: {
      color: "#fff",
      textAlign: "left",
    },
  };

  return (
    <section style={dynamicStyles.categoriaSection}>
      <div style={dynamicStyles.container}>
        <h2 style={dynamicStyles.sectionTitle}>Nossas Coleções</h2>
        <div style={dynamicStyles.divisor}></div>

        <div
          className="categorias-carrossel"
          style={dynamicStyles.carrosselContainer}
        >
          <Slider {...settings} style={staticStyles.slider}>
            {categorias.map((categoria) => (
              <div key={categoria.id} style={staticStyles.categoriaItem}>
                <div style={dynamicStyles.categoriaCard}>
                  <div
                    className="categoria-imagem"
                    style={{
                      ...staticStyles.categoriaImagem,
                      backgroundImage: `url(${categoria.imagem})`,
                    }}
                  >
                    <div
                      className="categoria-overlay"
                      style={dynamicStyles.categoriaOverlay}
                    >
                      <div style={staticStyles.categoriaTexto}>
                        <h3 style={dynamicStyles.categoriaTitulo}>
                          {categoria.titulo}
                        </h3>
                        <p style={dynamicStyles.categoriaSubtitulo}>
                          {categoria.subtitulo}
                        </p>
                        <Link
                          to={categoria.link}
                          className="categoria-button"
                          style={dynamicStyles.categoriaButton}
                        >
                          conferir
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
};

export default CategoriasCarrossel;

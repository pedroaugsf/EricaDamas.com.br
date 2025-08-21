import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Adicionando estilos CSS para os efeitos de hover que não podem ser feitos com inline styles
const addHoverStyles = () => {
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
margin: 0 20px;
}

.categorias-carrossel .slick-prev {
left: -5px;
z-index: 10;
}

.categorias-carrossel .slick-next {
right: -5px;
z-index: 10;
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Adicionar os estilos de hover quando o componente for montado
  useEffect(() => {
    addHoverStyles();
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

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: isMobile ? 1 : 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
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
        },
      },
    ],
  };

  return (
    <section style={styles.categoriaSection}>
      <div style={styles.container}>
        <h2 style={styles.sectionTitle}>Nossas Coleções</h2>
        <div style={styles.divisor}></div>

        <div className="categorias-carrossel" style={styles.carrosselContainer}>
          <Slider {...settings} style={styles.slider}>
            {categorias.map((categoria) => (
              <div key={categoria.id} style={styles.categoriaItem}>
                <div style={styles.categoriaCard}>
                  <div
                    className="categoria-imagem"
                    style={{
                      ...styles.categoriaImagem,
                      backgroundImage: `url(${categoria.imagem})`,
                    }}
                  >
                    <div
                      className="categoria-overlay"
                      style={styles.categoriaOverlay}
                    >
                      <div style={styles.categoriaTexto}>
                        <h3 style={styles.categoriaTitulo}>
                          {categoria.titulo}
                        </h3>
                        <p style={styles.categoriaSubtitulo}>
                          {categoria.subtitulo}
                        </p>
                        <Link
                          to={categoria.link}
                          className="categoria-button"
                          style={styles.categoriaButton}
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

const styles = {
  categoriaSection: {
    padding: "3rem 0", // Reduzido de 4rem para 3rem
    backgroundColor: "#f9f9f9",
  },
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "0 2rem",
  },
  carrosselContainer: {
    padding: "0 20px",
  },
  sectionTitle: {
    fontSize: "2.2rem", // Reduzido de 2.5rem para 2.2rem
    fontWeight: "300",
    color: "#5d4037",
    textAlign: "center",
    marginBottom: "0.8rem", // Reduzido de 1rem para 0.8rem
    fontFamily: '"Cormorant Garamond", serif',
  },
  divisor: {
    width: "80px",
    height: "2px",
    backgroundColor: "#b6a06a",
    margin: "0 auto 2.5rem auto", // Reduzido de 3rem para 2.5rem
  },
  slider: {
    margin: "0 auto",
  },
  categoriaItem: {
    padding: "0 15px",
    boxSizing: "border-box",
  },
  categoriaCard: {
    position: "relative",
    overflow: "hidden",
    borderRadius: "5px",
    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)",
    height: "400px", // Reduzido de 500px para 400px
  },
  categoriaImagem: {
    width: "100%",
    height: "100%",
    backgroundSize: "cover",
    backgroundPosition: "center",
    transition: "transform 0.5s ease",
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
    padding: "1.8rem", // Reduzido de 2rem para 1.8rem
  },
  categoriaTexto: {
    color: "#fff",
    textAlign: "left",
  },
  categoriaTitulo: {
    fontSize: "2.2rem", // Reduzido de 2.5rem para 2.2rem
    fontWeight: "300",
    marginBottom: "0.4rem", // Reduzido de 0.5rem para 0.4rem
    fontFamily: '"Cormorant Garamond", serif',
    letterSpacing: "1px",
  },
  categoriaSubtitulo: {
    fontSize: "1rem", // Reduzido de 1.1rem para 1rem
    fontWeight: "300",
    marginBottom: "1.2rem", // Reduzido de 1.5rem para 1.2rem
    fontFamily: '"Cormorant Garamond", serif',
    fontStyle: "italic",
  },
  categoriaButton: {
    display: "inline-block",
    padding: "0.6rem 1.8rem", // Reduzido de 0.75rem 2rem para 0.6rem 1.8rem
    backgroundColor: "transparent",
    color: "#fff",
    border: "1px solid #fff",
    borderRadius: "3px",
    textDecoration: "none",
    fontSize: "0.9rem",
    textTransform: "lowercase",
    letterSpacing: "1px",
    transition: "all 0.3s ease",
    cursor: "pointer",
  },
};

export default CategoriasCarrossel;

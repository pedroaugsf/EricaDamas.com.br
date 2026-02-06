import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import { Link } from "react-router-dom";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Componentes personalizados para as setas de navegação
const NextArrow = (props) => {
  const { onClick, isMobile } = props;
  return (
    <div
      className="custom-arrow next-arrow"
      onClick={onClick}
      style={{
        position: "absolute",
        right: isMobile ? "15px" : "30px",
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 10,
        cursor: "pointer",
        width: isMobile ? "40px" : "50px",
        height: isMobile ? "40px" : "50px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255, 255, 255, 0.3)",
        borderRadius: "50%",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
      }}
    >
      <FaChevronRight size={isMobile ? 18 : 24} color="#fff" />
    </div>
  );
};

const PrevArrow = (props) => {
  const { onClick, isMobile } = props;
  return (
    <div
      className="custom-arrow prev-arrow"
      onClick={onClick}
      style={{
        position: "absolute",
        left: isMobile ? "15px" : "30px",
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 10,
        cursor: "pointer",
        width: isMobile ? "40px" : "50px",
        height: isMobile ? "40px" : "50px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255, 255, 255, 0.3)",
        borderRadius: "50%",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
      }}
    >
      <FaChevronLeft size={isMobile ? 18 : 24} color="#fff" />
    </div>
  );
};

const CarrosselVitrine = () => {
  const [isMobile, setIsMobile] = useState(false);

  // Detectar se é dispositivo móvel
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    swipeToSlide: true,
    fade: true,
    cssEase: "linear",
    nextArrow: <NextArrow isMobile={isMobile} />,
    prevArrow: <PrevArrow isMobile={isMobile} />,
    appendDots: (dots) => (
      <div
        style={{
          position: "absolute",
          bottom: isMobile ? "18px" : "26px",
          width: "100%",
          padding: "0",
          margin: "0",
          listStyle: "none",
          textAlign: "center",
        }}
      >
        <ul style={{ margin: "0", padding: "0" }}>{dots}</ul>
      </div>
    ),
    customPaging: (i) => (
      <div
        style={{
          width: isMobile ? "8px" : "10px",
          height: isMobile ? "8px" : "10px",
          margin: "0 6px",
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          borderRadius: "50%",
          display: "inline-block",
          transition: "all 0.3s ease",
        }}
      />
    ),
  };

  const colecoes = [
    {
      id: 1,
      titulo: "Coleção de Ternos",
      subtitulo: "Para noivos e convidados",
      imagem:
        "/SITEEGT3.jpg",
      link: "/ternos",
      cta: "Ver Ternos Disponíveis",
    },
    {
      id: 2,
      titulo: "Vestidos de Noiva",
      subtitulo: "Alta costura para seu grande dia",
      imagem:
        "/SITEEGVN.jpg",
      link: "/vestidos",
      cta: "Explorar Vestidos",
    },
    {
      id: 3,
      titulo: "Vestidos de Debutante",
      subtitulo: "Para momentos especiais",
      imagem:
        "/SITEEGVN3.jpg",
      link: "/debutantes",
      cta: "Conhecer Modelos",
    },
  ];

  return (
    <div
      className="vitrine-container"
      style={{
        width: "100%",
        height: "auto",
        position: "relative",
        marginTop: "0",
        backgroundColor: "#f1ece5",
      }}
    >
      <Slider {...settings}>
        {colecoes.map((colecao) => (
          <div key={colecao.id}>
            <div
              style={{
                minHeight: isMobile ? "620px" : "540px",
                padding: isMobile ? "24px 18px 50px" : "40px 80px 70px",
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.5) 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: "1200px",
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1.1fr 0.9fr",
                  gap: isMobile ? "24px" : "48px",
                  alignItems: "center",
                }}
              >
                <div style={{ color: "#fff" }}>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      letterSpacing: "0.35em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.7)",
                    }}
                  >
                    Erica Damas
                  </div>
                  <h2
                    style={{
                      fontSize: isMobile ? "2.1rem" : "3.1rem",
                      fontWeight: 500,
                      fontFamily: '"Cormorant Garamond", serif',
                      margin: "16px 0 10px",
                    }}
                  >
                    {colecao.titulo}
                  </h2>
                  <p
                    style={{
                      fontSize: isMobile ? "1.05rem" : "1.2rem",
                      color: "rgba(255,255,255,0.85)",
                      marginBottom: "24px",
                    }}
                  >
                    {colecao.subtitulo}
                  </p>
                  <Link
                    to={colecao.link}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "10px",
                      color: "#fff",
                      borderBottom: "1px solid rgba(255,255,255,0.6)",
                      paddingBottom: "6px",
                      fontSize: "0.95rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.2em",
                    }}
                  >
                    Descubra a coleção
                    <FaChevronRight size={12} />
                  </Link>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: isMobile ? "70%" : "100%",
                      maxWidth: "360px",
                      height: isMobile ? "420px" : "520px",
                      backgroundColor: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "16px",
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    <img
                      src={colecao.imagem}
                      alt={colecao.titulo}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        objectPosition: "center",
                        filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.35))",
                      }}
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default CarrosselVitrine;

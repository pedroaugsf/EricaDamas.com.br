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
    fade: true,
    cssEase: "linear",
    nextArrow: <NextArrow isMobile={isMobile} />,
    prevArrow: <PrevArrow isMobile={isMobile} />,
    appendDots: (dots) => (
      <div
        style={{
          position: "absolute",
          bottom: isMobile ? "15px" : "25px",
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
          width: isMobile ? "8px" : "12px",
          height: isMobile ? "8px" : "12px",
          margin: "0 5px",
          backgroundColor: "rgba(255, 255, 255, 0.5)",
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
        "https://images.unsplash.com/photo-1600091166971-7f9faad6c1e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80",
      link: "/ternos",
      cta: "Ver Ternos Disponíveis",
    },
    {
      id: 2,
      titulo: "Vestidos de Noiva",
      subtitulo: "Alta costura para seu grande dia",
      imagem:
        "https://images.unsplash.com/photo-1546804784-896d0dca3805?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80",
      link: "/vestidos",
      cta: "Explorar Vestidos",
    },
    {
      id: 3,
      titulo: "Vestidos de Debutante",
      subtitulo: "Para momentos especiais",
      imagem:
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80",
      link: "/debutantes",
      cta: "Conhecer Modelos",
    },
  ];

  return (
    <div
      className="vitrine-container"
      style={{
        width: "100%",
        height: "calc(100vh - 90px)",
        position: "relative",
        marginTop: "0",
      }}
    >
      {/* Indicador de navegação - escondido em mobile */}
      {!isMobile && (
        <div
          style={{
            position: "absolute",
            bottom: "80px",
            right: "30px",
            zIndex: 5,
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            padding: "8px 15px",
            borderRadius: "20px",
            color: "white",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <FaChevronLeft size={12} />
          <span>Deslize para navegar</span>
          <FaChevronRight size={12} />
        </div>
      )}

      <Slider {...settings}>
        {colecoes.map((colecao) => (
          <div key={colecao.id}>
            <div
              className="slide-background"
              style={{
                width: "100%",
                height: "calc(100vh - 90px)",
                backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${colecao.imagem})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: isMobile ? "5%" : "10%",
                  transform: "translateY(-50%)",
                  color: "white",
                  textAlign: "left",
                  maxWidth: isMobile ? "90%" : "600px",
                  zIndex: 2,
                }}
              >
                <h2
                  style={{
                    fontSize: isMobile ? "2.2rem" : "3.5rem",
                    fontWeight: 500,
                    fontFamily: '"Cormorant Garamond", serif',
                    marginBottom: isMobile ? "0.5rem" : "1rem",
                    textShadow: "1px 1px 3px rgba(0,0,0,0.5)",
                  }}
                >
                  {colecao.titulo}
                </h2>
                <p
                  style={{
                    fontSize: isMobile ? "1.1rem" : "1.5rem",
                    fontWeight: 300,
                    marginBottom: isMobile ? "1.5rem" : "2rem",
                    textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                  }}
                >
                  {colecao.subtitulo}
                </p>
                <Link
                  to={colecao.link}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    backgroundColor: "#b6a06a",
                    color: "white",
                    padding: isMobile ? "10px 20px" : "12px 30px",
                    textDecoration: "none",
                    fontSize: isMobile ? "1rem" : "1.1rem",
                    fontWeight: 500,
                    borderRadius: "4px",
                    transition: "all 0.3s ease",
                  }}
                >
                  {isMobile && colecao.cta.length > 15
                    ? colecao.cta.split(" ")[0] + "..."
                    : colecao.cta}
                  <FaChevronRight style={{ marginLeft: "8px" }} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default CarrosselVitrine;

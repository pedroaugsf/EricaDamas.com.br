import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const HeroFeature = () => {
  const imagens = ["/SITEEGT3.jpg", "/siteegVF.jpg", "/SITEEGVN.jpg"];
  const [indiceImagem, setIndiceImagem] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndiceImagem((prev) => (prev + 1) % imagens.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [imagens.length]);

  const irParaAnterior = () => {
    setIndiceImagem((prev) => (prev - 1 + imagens.length) % imagens.length);
  };

  const irParaProximo = () => {
    setIndiceImagem((prev) => (prev + 1) % imagens.length);
  };

  return (
    <section
      style={{
        width: "100%",
        backgroundColor: "#f6f1ea",
        padding: "64px 0 48px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px",
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: "48px",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#9c8a6a",
              marginBottom: "14px",
            }}
          >
            Erica Damas
          </div>
          <h1
            style={{
              fontSize: "3rem",
              fontWeight: 500,
              fontFamily: '"Cormorant Garamond", serif',
              color: "#3a2f28",
              marginBottom: "12px",
            }}
          >
            A maior seleção de vestidos de noiva e ternos sob medida do Brasil
          </h1>
          <p
            style={{
              fontSize: "1.1rem",
              color: "#6f645c",
              marginBottom: "24px",
              maxWidth: "520px",
            }}
          >
            Atendimento exclusivo, modelagens impecáveis e elegância atemporal. 
            Vestidos de noiva dos sonhos e ternos refinados para noivos, convidados e ocasiões especiais.
          </p>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <Link
              to="/contato"
              style={{
                backgroundColor: "#b6a06a",
                color: "#fff",
                textDecoration: "none",
                padding: "12px 24px",
                borderRadius: "999px",
                fontSize: "0.95rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Agendar visita
            </Link>
            <Link
              to="/vestidos"
              style={{
                border: "1px solid rgba(0,0,0,0.2)",
                color: "#3a2f28",
                textDecoration: "none",
                padding: "12px 24px",
                borderRadius: "999px",
                fontSize: "0.95rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Vestidos de Noiva
            </Link>
            <Link
              to="/ternos"
              style={{
                border: "1px solid rgba(0,0,0,0.2)",
                color: "#3a2f28",
                textDecoration: "none",
                padding: "12px 24px",
                borderRadius: "999px",
                fontSize: "0.95rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Ternos
            </Link>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "18px",
              marginTop: "32px",
            }}
          >
            {[
              { label: "Anos de tradição", value: "+20" },
              { label: "Clientes atendidos", value: "+5.000" },
              { label: "Avaliação média", value: "4,9★" },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "14px",
                  padding: "16px",
                  boxShadow: "0 16px 30px rgba(0,0,0,0.08)",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "1.5rem",
                    color: "#3a2f28",
                    fontFamily: '"Cormorant Garamond", serif',
                    marginBottom: "6px",
                  }}
                >
                  {item.value}
                </div>
                <div style={{ fontSize: "0.85rem", color: "#6f645c" }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "360px",
              height: "520px",
              borderRadius: "22px",
              backgroundColor: "#ffffff",
              border: "1px solid rgba(0,0,0,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
              boxShadow: "0 30px 60px rgba(0,0,0,0.15)",
              position: "relative",
            }}
          >
            <button
              type="button"
              onClick={irParaAnterior}
              aria-label="Imagem anterior"
              style={{
                position: "absolute",
                left: "-14px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "1px solid rgba(0,0,0,0.12)",
                backgroundColor: "#ffffff",
                color: "#3a2f28",
                cursor: "pointer",
                boxShadow: "0 8px 18px rgba(0,0,0,0.08)",
              }}
            >
              ‹
            </button>
            <img
              src={imagens[indiceImagem]}
              alt="Ternos Erica Damas"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
              loading="lazy"
            />
            <button
              type="button"
              onClick={irParaProximo}
              aria-label="Próxima imagem"
              style={{
                position: "absolute",
                right: "-14px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "1px solid rgba(0,0,0,0.12)",
                backgroundColor: "#ffffff",
                color: "#3a2f28",
                cursor: "pointer",
                boxShadow: "0 8px 18px rgba(0,0,0,0.08)",
              }}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroFeature;

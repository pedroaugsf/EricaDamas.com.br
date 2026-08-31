import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const HeroFeature = () => {
  const imagens = ["/SITEEGT3.jpg", "/siteegVF.jpg", "/SITEEGVN.jpg"];
  const [indiceImagem, setIndiceImagem] = useState(0);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  const touchStartX = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndiceImagem((prev) => (prev + 1) % imagens.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [imagens.length]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const irParaAnterior = () => {
    setIndiceImagem((prev) => (prev - 1 + imagens.length) % imagens.length);
  };

  const irParaProximo = () => {
    setIndiceImagem((prev) => (prev + 1) % imagens.length);
  };

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) delta > 0 ? irParaProximo() : irParaAnterior();
    touchStartX.current = null;
  };

  return (
    <section
      style={{
        width: "100%",
        backgroundColor: "#f6f1ea",
        padding: isMobile ? "0" : "64px 0 48px",
      }}
    >
      {/* ── MOBILE ───────────────────────────────────────── */}
      {isMobile && (
        <div>
          {/* Carrossel full-bleed */}
          <div
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            style={{
              position: "relative",
              width: "100%",
              height: "480px",
              overflow: "hidden",
              backgroundColor: "#e8e0d5",
            }}
          >
            <img
              key={indiceImagem}
              src={imagens[indiceImagem]}
              alt="Erica Damas"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "top center",
                animation: "heroFadeIn 0.6s ease",
              }}
              loading="eager"
            />
            <style>{`@keyframes heroFadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>

            {/* Gradiente inferior */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "160px",
                background:
                  "linear-gradient(to top, rgba(246,241,234,0.95) 0%, transparent 100%)",
                pointerEvents: "none",
              }}
            />

            {/* Setas sobrepostas */}
            {[
              { side: "left", fn: irParaAnterior, label: "Imagem anterior", char: "‹" },
              { side: "right", fn: irParaProximo, label: "Próxima imagem", char: "›" },
            ].map(({ side, fn, label, char }) => (
              <button
                key={side}
                type="button"
                onClick={fn}
                aria-label={label}
                style={{
                  position: "absolute",
                  top: "44%",
                  [side]: "12px",
                  transform: "translateY(-50%)",
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  border: "none",
                  backgroundColor: "rgba(255,255,255,0.75)",
                  backdropFilter: "blur(6px)",
                  color: "#3a2f28",
                  fontSize: "1.4rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
                }}
              >
                {char}
              </button>
            ))}

            {/* Dots */}
            <div
              style={{
                position: "absolute",
                bottom: "16px",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: "7px",
              }}
            >
              {imagens.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndiceImagem(i)}
                  aria-label={`Ir para imagem ${i + 1}`}
                  style={{
                    width: i === indiceImagem ? "22px" : "7px",
                    height: "7px",
                    borderRadius: "999px",
                    backgroundColor: i === indiceImagem ? "#b6a06a" : "rgba(58,47,40,0.3)",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    transition: "width 0.3s ease, background-color 0.3s ease",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Conteúdo de texto abaixo */}
          <div style={{ padding: "28px 20px 40px" }}>
            <div
              style={{
                fontSize: "0.7rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#9c8a6a",
                marginBottom: "10px",
              }}
            >
              Erica Damas
            </div>
            <h1
              style={{
                fontSize: "1.9rem",
                fontWeight: 500,
                fontFamily: '"Cormorant Garamond", serif',
                color: "#3a2f28",
                marginBottom: "10px",
                lineHeight: 1.2,
              }}
            >
              A maior seleção de vestidos de noiva e ternos sob medida do Brasil
            </h1>
            <p
              style={{
                fontSize: "0.95rem",
                color: "#6f645c",
                marginBottom: "22px",
                lineHeight: 1.6,
              }}
            >
              Atendimento exclusivo, modelagens impecáveis e elegância atemporal.
            </p>

            {/* CTA único destacado + secundários menores */}
            <a
              href="https://wa.me/5537999153738?text=Ol%C3%A1%20Erica%20Damas%2C%20gostaria%20de%20agendar%20uma%20visita!"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                textAlign: "center",
                backgroundColor: "#b6a06a",
                color: "#fff",
                textDecoration: "none",
                padding: "14px 24px",
                borderRadius: "999px",
                fontSize: "0.85rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: "10px",
              }}
            >
              Agendar visita
            </a>
            <div style={{ display: "flex", gap: "10px" }}>
              {[
                { to: "/vestidos", label: "Vestidos de Noiva" },
                { to: "/ternos", label: "Ternos" },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  style={{
                    flex: 1,
                    textAlign: "center",
                    border: "1px solid rgba(0,0,0,0.18)",
                    color: "#3a2f28",
                    textDecoration: "none",
                    padding: "11px 8px",
                    borderRadius: "999px",
                    fontSize: "0.8rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Stats */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "10px",
                marginTop: "24px",
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
                    borderRadius: "12px",
                    padding: "14px 8px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.07)",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "1.25rem",
                      color: "#3a2f28",
                      fontFamily: '"Cormorant Garamond", serif',
                      marginBottom: "4px",
                    }}
                  >
                    {item.value}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#6f645c" }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── DESKTOP (inalterado) ──────────────────────────── */}
      {!isMobile && (
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
              Atendimento exclusivo, modelagens impecáveis e elegância atemporal.{" "}
              Vestidos de noiva dos sonhos e ternos refinados para noivos, convidados e ocasiões especiais.
            </p>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <a
                href="https://wa.me/5537999153738?text=Ol%C3%A1%20Erica%20Damas%2C%20gostaria%20de%20agendar%20uma%20visita!"
                target="_blank"
                rel="noopener noreferrer"
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
              </a>
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
          <div style={{ display: "flex", justifyContent: "center" }}>
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
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                loading="eager"
                fetchPriority="high"
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
      )}
    </section>
  );
};

export default HeroFeature;

import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";

const AboutPage = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      setIsTablet(width > 768 && width <= 1024);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);

    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const whatsappNumber = "5537999153738";
  const defaultMessage = "Olá Erica Damas, gostaria de agendar uma visita!";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    defaultMessage
  )}`;

  return (
    <>
      <Helmet>
        <title>Erica Damas| Quem Somos</title>
        <meta
          name="description"
          content="Loja especializada em vestidos de noiva e ternos finos. Referência em criar peças únicas para momentos especiais."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          {`
        /* Reset e base styles */
        * {
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }

        /* Mobile Styles - Otimização UX/UI */
        @media (max-width: 768px) {
          .about-container {
            padding: 0 !important;
            margin: 0 !important;
          }
          
          .mobile-section {
            padding: 2.5rem 1.25rem !important;
            margin: 0 !important;
            max-width: 100% !important;
          }
          
          .mobile-title {
            font-size: 2rem !important;
            text-align: center !important;
            margin-bottom: 1.75rem !important;
            line-height: 1.2 !important;
            font-weight: 500 !important;
            color: #5d4037 !important;
          }
          
          .mobile-paragraph {
            font-size: 1.05rem !important;
            line-height: 1.65 !important;
            margin-bottom: 1.5rem !important;
            text-align: left !important;
            color: #444 !important;
          }
          
          .mobile-features {
            padding-left: 0 !important;
            margin: 2rem 0 !important;
          }
          
          .mobile-feature-item {
            font-size: 1.05rem !important;
            margin-bottom: 1rem !important;
            padding: 0.75rem 0 !important;
            padding-left: 2rem !important;
            background: rgba(182, 160, 106, 0.05) !important;
            border-radius: 8px !important;
            margin-bottom: 0.75rem !important;
            border-left: 3px solid #b6a06a !important;
          }
          
          .mobile-differentials {
            display: flex !important;
            flex-direction: column !important;
            gap: 1rem !important;
            margin-top: 2rem !important;
            padding: 0 0.5rem !important;
          }
          
          .mobile-card {
            padding: 1.75rem 1.5rem !important;
            margin: 0 !important;
            border-radius: 12px !important;
            background: #fff !important;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08) !important;
            border-top: 4px solid #b6a06a !important;
            transform: translateY(0) !important;
            transition: all 0.3s ease !important;
          }
          
          .mobile-card:active {
            transform: translateY(1px) !important;
            box-shadow: 0 2px 10px rgba(0,0,0,0.12) !important;
          }
          
          .mobile-card-title {
            font-size: 1.35rem !important;
            margin-bottom: 0.75rem !important;
            color: #5d4037 !important;
            font-weight: 600 !important;
            text-align: center !important;
          }
          
          .mobile-card-text {
            font-size: 1rem !important;
            line-height: 1.5 !important;
            color: #666 !important;
            text-align: center !important;
          }
          
          .mobile-cta {
            padding: 3.5rem 1.25rem !important;
            text-align: center !important;
            background: #ffffff !important;
            border-top: 1px solid rgba(182, 160, 106, 0.2) !important;
          }
          
          .mobile-cta-title {
            font-size: 2rem !important;
            margin-bottom: 1.25rem !important;
            color: #5d4037 !important;
            font-weight: 500 !important;
          }
          
          .mobile-cta-text {
            font-size: 1.1rem !important;
            margin-bottom: 2.5rem !important;
            line-height: 1.6 !important;
            color: #444 !important;
            max-width: 400px !important;
            margin-left: auto !important;
            margin-right: auto !important;
            margin-bottom: 2.5rem !important;
          }
          
          .mobile-cta-button {
            display: block !important;
            width: 85% !important;
            max-width: 320px !important;
            margin: 0 auto !important;
            padding: 1.2rem 2rem !important;
            font-size: 1.15rem !important;
            text-align: center !important;
            border-radius: 12px !important;
            background-color: #b6a06a !important;
            color: #fff !important;
            text-decoration: none !important;
            font-weight: 600 !important;
            box-shadow: 0 6px 25px rgba(182, 160, 106, 0.3) !important;
            transition: all 0.3s ease !important;
            border: none !important;
            cursor: pointer !important;
          }
          
          .mobile-cta-button:active {
            transform: translateY(2px) !important;
            box-shadow: 0 4px 15px rgba(182, 160, 106, 0.4) !important;
            background-color: #a69660 !important;
          }
          
          /* Floating WhatsApp otimizado */
          .floating-whatsapp-mobile {
            position: fixed !important;
            bottom: 25px !important;
            right: 20px !important;
            background: linear-gradient(135deg, #25D366 0%, #1ea952 100%) !important;
            color: #fff !important;
            width: 65px !important;
            height: 65px !important;
            border-radius: 50% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            text-decoration: none !important;
            font-size: 26px !important;
            box-shadow: 0 6px 25px rgba(37, 211, 102, 0.4) !important;
            z-index: 1000 !important;
            transition: all 0.3s ease !important;
            animation: pulse 2s infinite !important;
          }
          
          .floating-whatsapp-mobile:active {
            transform: scale(0.95) !important;
            box-shadow: 0 4px 15px rgba(37, 211, 102, 0.5) !important;
          }
          
          /* Animação de pulso para o WhatsApp */
          @keyframes pulse {
            0% {
              box-shadow: 0 6px 25px rgba(37, 211, 102, 0.4);
            }
            50% {
              box-shadow: 0 6px 25px rgba(37, 211, 102, 0.6), 0 0 0 10px rgba(37, 211, 102, 0.1);
            }
            100% {
              box-shadow: 0 6px 25px rgba(37, 211, 102, 0.4);
            }
          }
          
          /* Melhor espaçamento entre seções */
          .mobile-section:not(:last-child) {
            border-bottom: 1px solid rgba(182, 160, 106, 0.1) !important;
          }
          
          /* Otimização da tipografia */
          .mobile-section h2::after {
            content: '' !important;
            display: block !important;
            width: 60px !important;
            height: 3px !important;
            background: linear-gradient(90deg, #b6a06a, #d4c08a) !important;
            margin: 1rem auto 0 auto !important;
            border-radius: 2px !important;
          }
        }
        
        /* Tablet Styles - Mantém original */
        @media (min-width: 769px) and (max-width: 1024px) {
          .tablet-section {
            padding: 2.5rem 1.5rem !important;
          }
          
          .tablet-differentials {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 1.5rem !important;
          }
        }
        
        /* Smooth transitions para desktop - Mantém original */
        .feature-item, .differential-card, .cta-button {
          transition: all 0.3s ease;
        }
        
        .cta-button:hover {
          background-color: #9c8a5e !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        
        /* Touch improvements */
        @media (hover: none) {
          .cta-button:hover {
            transform: none;
          }
          
          .cta-button:active {
            background-color: #9c8a5e !important;
            transform: scale(0.98);
          }
        }
      `}
        </style>
      </Helmet>

      <div className="about-container" style={styles.container}>
        {/* História */}
        <section
          className={
            isMobile ? "mobile-section" : isTablet ? "tablet-section" : ""
          }
          style={styles.section}
        >
          <div style={styles.textContent}>
            <h2
              className={isMobile ? "mobile-title" : ""}
              style={styles.sectionTitle}
            >
              Nossa História
            </h2>
            <p
              className={isMobile ? "mobile-paragraph" : ""}
              style={styles.paragraph}
            >
              Desde <strong style={styles.highlight}>2010</strong>, nossa loja
              Erica Damas se destaca no mercado de moda nupcial com seu conceito
              único de <strong>sofisticação contemporânea</strong>.
            </p>
            <p
              className={isMobile ? "mobile-paragraph" : ""}
              style={styles.paragraph}
            >
              Especializados em <strong>vestidos de noiva sob medida</strong> e{" "}
              <strong>ternos finos</strong>, transformamos sonhos em realidade
              através de peças que unem:
            </p>

            <ul
              className={isMobile ? "mobile-features" : ""}
              style={styles.featuresList}
            >
              {[
                "Tecidos premium internacionais",
                "Bordados artesanais exclusivos",
                "Cortes que valorizam a silhueta",
                "Design atemporal com toque moderno",
              ].map((item, index) => (
                <li
                  key={index}
                  className={`feature-item ${
                    isMobile ? "mobile-feature-item" : ""
                  }`}
                  style={styles.featureItem}
                >
                  <span style={styles.bullet}>✧</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Diferenciais */}
        <section
          className={
            isMobile ? "mobile-section" : isTablet ? "tablet-section" : ""
          }
          style={{ ...styles.section, backgroundColor: "#f9f7f4" }}
        >
          <h2
            className={isMobile ? "mobile-title" : ""}
            style={styles.sectionTitle}
          >
            Nosso Diferencial
          </h2>
          <div
            className={`${
              isMobile
                ? "mobile-differentials"
                : isTablet
                ? "tablet-differentials"
                : ""
            }`}
            style={styles.differentials}
          >
            {[
              {
                title: "Multimarcas Exclusivas",
                description:
                  "Seleção das melhores grifes nacionais e internacionais",
              },
              {
                title: "Serviço Completo",
                description: "Aluguel e venda de trajes nupciais e acessórios",
              },
              {
                title: "Atendimento Personalizado",
                description: "Consultoria especializada para cada estilo",
              },
            ].map((item, index) => (
              <div
                key={index}
                className={`differential-card ${isMobile ? "mobile-card" : ""}`}
                style={styles.differentialCard}
              >
                <h3
                  className={isMobile ? "mobile-card-title" : ""}
                  style={styles.differentialTitle}
                >
                  {item.title}
                </h3>
                <p
                  className={isMobile ? "mobile-card-text" : ""}
                  style={styles.differentialText}
                >
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section
          className={isMobile ? "mobile-cta" : ""}
          style={styles.ctaSection}
        >
          <div style={styles.ctaContent}>
            <h2
              className={isMobile ? "mobile-cta-title" : ""}
              style={styles.ctaTitle}
            >
              Agende sua visita
            </h2>
            <p
              className={isMobile ? "mobile-cta-text" : ""}
              style={styles.ctaText}
            >
              Venha conhecer nossa loja e descubra a peça perfeita para seu
              momento especial.
            </p>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`cta-button ${isMobile ? "mobile-cta-button" : ""}`}
              style={styles.ctaButton}
              aria-label="Fale conosco pelo WhatsApp"
            >
              Fale Conosco
            </a>
          </div>
        </section>
      </div>
    </>
  );
};

// Styles atualizados para a seção CTA com fundo branco
const styles = {
  container: {
    maxWidth: "100%",
    fontFamily: '"Cormorant Garamond", serif',
    color: "#333",
    lineHeight: 1.6,
    marginTop: "0",
    overflowX: "hidden",
  },
  section: {
    padding: "3rem 2rem",
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    flexWrap: "wrap",
    gap: "2rem",
    alignItems: "center",
  },
  textContent: {
    flex: 1,
    minWidth: "300px",
  },
  sectionTitle: {
    fontSize: "2.2rem",
    color: "#5d4037",
    fontWeight: "400",
    marginBottom: "2rem",
    position: "relative",
    paddingBottom: "1rem",
  },
  paragraph: {
    fontSize: "1.1rem",
    marginBottom: "1.5rem",
    textAlign: "justify",
  },
  highlight: {
    color: "#b6a06a",
    fontWeight: "600",
  },
  featuresList: {
    listStyle: "none",
    paddingLeft: "1rem",
    margin: "2rem 0",
  },
  featureItem: {
    marginBottom: "1rem",
    position: "relative",
    paddingLeft: "2rem",
    fontSize: "1.1rem",
  },
  bullet: {
    position: "absolute",
    left: 0,
    color: "#b6a06a",
    fontSize: "1.2rem",
    fontWeight: "bold",
  },
  differentials: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "2rem",
    width: "100%",
    marginTop: "2rem",
  },
  differentialCard: {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "12px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
    borderTop: "4px solid #b6a06a",
    transition: "all 0.3s ease",
    cursor: "pointer",
  },
  differentialTitle: {
    color: "#5d4037",
    fontSize: "1.4rem",
    marginBottom: "1rem",
    fontWeight: "600",
  },
  differentialText: {
    fontSize: "1rem",
    lineHeight: "1.6",
    color: "#666",
  },
  ctaSection: {
    backgroundColor: "#ffffff",
    color: "#333",
    padding: "4rem 2rem",
    textAlign: "center",
    borderTop: "1px solid rgba(182, 160, 106, 0.2)",
  },
  ctaContent: {
    maxWidth: "600px",
    margin: "0 auto",
  },
  ctaTitle: {
    fontSize: "2.2rem",
    fontWeight: "400",
    marginBottom: "1rem",
    color: "#5d4037",
  },
  ctaText: {
    fontSize: "1.1rem",
    marginBottom: "2rem",
    color: "#444",
    opacity: 0.9,
    lineHeight: "1.6",
  },
  ctaButton: {
    display: "inline-block",
    backgroundColor: "#b6a06a",
    color: "#fff",
    padding: "1rem 2.5rem",
    fontSize: "1.1rem",
    textDecoration: "none",
    borderRadius: "8px",
    transition: "all 0.3s ease",
    fontWeight: "600",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
    border: "none",
    cursor: "pointer",
  },
};

export default AboutPage;

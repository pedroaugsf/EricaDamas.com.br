import React, { useEffect, useState, useRef } from "react";

const NossosServicos = () => {
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef(null);

  // Detectar tamanho da tela
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();

    let timeoutId = null;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkScreenSize, 100);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Animação de entrada
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("servicos-visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Lista de serviços
  const servicos = [
    {
      id: 1,
      titulo: "Vestidos de Noiva",
      descricao:
        "Coleção exclusiva de vestidos de noiva com designs únicos e acabamento impecável. Cada peça é cuidadosamente selecionada para tornar seu dia especial ainda mais memorável.",
    },
    {
      id: 2,
      titulo: "Ternos sob Medida",
      descricao:
        "Ternos elegantes e sofisticados, confeccionados sob medida para o grande dia. Perfeito caimento e tecidos de alta qualidade para uma apresentação impecável.",
    },
    {
      id: 3,
      titulo: "Vestidos para Debutantes",
      descricao:
        "Vestidos especiais para celebrar os 15 anos com elegância e estilo. Designs modernos e clássicos que realçam a beleza desta fase tão especial.",
    },
    {
      id: 4,
      titulo: "Acessórios Completos",
      descricao:
        "Complementos perfeitos para finalizar seu look: véus, tiaras, gravatas, lenços e muito mais. Cada detalhe pensado para harmonizar com seu traje.",
    },
    {
      id: 5,
      titulo: "Ajustes e Personalizações",
      descricao:
        "Serviço de ajustes e personalizações para garantir o caimento perfeito. Transformamos peças para que se adaptem perfeitamente ao seu corpo e estilo.",
    },
    {
      id: 6,
      titulo: "Consultoria de Estilo",
      descricao:
        "Orientação profissional para escolher o modelo ideal para seu tipo físico e ocasião. Ajudamos você a encontrar a silhueta perfeita que valoriza suas melhores características.",
    },
  ];

  // Adicionando estilos CSS
  useEffect(() => {
    const style = document.createElement("style");
    style.setAttribute("data-servicos-hover", "true");
    style.innerHTML = `
      /* Animações principais */
      .servicos-section {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.8s ease, transform 0.8s ease;
      }
      
      .servicos-visible {
        opacity: 1;
        transform: translateY(0);
      }
      
      /* Container dos serviços com scroll horizontal suave */
      .servicos-scroll-container {
        display: flex;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        scroll-behavior: smooth;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
        margin: 0 -1.5rem;
        padding: 0 1.5rem 2rem;
      }
      
      .servicos-scroll-container::-webkit-scrollbar {
        display: none;
      }
      
      /* Cards de serviço com design moderno */
      .servico-card-mobile {
        flex: 0 0 85%;
        scroll-snap-align: start;
        margin-right: 1.2rem;
        border-radius: 16px;
        padding: 2rem 1.5rem;
        background: white;
        box-shadow: 0 8px 25px rgba(0,0,0,0.08);
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        height: auto;
        min-height: 280px;
        border: 1px solid rgba(182, 160, 106, 0.15);
      }
      
      .servico-card-mobile:last-child {
        margin-right: 0;
      }
      
      .servico-card-mobile::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(to right, #b6a06a, #e8d192);
        border-radius: 8px 8px 0 0;
      }
      
      .servico-decorator {
        width: 40px;
        height: 3px;
        background: linear-gradient(to right, #b6a06a, #e8d192);
        margin: 0 auto 1.5rem;
        border-radius: 2px;
      }
      
      .servico-titulo-mobile {
        font-size: 1.4rem;
        font-weight: 600;
        color: #5d4037;
        margin-bottom: 1rem;
        text-align: center;
        font-family: 'Cormorant Garamond', serif;
        line-height: 1.3;
      }
      
      .servico-descricao-mobile {
        font-size: 0.95rem;
        color: #666;
        line-height: 1.6;
        text-align: center;
        margin-bottom: 0;
        flex-grow: 1;
        display: flex;
        align-items: center;
      }
      
      /* Versão expandida para tablets e desktop */
      @media (min-width: 768px) {
        .servicos-scroll-container {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
          overflow-x: visible;
          margin: 0;
          padding: 0;
        }
        
        .servico-card-mobile {
          flex: none;
          margin-right: 0;
          min-height: 260px;
        }
        
        .scroll-indicators {
          display: none;
        }
      }
      
      @media (min-width: 1024px) {
        .servicos-scroll-container {
          grid-template-columns: repeat(3, 1fr);
        }
        
        .servico-card-mobile {
          min-height: 280px;
        }
      }
      
      /* Melhorias de acessibilidade */
      .servico-card-mobile:focus-within {
        outline: 2px solid #b6a06a;
        box-shadow: 0 0 0 4px rgba(182, 160, 106, 0.2);
      }
    `;
    document.head.appendChild(style);

    return () => {
      const styleElement = document.querySelector("style[data-servicos-hover]");
      if (styleElement) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);

  // Estilos dinâmicos
  const styles = {
    servicosSection: {
      padding: "3.5rem 0",
      backgroundColor: "#faf9f7",
      position: "relative",
    },
    container: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "0 1.5rem",
    },
    sectionTitle: {
      fontSize: "2.3rem",
      fontWeight: "300",
      color: "#5d4037",
      textAlign: "center",
      marginBottom: "0.8rem",
      fontFamily: '"Cormorant Garamond", serif',
      letterSpacing: "0.5px",
    },
    divisor: {
      width: "80px",
      height: "3px",
      background: "linear-gradient(to right, #b6a06a, #e8d192)",
      margin: "0 auto 1rem auto",
      borderRadius: "2px",
    },
    sectionSubtitle: {
      fontSize: "1.1rem",
      color: "#666",
      textAlign: "center",
      maxWidth: "700px",
      margin: "0 auto 2.8rem auto",
      fontFamily: '"Cormorant Garamond", serif',
      fontStyle: "italic",
      lineHeight: "1.6",
    },
  };

  return (
    <section
      style={styles.servicosSection}
      className="servicos-section"
      ref={sectionRef}
      aria-labelledby="servicos-titulo"
    >
      <div style={styles.container}>
        <h2
          id="servicos-titulo"
          style={styles.sectionTitle}
          className="section-title"
        >
          Nossos Serviços
        </h2>
        <div style={styles.divisor}></div>
        <p style={styles.sectionSubtitle} className="section-subtitle">
          Oferecemos uma experiência completa para tornar seu momento especial
          verdadeiramente inesquecível
        </p>

        {/* Container de scroll horizontal para mobile */}
        <div className="servicos-scroll-container">
          {servicos.map((servico) => (
            <div
              key={servico.id}
              className="servico-card-mobile"
              role="article"
              aria-label={servico.titulo}
            >
              <div className="servico-decorator"></div>
              <h3 className="servico-titulo-mobile">{servico.titulo}</h3>
              <p className="servico-descricao-mobile">{servico.descricao}</p>
            </div>
          ))}
        </div>

        {/* Indicadores de scroll (apenas para mobile) */}
        {isMobile && (
          <div className="scroll-indicators">
            {servicos.map((servico, index) => (
              <div
                key={servico.id}
                className={`scroll-indicator ${index === 0 ? "active" : ""}`}
                aria-hidden="true"
              ></div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default NossosServicos;

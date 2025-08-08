import React, { useEffect } from "react";

const NossosServicos = () => {
  // Lista de serviços oferecidos
  const servicos = [
    {
      id: 1,
      titulo: "Vestidos de Noiva",
      descricao:
        "Coleção exclusiva de vestidos de noiva com designs únicos e acabamento impecável.",
    },
    {
      id: 2,
      titulo: "Ternos sob Medida",
      descricao:
        "Ternos elegantes e sofisticados, confeccionados sob medida para o grande dia.",
    },
    {
      id: 3,
      titulo: "Vestidos para Debutantes",
      descricao:
        "Vestidos especiais para celebrar os 15 anos com elegância e estilo.",
    },
    {
      id: 4,
      titulo: "Acessórios",
      descricao:
        "Complementos perfeitos para finalizar seu look: véus, tiaras, gravatas e muito mais.",
    },
    {
      id: 5,
      titulo: "Ajustes e Personalizações",
      descricao:
        "Serviço de ajustes e personalizações para garantir o caimento perfeito.",
    },
    {
      id: 6,
      titulo: "Consultoria de Estilo",
      descricao:
        "Orientação profissional para escolher o modelo ideal para seu tipo físico e ocasião.",
    },
  ];

  // Adicionando estilos para hover
  useEffect(() => {
    const style = document.createElement("style");
    style.setAttribute("data-servicos-hover", "true");
    style.innerHTML = `
    .servico-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.08);
    }
    .servico-card:hover .servico-titulo {
      color: #b6a06a;
    }
  `;
    document.head.appendChild(style);

    // Cleanup function
    return () => {
      const styleElement = document.querySelector("style[data-servicos-hover]");
      if (styleElement) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);

  // Dividir os serviços em duas linhas
  const primeiraLinha = servicos.slice(0, 3);
  const segundaLinha = servicos.slice(3);

  return (
    <section style={styles.servicosSection}>
      <div style={styles.container}>
        <h2 style={styles.sectionTitle}>Nossos Serviços</h2>
        <div style={styles.divisor}></div>
        <p style={styles.sectionSubtitle}>
          Oferecemos uma experiência completa para tornar seu momento especial
          inesquecível
        </p>

        {/* Primeira linha de serviços */}
        <div style={styles.servicosGrid}>
          {primeiraLinha.map((servico) => (
            <div
              key={servico.id}
              style={styles.servicoCard}
              className="servico-card"
            >
              <div style={styles.servicoDecorator}></div>
              <h3 style={styles.servicoTitulo} className="servico-titulo">
                {servico.titulo}
              </h3>
              <p style={styles.servicoDescricao}>{servico.descricao}</p>
            </div>
          ))}
        </div>

        {/* Espaço entre as linhas */}
        <div style={styles.lineSpacer}></div>

        {/* Segunda linha de serviços */}
        <div style={styles.servicosGrid}>
          {segundaLinha.map((servico) => (
            <div
              key={servico.id}
              style={styles.servicoCard}
              className="servico-card"
            >
              <div style={styles.servicoDecorator}></div>
              <h3 style={styles.servicoTitulo} className="servico-titulo">
                {servico.titulo}
              </h3>
              <p style={styles.servicoDescricao}>{servico.descricao}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const styles = {
  servicosSection: {
    padding: "4rem 0",
    backgroundColor: "#f9f9f9",
    borderTop: "1px solid rgba(0,0,0,0.05)",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 2rem",
  },
  sectionTitle: {
    fontSize: "2.2rem",
    fontWeight: "300",
    color: "#5d4037",
    textAlign: "center",
    marginBottom: "0.8rem",
    fontFamily: '"Cormorant Garamond", serif',
  },
  divisor: {
    width: "80px",
    height: "2px",
    backgroundColor: "#b6a06a",
    margin: "0 auto 1.2rem auto",
  },
  sectionSubtitle: {
    fontSize: "1.1rem",
    color: "#666",
    textAlign: "center",
    maxWidth: "700px",
    margin: "0 auto 2.5rem auto",
    fontFamily: '"Cormorant Garamond", serif',
    fontStyle: "italic",
  },
  servicosGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "2rem", // Aumentado o espaçamento entre os cards na mesma linha
  },
  lineSpacer: {
    height: "5rem", // Aumentado o espaço entre as duas linhas de serviços
  },
  servicoCard: {
    backgroundColor: "#fff",
    padding: "1.8rem", // Aumentado o padding interno dos cards
    borderRadius: "4px",
    boxShadow: "0 3px 10px rgba(0,0,0,0.04)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    textAlign: "left",
    position: "relative",
    overflow: "hidden",
    height: "100%",
  },
  servicoDecorator: {
    width: "30px",
    height: "3px",
    backgroundColor: "#b6a06a",
    marginBottom: "1rem",
  },
  servicoTitulo: {
    fontSize: "1.3rem",
    color: "#5d4037",
    marginBottom: "1rem", // Aumentado o espaço entre o título e a descrição
    fontFamily: '"Cormorant Garamond", serif',
    fontWeight: "500",
    transition: "color 0.3s ease",
  },
  servicoDescricao: {
    fontSize: "0.95rem",
    color: "#666",
    lineHeight: "1.6", // Aumentado o espaçamento entre linhas do texto
  },
};

export default NossosServicos;

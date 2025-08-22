import React from "react";
import { Helmet } from "react-helmet";

const AboutPage = () => {
  const whatsappNumber = "5537999153738"; // Número formatado para link do WhatsApp
  const defaultMessage = "Olá Erica Damas, gostaria de agendar uma visita!";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    defaultMessage
  )}`;

  return (
    <div style={styles.container}>
      <Helmet>
        <title>Erica Damas - Ateliê de Noivas | Quem Somos</title>
        <meta
          name="description"
          content="Ateliê especializado em vestidos de noiva e ternos finos. Tradição desde 2010 em criar peças únicas para momentos especiais."
        />
      </Helmet>

      {/* História */}
      <section style={styles.section}>
        <div style={styles.textContent}>
          <h2 style={styles.sectionTitle}>Nossa História</h2>
          <p style={styles.paragraph}>
            Desde <strong style={styles.highlight}>2010</strong>, o Ateliê Erica
            Damas se destaca no mercado de moda nupcial com seu conceito único
            de <strong>sofisticação contemporânea</strong>.
          </p>
          <p style={styles.paragraph}>
            Especializados em <strong>vestidos de noiva sob medida</strong> e{" "}
            <strong>ternos finos</strong>, transformamos sonhos em realidade
            através de peças que unem:
          </p>

          <ul style={styles.featuresList}>
            {[
              "Tecidos premium internacionais",
              "Bordados artesanais exclusivos",
              "Cortes que valorizam a silhueta",
              "Design atemporal com toque moderno",
            ].map((item, index) => (
              <li key={index} style={styles.featureItem}>
                <span style={styles.bullet}>✧</span> {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Diferenciais */}
      <section style={{ ...styles.section, backgroundColor: "#f9f7f4" }}>
        <h2 style={styles.sectionTitle}>Nosso Diferencial</h2>
        <div style={styles.differentials}>
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
            <div key={index} style={styles.differentialCard}>
              <h3 style={styles.differentialTitle}>{item.title}</h3>
              <p style={styles.differentialText}>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaContent}>
          <h2 style={styles.ctaTitle}>Agende sua visita</h2>
          <p style={styles.ctaText}>
            Venha conhecer nosso ateliê e descubra a peça perfeita para seu
            momento especial.
          </p>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.ctaButton}
          >
            Fale Conosco
          </a>
        </div>
      </section>
    </div>
  );
};

// Estilos premium
const styles = {
  container: {
    maxWidth: "100%",
    fontFamily: '"Cormorant Garamond", serif',
    color: "#333",
    lineHeight: 1.6,
    marginTop: "0",
  },
  hero: {
    background: 'linear-gradient(rgba(0, 0, 0, 0.5), url("/hero-about.jpg")',
    backgroundSize: "cover",
    backgroundPosition: "center",
    height: "50vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    color: "#fff",
    marginTop: "0",
    marginBottom: "0", // Adicione esta linha
  },
  section: {
    padding: "1rem 2rem 3rem", // Mude de "3rem 2rem" para "1rem 2rem 3rem"
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    flexWrap: "wrap",
    gap: "2rem",
    alignItems: "center",
  },
  heroContent: {
    maxWidth: "800px",
    padding: "0 2rem",
  },
  heroTitle: {
    fontSize: "4rem",
    fontWeight: "300",
    letterSpacing: "5px",
    marginBottom: "1rem",
    textTransform: "uppercase",
  },
  heroSubtitle: {
    fontSize: "1.5rem",
    fontStyle: "italic",
    letterSpacing: "2px",
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
    ":after": {
      content: '""',
      position: "absolute",
      bottom: 0,
      left: 0,
      width: "80px",
      height: "2px",
      backgroundColor: "#b6a06a",
    },
  },
  paragraph: {
    fontSize: "1.1rem",
    marginBottom: "1.5rem",
  },
  highlight: {
    color: "#b6a06a",
    fontWeight: "500",
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
    fontSize: "1.5rem",
  },
  imageContainer: {
    flex: 1,
    minWidth: "300px",
  },
  aboutImage: {
    width: "100%",
    borderRadius: "8px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
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
    borderRadius: "8px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
    borderTop: "3px solid #b6a06a",
  },
  differentialTitle: {
    color: "#5d4037",
    fontSize: "1.4rem",
    marginBottom: "1rem",
  },
  differentialText: {
    fontSize: "1rem",
  },
  ctaSection: {
    backgroundColor: "#f9f7f4",
    color: "#5d4037",
    padding: "4rem 2rem",
    textAlign: "center",
    borderTop: "1px solid #e8e1d5",
    borderBottom: "1px solid #e8e1d5",
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
    color: "#5d4037",
    opacity: 0.9,
  },
  ctaButton: {
    display: "inline-block",
    backgroundColor: "#b6a06a",
    color: "#fff",
    padding: "1rem 2.5rem",
    fontSize: "1.1rem",
    textDecoration: "none",
    borderRadius: "4px",
    transition: "all 0.3s ease",
    ":hover": {
      backgroundColor: "#9c8a5e",
      transform: "translateY(-2px)",
    },
  },
};

export default AboutPage;

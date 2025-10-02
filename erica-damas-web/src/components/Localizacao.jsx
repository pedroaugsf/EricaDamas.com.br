import React, { useState, useEffect } from "react";
import { FaMapMarkerAlt, FaClock, FaPhone } from "react-icons/fa";

const Localizacao = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const contato = {
    endereco: {
      rua: "Av. Amazonas, 275",
      bairro: "São José",
      cidade: "Pará de Minas",
      estado: "MG",
      cep: "35660-124",
    },
    telefone: "(37) 99915-3738",
    horarios: {
      semana: "Segunda a Sexta: 8:30 às 18",
      sabado: "Sábado: 08:30 às 12",
      domingo: "Domingo: Fechado",
    },
  };

  const handlePhoneClick = () => {
    window.open(`tel:${contato.telefone}`, "_self");
  };

  const handleMapClick = () => {
    const address = `${contato.endereco.rua}, ${contato.endereco.bairro}, ${contato.endereco.cidade}, ${contato.endereco.estado}`;
    window.open(
      `https://maps.google.com/?q=${encodeURIComponent(address)}`,
      "_blank"
    );
  };

  // Renderização Mobile
  if (isMobile) {
    return (
      <section style={mobileStyles.container}>
        {/* Header */}
        <div style={mobileStyles.header}>
          <h2 style={mobileStyles.title}>Localização</h2>
          <div style={mobileStyles.divider}></div>
        </div>

        {/* Cards Container */}
        <div style={mobileStyles.cardsContainer}>
          {/* Endereço Card */}
          <div style={mobileStyles.card} onClick={handleMapClick}>
            <div style={mobileStyles.iconContainer}>
              <FaMapMarkerAlt size={18} style={mobileStyles.icon} />
            </div>
            <div style={mobileStyles.cardContent}>
              <h3 style={mobileStyles.cardTitle}>Endereço</h3>
              <p style={mobileStyles.cardText}>
                {contato.endereco.rua}
                <br />
                {contato.endereco.bairro}
                <br />
                {contato.endereco.cidade}/{contato.endereco.estado}
              </p>
              <span style={mobileStyles.actionText}>
                Toque para abrir no mapa
              </span>
            </div>
          </div>

          {/* Telefone Card */}
          <div style={mobileStyles.card} onClick={handlePhoneClick}>
            <div style={mobileStyles.iconContainer}>
              <FaPhone size={18} style={mobileStyles.icon} />
            </div>
            <div style={mobileStyles.cardContent}>
              <h3 style={mobileStyles.cardTitle}>Telefone</h3>
              <p style={mobileStyles.cardText}>{contato.telefone}</p>
              <span style={mobileStyles.actionText}>Toque para ligar</span>
            </div>
          </div>

          {/* Horários Card */}
          <div style={mobileStyles.card}>
            <div style={mobileStyles.iconContainer}>
              <FaClock size={18} style={mobileStyles.icon} />
            </div>
            <div style={mobileStyles.cardContent}>
              <h3 style={mobileStyles.cardTitle}>Funcionamento</h3>
              <div style={mobileStyles.scheduleContainer}>
                <p style={mobileStyles.scheduleItem}>
                  Seg - Sex: <span>08:30h às 18h</span>
                </p>
                <p style={mobileStyles.scheduleItem}>
                  Sábado: <span>08:30h às 12h</span>
                </p>
                <p style={mobileStyles.scheduleItem}>
                  Domingo: <span>Fechado</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mapa Compacto */}
        <div style={mobileStyles.mapSection}>
          <div style={mobileStyles.mapContainer} onClick={handleMapClick}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3750.6574336174996!2d-44.05740908508547!3d-19.941169986594684!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xa6bfd2f9a9c877%3A0x8f7d0e6a4e55a30b!2sAv.%20Amazonas%2C%20275%20-%20S%C3%A3o%20Jos%C3%A9%2C%20Par%C3%A1%20de%20Minas%20-%20MG!5e0!3m2!1spt-BR!2sbr!4v1628176894953!5m2!1spt-BR!2sbr"
              width="100%"
              height="100%"
              style={mobileStyles.map}
              allowFullScreen=""
              loading="lazy"
              title="Localização Erica Damas"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div style={mobileStyles.mapOverlay}>
              <span style={mobileStyles.mapOverlayText}>
                Toque para abrir no Google Maps
              </span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Renderização Desktop (layout original)
  return (
    <section style={desktopStyles.container}>
      <div style={desktopStyles.titleContainer}>
        <h2 style={desktopStyles.sectionTitle}>Localização</h2>
        <div style={desktopStyles.divider}></div>
      </div>

      <div style={desktopStyles.contentWrapper}>
        {/* Informações básicas */}
        <div style={desktopStyles.infoContainer}>
          <div style={desktopStyles.infoContent}>
            <h3 style={desktopStyles.infoTitle}>Erica Damas</h3>

            <div style={desktopStyles.infoGroup}>
              <div style={desktopStyles.infoItem}>
                <div style={desktopStyles.iconWrapper}>
                  <FaMapMarkerAlt size={20} style={desktopStyles.icon} />
                </div>
                <div>
                  <h4 style={desktopStyles.infoItemTitle}>Endereço</h4>
                  <p style={desktopStyles.infoText}>
                    {contato.endereco.rua}
                    <br />
                    {contato.endereco.bairro}, {contato.endereco.cidade}/
                    {contato.endereco.estado}
                    <br />
                    CEP: {contato.endereco.cep}
                  </p>
                </div>
              </div>

              <div style={desktopStyles.infoItem}>
                <div style={desktopStyles.iconWrapper}>
                  <FaClock size={20} style={desktopStyles.icon} />
                </div>
                <div>
                  <h4 style={desktopStyles.infoItemTitle}>
                    Horário de Funcionamento
                  </h4>
                  <p style={desktopStyles.infoText}>
                    {contato.horarios.semana}
                    <br />
                    {contato.horarios.sabado}
                    <br />
                    {contato.horarios.domingo}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mapa */}
        <div style={desktopStyles.mapContainer}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3750.6574336174996!2d-44.05740908508547!3d-19.941169986594684!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xa6bfd2f9a9c877%3A0x8f7d0e6a4e55a30b!2sAv.%20Amazonas%2C%20275%20-%20S%C3%A3o%20Jos%C3%A9%2C%20Par%C3%A1%20de%20Minas%20-%20MG!5e0!3m2!1spt-BR!2sbr!4v1628176894953!5m2!1spt-BR!2sbr"
            width="100%"
            height="100%"
            style={desktopStyles.map}
            allowFullScreen=""
            loading="lazy"
            title="Localização Erica Damas"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
};

// Estilos Mobile (novos)
const mobileStyles = {
  container: {
    backgroundColor: "#fafafa",
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    paddingBottom: "2rem",
  },

  header: {
    textAlign: "center",
    padding: "2rem 1.5rem 1.5rem",
  },

  title: {
    fontSize: "1.75rem",
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: "0.75rem",
    letterSpacing: "-0.02em",
  },

  divider: {
    width: "40px",
    height: "2px",
    backgroundColor: "#2c2c2c",
    margin: "0 auto",
    borderRadius: "1px",
  },

  cardsContainer: {
    padding: "0 1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    marginBottom: "1.5rem",
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "1.25rem",
    display: "flex",
    alignItems: "flex-start",
    gap: "1rem",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
    border: "1px solid #f0f0f0",
    cursor: "pointer",
    transition: "all 0.2s ease",
    position: "relative",
  },

  iconContainer: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    backgroundColor: "#f8f8f8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  icon: {
    color: "#4a4a4a",
  },

  cardContent: {
    flex: 1,
    minWidth: 0,
  },

  cardTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: "0.5rem",
    margin: 0,
  },

  cardText: {
    fontSize: "0.9rem",
    color: "#666",
    lineHeight: "1.4",
    margin: "0 0 0.5rem 0",
  },

  actionText: {
    fontSize: "0.75rem",
    color: "#999",
    fontWeight: "500",
  },

  scheduleContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },

  scheduleItem: {
    fontSize: "0.9rem",
    color: "#666",
    margin: 0,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  mapSection: {
    padding: "0 1rem",
  },

  mapContainer: {
    height: "200px",
    borderRadius: "12px",
    overflow: "hidden",
    position: "relative",
    cursor: "pointer",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },

  map: {
    border: 0,
    width: "100%",
    height: "100%",
    filter: "grayscale(20%)",
  },

  mapOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
    padding: "2rem 1rem 0.75rem",
    pointerEvents: "none",
  },

  mapOverlayText: {
    color: "#ffffff",
    fontSize: "0.8rem",
    fontWeight: "500",
    textAlign: "center",
    display: "block",
  },
};

// Estilos Desktop (originais)
const desktopStyles = {
  container: {
    padding: "0",
    backgroundColor: "#fff",
    fontFamily: '"Cormorant Garamond", serif',
  },
  titleContainer: {
    textAlign: "center",
    padding: "4rem 2rem 2rem",
    maxWidth: "800px",
    margin: "0 auto",
  },
  sectionTitle: {
    fontSize: "2.5rem",
    fontWeight: "300",
    color: "#5d4037",
    letterSpacing: "2px",
    marginBottom: "1rem",
    textTransform: "uppercase",
  },
  divider: {
    width: "80px",
    height: "2px",
    backgroundColor: "#b6a06a",
    margin: "0 auto 1.5rem",
  },
  contentWrapper: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  },
  infoContainer: {
    backgroundColor: "#3a2a24",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "3rem 2rem",
    minHeight: "400px",
  },
  infoContent: {
    maxWidth: "400px",
    margin: "0 auto",
    width: "100%",
  },
  infoTitle: {
    fontSize: "2.2rem",
    fontWeight: "300",
    marginBottom: "2rem",
    fontFamily: '"Cormorant Garamond", serif',
    color: "#fff",
    position: "relative",
    paddingBottom: "0.5rem",
  },
  infoGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  infoItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "1rem",
  },
  iconWrapper: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "rgba(182, 160, 106, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  icon: {
    color: "#b6a06a",
  },
  infoItemTitle: {
    fontSize: "1.2rem",
    marginBottom: "0.5rem",
    fontWeight: "500",
    color: "#fff",
  },
  infoText: {
    fontSize: "1rem",
    lineHeight: "1.6",
    opacity: 0.9,
    margin: 0,
  },
  mapContainer: {
    height: "400px",
    position: "relative",
  },
  map: {
    border: 0,
    width: "100%",
    height: "100%",
  },
};

export default Localizacao;

import React from "react";
import { FaMapMarkerAlt, FaClock } from "react-icons/fa";

const Localizacao = () => {
  // Dados de contato
  const contato = {
    endereco: {
      rua: "Av. Frei Henrique Soares, 292",
      bairro: "Inconfidentes",
      cidade: "Contagem",
      estado: "MG",
      cep: "32260-340",
    },
    telefone: "(31) 99453-0011",
    horarios: {
      semana: "Segunda a Sexta: 10h às 19h",
      sabado: "Sábado: 10h às 16h",
      domingo: "Domingo: Fechado",
    },
  };

  return (
    <section style={styles.container}>
      <div style={styles.titleContainer}>
        <h2 style={styles.sectionTitle}>Localização</h2>
        <div style={styles.divider}></div>
      </div>

      <div style={styles.contentWrapper}>
        {/* Informações básicas */}
        <div style={styles.infoContainer}>
          <div style={styles.infoContent}>
            <h3 style={styles.infoTitle}>Nosso Ateliê</h3>

            <div style={styles.infoGroup}>
              <div style={styles.infoItem}>
                <div style={styles.iconWrapper}>
                  <FaMapMarkerAlt size={20} style={styles.icon} />
                </div>
                <div>
                  <h4 style={styles.infoItemTitle}>Endereço</h4>
                  <p style={styles.infoText}>
                    {contato.endereco.rua}
                    <br />
                    {contato.endereco.bairro}, {contato.endereco.cidade}/
                    {contato.endereco.estado}
                    <br />
                    CEP: {contato.endereco.cep}
                  </p>
                </div>
              </div>

              <div style={styles.infoItem}>
                <div style={styles.iconWrapper}>
                  <FaClock size={20} style={styles.icon} />
                </div>
                <div>
                  <h4 style={styles.infoItemTitle}>Horário de Funcionamento</h4>
                  <p style={styles.infoText}>
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
        <div style={styles.mapContainer}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3750.6574336174996!2d-44.05740908508547!3d-19.941169986594684!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xa6bfd2f9a9c877%3A0x8f7d0e6a4e55a30b!2sAv.%20Frei%20Henrique%20Soares%2C%20292%20-%20Inconfidentes%2C%20Contagem%20-%20MG!5e0!3m2!1spt-BR!2sbr!4v1628176894953!5m2!1spt-BR!2sbr"
            width="100%"
            height="100%"
            style={styles.map}
            allowFullScreen=""
            loading="lazy"
            title="Localização Erica Damas Ateliê"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </section>
  );
};

const styles = {
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
    backgroundColor: "#3a2a24", // Cor alterada: tom mais escuro e sofisticado de marrom
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
    backgroundColor: "rgba(182, 160, 106, 0.2)", // Mantido o dourado com transparência
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  icon: {
    color: "#b6a06a", // Mantido o dourado para os ícones
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

import React from "react";
import { FaWhatsapp, FaMapMarkerAlt, FaInstagram } from "react-icons/fa";

const Footer = () => {
  const contacts = {
    whatsapp: "https://wa.me/5531994530011",
    maps: "https://maps.google.com?q=Av.+Frei+Henrique+Soares,+292+-+Inconfidentes,+Contagem/MG",
    instagram: "https://instagram.com/ericadamas",
  };

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        {/* Logo */}
        <div style={styles.brandContainer}>
          <img
            src="/Erica_Damas_logo-removebg-preview.png"
            alt="Erica Damas - Noivas e Ternos"
            style={styles.logoImage}
          />
        </div>

        {/* Contatos */}
        <div style={styles.contactsGrid}>
          <a
            href={contacts.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.contactLink}
          >
            <FaWhatsapp style={styles.icon} />
            <span>(31) 99453-0011</span>
          </a>

          <a
            href={contacts.instagram}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.contactLink}
          >
            <FaInstagram style={styles.icon} />
            <span>@ericadamas</span>
          </a>

          <a
            href={contacts.maps}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.contactLink}
          >
            <FaMapMarkerAlt style={styles.icon} />
            <span style={styles.addressText}>
              Av. Frei Henrique Soares, 292, Contagem/MG
            </span>
          </a>
        </div>

        {/* Direitos autorais */}
        <div style={styles.copyright}>
          <p>
            © {new Date().getFullYear()} Erica Damas. Todos os direitos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: "#000",
    color: "#fff",
    padding: "2rem 2rem 1rem",
    borderTop: "1px solid rgba(218, 165, 32, 0.1)",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  brandContainer: {
    textAlign: "center",
    marginBottom: "0.5rem",
  },
  logoImage: {
    height: "50px",
    width: "auto",
  },
  contactsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", // Layout mais responsivo
    gap: "1.5rem",
    margin: "0 auto",
    width: "100%",
    maxWidth: "800px",
  },
  contactLink: {
    color: "#fff",
    textDecoration: "none",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.5rem",
    transition: "all 0.3s ease",
    textAlign: "center",
  },
  icon: {
    color: "#b6a06a",
    fontSize: "1.2rem",
  },
  addressText: {
    whiteSpace: "nowrap", // Impede a quebra de linha
  },
  copyright: {
    textAlign: "center",
    marginTop: "1.5rem",
    paddingTop: "1rem",
    borderTop: "1px solid rgba(218, 165, 32, 0.1)",
    color: "#888",
    fontSize: "0.8rem",
  },
};

export default Footer;

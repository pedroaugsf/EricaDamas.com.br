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
        <div style={styles.topSection}>
          {/* Logo */}
          <div style={styles.brandContainer}>
            <img
              src="/Erica_Damas_logo-removebg-preview.png"
              alt="Erica Damas - Noivas e Ternos"
              style={styles.logoImage}
            />
          </div>

          {/* Contatos */}
          <div style={styles.contactsContainer}>
            <a
              href={contacts.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.contactLink}
            >
              <FaWhatsapp style={styles.icon} />
              <span>(31) 999153738</span>
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
        </div>

        {/* Direitos autorais */}
        <div style={styles.copyright}>
          <p style={styles.copyrightText}>
            © {new Date().getFullYear()} Erica Damas. Todos os direitos
            reservados.
            <span style={styles.divider}>|</span>
            <span style={styles.credits}>
              Desenvolvido por{" "}
              <a
                href="https://instagram.com/pedroeg_"
                target="_blank"
                rel="noopener noreferrer"
                style={styles.creditLink}
              >
                @pedroeg_
              </a>
            </span>
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
    padding: "1.5rem 2rem 1rem",
    borderTop: "1px solid rgba(218, 165, 32, 0.1)",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  topSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "1rem",
  },
  brandContainer: {
    flex: "0 0 auto",
  },
  logoImage: {
    height: "40px",
    width: "auto",
  },
  contactsContainer: {
    display: "flex",
    gap: "2rem",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
  },
  contactLink: {
    color: "#fff",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    transition: "all 0.3s ease",
    fontSize: "0.9rem",
  },
  icon: {
    color: "#b6a06a",
    fontSize: "1rem",
  },
  addressText: {
    whiteSpace: "nowrap",
  },
  copyright: {
    textAlign: "center",
    marginTop: "0.75rem",
    paddingTop: "0.75rem",
    borderTop: "1px solid rgba(218, 165, 32, 0.1)",
    color: "#888",
    fontSize: "0.8rem",
  },
  copyrightText: {
    margin: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "0.5rem",
  },
  divider: {
    color: "#555",
    margin: "0 0.25rem",
  },
  credits: {
    color: "#777",
  },
  creditLink: {
    color: "#b6a06a",
    textDecoration: "none",
    transition: "color 0.2s ease",
    fontWeight: "500",
  },
};

export default Footer;

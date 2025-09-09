import React, { useState, useEffect } from "react";
import { FaWhatsapp, FaMapMarkerAlt, FaInstagram, FaPhone } from "react-icons/fa";

const Footer = () => {
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const checkMobile = () => {
    setIsMobile(window.innerWidth <= 768);
  };
  
  checkMobile();
  window.addEventListener("resize", checkMobile);
  
  return () => window.removeEventListener("resize", checkMobile);
}, []);

const contacts = {
  whatsapp: "https://wa.me/5537999153738",
  phone: "tel:+5537999153738",
  maps: "https://maps.google.com?q=Av.+Amazonas,+275+-+Sao+Jose,+Para+de+Minas/MG",
  instagram: "https://instagram.com/ericadamas_noivas",
};

const handleContactClick = (type) => {
  if (isMobile) {
    switch (type) {
      case 'whatsapp':
        window.open(contacts.whatsapp, '_blank');
        break;
      case 'phone':
        window.open(contacts.phone);
        break;
      case 'maps':
        window.open(contacts.maps, '_blank');
        break;
      case 'instagram':
        window.open(contacts.instagram, '_blank');
        break;
      default:
        break;
    }
  }
};

if (isMobile) {
  return (
    <>
      <style>
        {`
          .mobile-footer-container {
            background: #000000;
            color: white;
            font-family: 'Cormorant Garamond', serif;
            padding: 1.5rem 1rem 1rem;
          }
          
          .mobile-contacts-row {
            display: flex;
            justify-content: space-around;
            align-items: center;
            margin-bottom: 1.5rem;
            padding: 0 0.5rem;
          }
          
          .mobile-contact-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
            transition: all 0.3s ease;
            padding: 0.8rem 0.5rem;
            border-radius: 8px;
            min-width: 70px;
          }
          
          .mobile-contact-item:active {
            transform: scale(0.95);
            background: rgba(182, 160, 106, 0.1);
          }
          
          .mobile-contact-icon {
            color: #b6a06a;
            font-size: 1.5rem;
            margin-bottom: 0.4rem;
            transition: all 0.3s ease;
          }
          
          .mobile-contact-text {
            font-size: 0.75rem;
            margin: 0;
            opacity: 0.8;
            text-align: center;
            line-height: 1.2;
          }
          
          .mobile-copyright {
            border-top: 1px solid rgba(182, 160, 106, 0.2);
            padding: 1rem 0 0;
            text-align: center;
          }
          
          .mobile-copyright-text {
            font-size: 0.7rem;
            margin: 0;
            opacity: 0.7;
            line-height: 1.3;
            color: #999;
          }
          
          .mobile-credit-link {
            color: #b6a06a;
            text-decoration: none;
            font-weight: 500;
          }
          
          .mobile-divider {
            margin: 0 0.5rem;
            opacity: 0.5;
          }
          
          /* Touch improvements */
          @media (hover: none) and (pointer: coarse) {
            .mobile-contact-item {
              -webkit-tap-highlight-color: transparent;
            }
          }
        `}
      </style>

      <footer className="mobile-footer-container">
        {/* Contatos em Linha */}
        <div className="mobile-contacts-row">
          <div 
            className="mobile-contact-item"
            onClick={() => handleContactClick('whatsapp')}
          >
            <FaWhatsapp className="mobile-contact-icon" />
            <span className="mobile-contact-text">WhatsApp</span>
          </div>

          <div 
            className="mobile-contact-item"
            onClick={() => handleContactClick('phone')}
          >
            <FaPhone className="mobile-contact-icon" />
            <span className="mobile-contact-text">Ligar</span>
          </div>

          <div 
            className="mobile-contact-item"
            onClick={() => handleContactClick('instagram')}
          >
            <FaInstagram className="mobile-contact-icon" />
            <span className="mobile-contact-text">Instagram</span>
          </div>

          <div 
            className="mobile-contact-item"
            onClick={() => handleContactClick('maps')}
          >
            <FaMapMarkerAlt className="mobile-contact-icon" />
            <span className="mobile-contact-text">Localização</span>
          </div>
        </div>

        {/* Copyright Minimalista */}
        <div className="mobile-copyright">
          <p className="mobile-copyright-text">
            © {new Date().getFullYear()} Erica Damas
            <span className="mobile-divider">|</span>
            <a
              href="https://instagram.com/pedroeg_"
              target="_blank"
              rel="noopener noreferrer"
              className="mobile-credit-link"
            >
              Desenvolvido por @pedroeg_
            </a>
          </p>
        </div>
      </footer>
    </>
  );
}

// Desktop version (unchanged)
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
            <span>(37) 99915-3738</span>
          </a>

          <a
            href={contacts.instagram}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.contactLink}
          >
            <FaInstagram style={styles.icon} />
            <span>@ericadamas_noivas</span>
          </a>

          <a
            href={contacts.maps}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.contactLink}
          >
            <FaMapMarkerAlt style={styles.icon} />
            <span style={styles.addressText}>
              Av. Amazonas, 275, São José, Pará de Minas/MG
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

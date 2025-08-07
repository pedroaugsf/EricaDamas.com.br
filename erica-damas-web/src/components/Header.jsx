import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Detecta o scroll para mudar a aparência do header
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  // Verifica se o link está ativo
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Links de navegação
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Sobre", path: "/sobre" },
    { name: "Acervo", path: "/acervo" },
    { name: "Contato", path: "/contato" },
  ];

  return (
    <header
      style={{
        ...styles.header,
        height: scrolled ? "70px" : "90px",
        backgroundColor: scrolled ? "rgba(0, 0, 0, 0.95)" : "#000000",
        boxShadow: scrolled ? "0 2px 10px rgba(0, 0, 0, 0.1)" : "none",
      }}
    >
      <div style={styles.container}>
        {/* Logo */}
        <div style={styles.logoContainer}>
          <Link to="/" style={styles.logoLink}>
            <img
              src="/Erica_Damas_logo-removebg-preview.png"
              alt="Erica Damas - Noivas e Ternos"
              style={{
                ...styles.logo,
                height: scrolled ? "60px" : "70px",
              }}
            />
          </Link>
        </div>

        {/* Navegação */}
        <nav style={styles.nav}>
          <ul style={styles.menuList}>
            {navLinks.map((link) => (
              <li key={link.name} style={styles.menuItem}>
                <Link
                  to={link.path}
                  style={{
                    ...styles.menuLink,
                    color: isActive(link.path) ? "#e8d192" : "#b6a06a",
                    fontWeight: isActive(link.path) ? "600" : "500",
                    borderBottom: isActive(link.path)
                      ? "1px solid #e8d192"
                      : "1px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#e8d192";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = isActive(link.path)
                      ? "#e8d192"
                      : "#b6a06a";
                  }}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};

const styles = {
  header: {
    backgroundColor: "#000000",
    padding: "0 3rem",
    borderBottom: "1px solid rgba(182, 160, 106, 0.1)",
    height: "90px",
    display: "flex",
    alignItems: "center",
    position: "sticky", // Mudado de "fixed" para "sticky"
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    margin: 0,
    transition: "all 0.3s ease",
  },
  container: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: "1400px",
    margin: "0 auto",
    width: "100%",
    height: "100%",
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
  },
  logoLink: {
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    height: "100%",
    padding: 0,
  },
  logo: {
    height: "70px",
    width: "auto",
    maxWidth: "280px",
    objectFit: "contain",
    transition: "all 0.3s ease",
    filter: "brightness(1.05)",
  },
  nav: {
    height: "100%",
    display: "flex",
    alignItems: "center",
  },
  menuList: {
    display: "flex",
    gap: "3rem",
    listStyle: "none",
    margin: 0,
    padding: 0,
    height: "100%",
    alignItems: "center",
  },
  menuItem: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    position: "relative",
  },
  menuLink: {
    color: "#b6a06a",
    textDecoration: "none",
    fontSize: "1rem",
    fontFamily: '"Cormorant Garamond", serif',
    fontWeight: 500,
    letterSpacing: "1.5px",
    padding: "0.5rem 0",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    height: "100%",
    position: "relative",
    textTransform: "uppercase",
    borderBottom: "1px solid transparent",
    paddingBottom: "5px",
  },
};

export default Header;

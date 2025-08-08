import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [acervoOpen, setAcervoOpen] = useState(false);
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
    if (path === "/acervo") {
      // Considerar ativo se estiver em qualquer subpágina do acervo
      return (
        location.pathname.startsWith("/acervo") ||
        location.pathname === "/vestidos" ||
        location.pathname === "/ternos" ||
        location.pathname === "/debutantes"
      );
    }
    return location.pathname === path;
  };

  // Links de navegação
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Sobre", path: "/sobre" },
    {
      name: "Acervo",
      path: "/acervo",
      dropdown: true,
      subItems: [
        { name: "Vestidos de Noiva", path: "/vestidos" },
        { name: "Vestidos de Debutante", path: "/debutantes" },
        { name: "Ternos", path: "/ternos" },
      ],
    },
    { name: "Contato", path: "/contato" },
  ];

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (acervoOpen && !event.target.closest("#acervo-menu")) {
        setAcervoOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [acervoOpen]);

  // Adicionar estilos CSS para o dropdown
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
    .dropdown-menu {
      opacity: 0;
      visibility: hidden;
      transform: translateY(10px);
      transition: all 0.3s ease;
    }
    
    .dropdown-open .dropdown-menu {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }
    
    .dropdown-item:hover {
      background-color: rgba(182, 160, 106, 0.1);
    }
  `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

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
                height: scrolled ? "65px" : "85px",
                maxWidth: scrolled ? "320px" : "380px",
              }}
            />
          </Link>
        </div>

        {/* Navegação */}
        <nav style={styles.nav}>
          <ul style={styles.menuList}>
            {navLinks.map((link) => (
              <li
                key={link.name}
                style={styles.menuItem}
                id={link.dropdown ? "acervo-menu" : ""}
                className={link.dropdown && acervoOpen ? "dropdown-open" : ""}
                onMouseEnter={() => link.dropdown && setAcervoOpen(true)}
                onMouseLeave={() => link.dropdown && setAcervoOpen(false)}
              >
                <Link
                  to={link.path}
                  style={{
                    ...styles.menuLink,
                    color: isActive(link.path) ? "#e8d192" : "#b6a06a",
                    fontWeight: isActive(link.path) ? "600" : "500",
                  }}
                  onClick={(e) => {
                    if (link.dropdown) {
                      e.preventDefault();
                      setAcervoOpen(!acervoOpen);
                    }
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
                  {link.dropdown && <span style={styles.dropdownArrow}>▾</span>}
                </Link>

                {/* Dropdown Menu */}
                {link.dropdown && (
                  <div className="dropdown-menu" style={styles.dropdownMenu}>
                    {link.subItems.map((subItem) => (
                      <Link
                        key={subItem.name}
                        to={subItem.path}
                        className="dropdown-item"
                        style={{
                          ...styles.dropdownItem,
                          color: isActive(subItem.path) ? "#e8d192" : "#b6a06a",
                          fontWeight: isActive(subItem.path) ? "600" : "500",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "#e8d192";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = isActive(subItem.path)
                            ? "#e8d192"
                            : "#b6a06a";
                        }}
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            ))}

            {/* Link para área administrativa */}
            <li style={styles.adminItem}>
              <Link
                to="/admin/login"
                style={styles.adminLink}
                title="Área Administrativa"
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#e8d192";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#b6a06a";
                }}
              >
                <svg
                  style={styles.adminIcon}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </Link>
            </li>
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
    position: "sticky",
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
    height: "100%",
    flex: "0 0 auto",
  },
  logoLink: {
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    height: "100%",
    padding: 0,
  },
  logo: {
    height: "85px",
    width: "auto",
    maxWidth: "380px",
    objectFit: "contain",
    transition: "all 0.3s ease",
    filter: "brightness(1.05)",
    padding: "2px 0",
  },
  nav: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    marginLeft: "auto",
  },
  menuList: {
    display: "flex",
    gap: "2.5rem",
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
  },
  dropdownArrow: {
    marginLeft: "5px",
    fontSize: "0.7rem",
    transition: "transform 0.3s ease",
  },
  activeIndicator: {
    position: "absolute",
    bottom: "-2px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "4px",
    height: "4px",
    borderRadius: "50%",
    backgroundColor: "#e8d192",
  },
  dropdownMenu: {
    position: "absolute",
    top: "100%",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "#000000",
    minWidth: "220px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
    borderRadius: "4px",
    padding: "0.5rem 0",
    display: "flex",
    flexDirection: "column",
    zIndex: 1001,
    marginTop: "1px",
  },
  dropdownItem: {
    color: "#b6a06a",
    textDecoration: "none",
    padding: "0.8rem 1.5rem",
    fontSize: "0.9rem",
    fontFamily: '"Cormorant Garamond", serif',
    letterSpacing: "1px",
    transition: "all 0.2s ease",
    textAlign: "center",
    whiteSpace: "nowrap",
  },
  adminItem: {
    marginLeft: "1.5rem",
    display: "flex",
    alignItems: "center",
    height: "100%",
  },
  adminLink: {
    color: "#b6a06a",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px",
    borderRadius: "50%",
    background: "rgba(182, 160, 106, 0.1)",
  },
  adminIcon: {
    width: "20px",
    height: "20px",
  },
};

export default Header;

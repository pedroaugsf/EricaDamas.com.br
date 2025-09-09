import React, { useState, useEffect, memo } from "react";
import { Link, useLocation } from "react-router-dom";

const Header = memo(() => {
  const [scrolled, setScrolled] = useState(false);
  const [acervoOpen, setAcervoOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  // Detecta se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Detecta o scroll para mudar a aparência do header - otimizado com throttle
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const isScrolled = window.scrollY > 10;
          if (isScrolled !== scrolled) {
            setScrolled(isScrolled);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  // Previne scroll do body quando menu mobile está aberto
  useEffect(() => {
    if (isMobile && mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen, isMobile]);

  // Verifica se o link está ativo
  const isActive = (path) => {
    if (path === "/acervo") {
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
    { name: "Serviços", path: "/sobre" },
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
    { name: "Localização", path: "/contato" },
  ];

  // Função para navegação suave para componentes específicos
  const scrollToComponent = (componentId, e) => {
    e.preventDefault();
    setMobileMenuOpen(false); // Fecha menu mobile

    if (location.pathname === "/") {
      const element = document.getElementById(componentId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      window.location.href = `/#${componentId}`;
    }
  };

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (acervoOpen && !event.target.closest("#acervo-menu")) {
        setAcervoOpen(false);
      }
      if (
        mobileMenuOpen &&
        !event.target.closest("#mobile-menu") &&
        !event.target.closest("#mobile-menu-button")
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [acervoOpen, mobileMenuOpen]);

  // Adicionar estilos CSS para o dropdown e mobile menu
  useEffect(() => {
    if (!document.getElementById("header-styles")) {
      const style = document.createElement("style");
      style.id = "header-styles";
      style.innerHTML = `
      .dropdown-menu {
        opacity: 0;
        visibility: hidden;
        transform: translateY(10px);
        transition: all 0.3s ease;
        pointer-events: none;
      }

      .dropdown-open .dropdown-menu {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
        pointer-events: auto;
      }

      .dropdown-item:hover {
        background-color: rgba(182, 160, 106, 0.1);
      }

      /* Mobile Menu Animations */
      .mobile-menu-enter {
        opacity: 0;
        transform: translateX(100%);
      }

      .mobile-menu-enter-active {
        opacity: 1;
        transform: translateX(0);
        transition: all 0.3s ease;
      }

      .mobile-menu-exit {
        opacity: 1;
        transform: translateX(0);
      }

      .mobile-menu-exit-active {
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
      }

      /* Mobile Hamburger Animation */
      .hamburger-line {
        transition: all 0.3s ease;
        transform-origin: center;
      }

      .hamburger-open .hamburger-line:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
      }

      .hamburger-open .hamburger-line:nth-child(2) {
        opacity: 0;
      }

      .hamburger-open .hamburger-line:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
      }

      /* Mobile Menu Item Animation */
      .mobile-menu-item {
        opacity: 0;
        transform: translateX(20px);
        animation: slideInLeft 0.3s ease forwards;
      }

      .mobile-menu-item:nth-child(1) { animation-delay: 0.1s; }
      .mobile-menu-item:nth-child(2) { animation-delay: 0.2s; }
      .mobile-menu-item:nth-child(3) { animation-delay: 0.3s; }
      .mobile-menu-item:nth-child(4) { animation-delay: 0.4s; }
      .mobile-menu-item:nth-child(5) { animation-delay: 0.5s; }

      @keyframes slideInLeft {
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      /* Mobile Submenu Animation */
      .mobile-submenu {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease;
      }

      .mobile-submenu.open {
        max-height: 200px;
      }

      /* Touch improvements */
      @media (hover: none) and (pointer: coarse) {
        .mobile-menu-link:active {
          background-color: rgba(182, 160, 106, 0.2);
          transform: scale(0.98);
        }
      }
    `;
      document.head.appendChild(style);
    }
  }, []);

  const handleMobileMenuItemClick = (link) => {
    if (link.dropdown) {
      setAcervoOpen(!acervoOpen);
    } else {
      setMobileMenuOpen(false);
    }
  };

  if (isMobile) {
    return (
      <header
        style={{
          ...mobileStyles.header,
          height: scrolled ? "60px" : "70px",
          backgroundColor: scrolled ? "rgba(0, 0, 0, 0.98)" : "#000000",
          boxShadow: scrolled ? "0 2px 20px rgba(0, 0, 0, 0.3)" : "none",
        }}
      >
        <div style={mobileStyles.container}>
          {/* Logo Mobile */}
          <div style={mobileStyles.logoContainer}>
            <Link
              to="/"
              style={mobileStyles.logoLink}
              onClick={() => setMobileMenuOpen(false)}
            >
              <img
                src="/Erica_Damas_logo-removebg-preview.png"
                alt="Erica Damas"
                style={{
                  ...mobileStyles.logo,
                  height: scrolled ? "45px" : "55px",
                }}
                width="200"
                height="55"
                loading="eager"
              />
            </Link>
          </div>

          {/* Hamburger Menu Button */}
          <button
            id="mobile-menu-button"
            style={mobileStyles.hamburgerButton}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={mobileMenuOpen ? "hamburger-open" : ""}
            aria-label="Menu"
          >
            <div
              className="hamburger-line"
              style={mobileStyles.hamburgerLine}
            ></div>
            <div
              className="hamburger-line"
              style={mobileStyles.hamburgerLine}
            ></div>
            <div
              className="hamburger-line"
              style={mobileStyles.hamburgerLine}
            ></div>
          </button>

          {/* Mobile Menu Overlay */}
          {mobileMenuOpen && (
            <div
              style={mobileStyles.overlay}
              onClick={() => setMobileMenuOpen(false)}
            />
          )}

          {/* Mobile Menu */}
          <nav
            id="mobile-menu"
            style={{
              ...mobileStyles.mobileMenu,
              transform: mobileMenuOpen ? "translateX(0)" : "translateX(100%)",
              opacity: mobileMenuOpen ? 1 : 0,
            }}
          >
            {/* Menu Header */}
            <div style={mobileStyles.mobileMenuHeader}>
              <img
                src="/Erica_Damas_logo-removebg-preview.png"
                alt="Erica Damas"
                style={mobileStyles.mobileMenuLogo}
              />
              <button
                style={mobileStyles.closeButton}
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Fechar menu"
              >
                ✕
              </button>
            </div>

            {/* Menu Items */}
            <div style={mobileStyles.mobileMenuContent}>
              {navLinks.map((link, index) => (
                <div
                  key={link.name}
                  className="mobile-menu-item"
                  style={mobileStyles.mobileMenuItem}
                >
                  {link.name === "Serviços" ? (
                    <a
                      href="#nossos-servicos"
                      onClick={(e) => scrollToComponent("nossos-servicos", e)}
                      style={{
                        ...mobileStyles.mobileMenuLink,
                        color: isActive(link.path) ? "#e8d192" : "#b6a06a",
                        fontWeight: isActive(link.path) ? "600" : "500",
                      }}
                      className="mobile-menu-link"
                    >
                      {link.name}
                    </a>
                  ) : link.name === "Localização" ? (
                    <a
                      href="#localizacao"
                      onClick={(e) => scrollToComponent("localizacao", e)}
                      style={{
                        ...mobileStyles.mobileMenuLink,
                        color: isActive(link.path) ? "#e8d192" : "#b6a06a",
                        fontWeight: isActive(link.path) ? "600" : "500",
                      }}
                      className="mobile-menu-link"
                    >
                      {link.name}
                    </a>
                  ) : (
                    <div>
                      <div
                        style={mobileStyles.mobileMenuLink}
                        onClick={() => handleMobileMenuItemClick(link)}
                        className="mobile-menu-link"
                      >
                        <Link
                          to={link.path}
                          style={{
                            color: isActive(link.path) ? "#e8d192" : "#b6a06a",
                            fontWeight: isActive(link.path) ? "600" : "500",
                            textDecoration: "none",
                            flex: 1,
                          }}
                          onClick={() =>
                            !link.dropdown && setMobileMenuOpen(false)
                          }
                        >
                          {link.name}
                        </Link>

                        {link.dropdown && (
                          <span
                            style={{
                              ...mobileStyles.dropdownArrow,
                              transform: acervoOpen
                                ? "rotate(180deg)"
                                : "rotate(0deg)",
                            }}
                          >
                            ▼
                          </span>
                        )}
                      </div>

                      {/* Mobile Submenu */}
                      {link.dropdown && (
                        <div
                          className={`mobile-submenu ${
                            acervoOpen ? "open" : ""
                          }`}
                          style={mobileStyles.mobileSubmenu}
                        >
                          {link.subItems.map((subItem) => (
                            <Link
                              key={subItem.name}
                              to={subItem.path}
                              style={{
                                ...mobileStyles.mobileSubmenuItem,
                                color: isActive(subItem.path)
                                  ? "#e8d192"
                                  : "#999",
                                fontWeight: isActive(subItem.path)
                                  ? "600"
                                  : "400",
                              }}
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Admin Link Mobile */}
              <div
                className="mobile-menu-item"
                style={mobileStyles.mobileMenuItem}
              >
                <Link
                  to="/admin/login"
                  style={mobileStyles.mobileAdminLink}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Área Administrativa
                </Link>
              </div>
            </div>

            {/* Menu Footer */}
            <div style={mobileStyles.mobileMenuFooter}>
              <p style={mobileStyles.footerText}>© 2024 Erica Damas</p>
            </div>
          </nav>
        </div>
      </header>
    );
  }

  // Desktop version (unchanged)
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
              width="380"
              height="85"
              loading="eager"
            />
          </Link>
        </div>

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
                {link.name === "Serviços" ? (
                  <a
                    href="#nossos-servicos"
                    onClick={(e) => scrollToComponent("nossos-servicos", e)}
                    style={{
                      ...styles.menuLink,
                      color: isActive(link.path) ? "#e8d192" : "#b6a06a",
                      fontWeight: isActive(link.path) ? "600" : "500",
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
                  </a>
                ) : link.name === "Localização" ? (
                  <a
                    href="#localizacao"
                    onClick={(e) => scrollToComponent("localizacao", e)}
                    style={{
                      ...styles.menuLink,
                      color: isActive(link.path) ? "#e8d192" : "#b6a06a",
                      fontWeight: isActive(link.path) ? "600" : "500",
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
                  </a>
                ) : (
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
                    {link.dropdown && (
                      <span style={styles.dropdownArrow}>▾</span>
                    )}
                  </Link>
                )}

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
                  width="20"
                  height="20"
                  aria-hidden="true"
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
});

// Mobile Styles
const mobileStyles = {
  header: {
    backgroundColor: "#000000",
    padding: "0 1rem",
    height: "70px",
    display: "flex",
    alignItems: "center",
    position: "sticky",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    transition: "all 0.3s ease",
    borderBottom: "1px solid rgba(182, 160, 106, 0.1)",
  },
  container: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    height: "100%",
  },
  logoLink: {
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    height: "100%",
  },
  logo: {
    height: "55px",
    width: "auto",
    maxWidth: "200px",
    objectFit: "contain",
    transition: "all 0.3s ease",
    filter: "brightness(1.05)",
  },
  hamburgerButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "8px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "4px",
    borderRadius: "4px",
    transition: "background-color 0.3s ease",
  },
  hamburgerLine: {
    width: "24px",
    height: "2px",
    backgroundColor: "#b6a06a",
    borderRadius: "1px",
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 999,
  },
  mobileMenu: {
    position: "fixed",
    top: 0,
    right: 0,
    width: "85%",
    maxWidth: "350px",
    height: "100vh",
    backgroundColor: "#000000",
    zIndex: 1001,
    display: "flex",
    flexDirection: "column",
    transition: "all 0.3s ease",
    boxShadow: "-5px 0 20px rgba(0, 0, 0, 0.3)",
  },
  mobileMenuHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem",
    borderBottom: "1px solid rgba(182, 160, 106, 0.2)",
    background: "linear-gradient(135deg, #1a1a1a 0%, #000000 100%)",
  },
  mobileMenuLogo: {
    height: "40px",
    width: "auto",
    maxWidth: "150px",
  },
  closeButton: {
    background: "none",
    border: "none",
    color: "#b6a06a",
    fontSize: "1.5rem",
    cursor: "pointer",
    padding: "8px",
    borderRadius: "50%",
    transition: "all 0.3s ease",
  },
  mobileMenuContent: {
    flex: 1,
    padding: "1rem 0",
    overflowY: "auto",
  },
  mobileMenuItem: {
    margin: "0.5rem 0",
  },
  mobileMenuLink: {
    display: "flex",
    alignItems: "center",
    padding: "1rem 1.5rem",
    color: "#b6a06a",
    textDecoration: "none",
    fontSize: "1.1rem",
    fontFamily: '"Cormorant Garamond", serif',
    fontWeight: "500",
    letterSpacing: "1px",
    transition: "all 0.3s ease",
    borderRadius: "0 25px 25px 0",
    margin: "0 0 0 1rem",
    cursor: "pointer",
  },
  dropdownArrow: {
    fontSize: "0.8rem",
    transition: "transform 0.3s ease",
    marginLeft: "auto",
  },
  mobileSubmenu: {
    marginLeft: "2rem",
    paddingLeft: "1rem",
    borderLeft: "2px solid rgba(182, 160, 106, 0.3)",
  },
  mobileSubmenuItem: {
    display: "block",
    padding: "0.8rem 1rem",
    color: "#999",
    textDecoration: "none",
    fontSize: "1rem",
    fontFamily: '"Cormorant Garamond", serif',
    transition: "all 0.3s ease",
    borderRadius: "0 15px 15px 0",
  },
  mobileAdminLink: {
    display: "flex",
    alignItems: "center",
    padding: "1rem 1.5rem",
    color: "#b6a06a",
    textDecoration: "none",
    fontSize: "1.1rem",
    fontFamily: '"Cormorant Garamond", serif',
    fontWeight: "500",
    letterSpacing: "1px",
    transition: "all 0.3s ease",
    borderRadius: "0 25px 25px 0",
    margin: "0 0 0 1rem",
    background: "rgba(182, 160, 106, 0.1)",
  },
  mobileMenuFooter: {
    padding: "1rem",
    borderTop: "1px solid rgba(182, 160, 106, 0.2)",
    textAlign: "center",
  },
  footerText: {
    color: "#666",
    fontSize: "0.9rem",
    margin: 0,
    fontFamily: '"Cormorant Garamond", serif',
  },
};

// Desktop Styles (unchanged)
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
    willChange: "height, background-color, box-shadow",
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
    willChange: "height, max-width",
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
    transition: "color 0.3s ease",
    display: "flex",
    alignItems: "center",
    height: "100%",
    position: "relative",
    textTransform: "uppercase",
    cursor: "pointer",
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

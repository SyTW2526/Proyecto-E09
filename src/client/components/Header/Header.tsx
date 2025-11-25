import React, { useState, useRef, useEffect } from "react";
import { Search, Menu, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import NotificationBell from "./NotificationBell";
import LanguageSelector from "./LanguageSelector";
import DarkModeToggle from "./DarkModeToggle";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import "../../styles/header.css";

const Header: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isTradeOpen, setIsTradeOpen] = useState(false);

  const tradeDropdownRef = useRef<HTMLDivElement | null>(null);
  const user = authService.getUser();
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        tradeDropdownRef.current &&
        !tradeDropdownRef.current.contains(e.target as Node)
      ) {
        setIsTradeOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="header-wrapper">
      
      <div className="header-container">
        
        {/* IZQUIERDA */}
        <div className="header-left">
          <Link to="/home">
            <img src="/logo.png" alt="AMI Logo" className="header-logo" />
          </Link>

        <nav className="nav-desktop">

          {/* COLECCIÓN */}
          <Link to="/collection" className="CollectionButton">
            {t("header.coleccion")}
          </Link>

          {/* ABRIR SOBRES */}
          <Link to="/abrir" className="CollectionButton">
            {t('header.abrir', { defaultValue: 'Abrir' })}
          </Link>

          {/* INTERCAMBIO */}
            <div className="relative" ref={tradeDropdownRef}>
              <button
                className="CollectionButton"
                onClick={() => setIsTradeOpen(!isTradeOpen)}
              >
                {t("header.intercambio")}
              </button>

              {isTradeOpen && (
                <div className="profile-dropdown fadeIn" style={{ top: "50px" }}>
                  <button
                    onClick={() => {
                      setIsTradeOpen(false);
                      navigate("/discover");
                    }}
                    className="dropdown-item"
                  >
                    {t("header.descubrirCartas")}
                  </button>

                  <button
                    onClick={() => {
                      setIsTradeOpen(false);
                      navigate("/trade-requests");
                    }}
                    className="dropdown-item"
                  >
                    {t("header.solicitudes")}
                  </button>

                  <button
                    onClick={() => {
                      setIsTradeOpen(false);
                      navigate("/trade-room/create");
                    }}
                    className="dropdown-item"
                  >
                    {t("header.crearSala")}
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
        {/* BUSCADOR */}
        <div className="search-container">
          <input
            type="text"
            placeholder={t("header.buscar")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="header-search"
          />
          <Search className="search-icon" />
        </div>

        {/* DERECHA */}
        <div className="header-right">
          <NotificationBell />
          <LanguageSelector />
          <DarkModeToggle />

          {/* PERFIL + DROPDOWN */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="profile-button"
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <User className="profile-icon" />
            </button>

            {/* DROPDOWN */}
            {profileOpen && (
              <div className="profile-dropdown fadeIn">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/friends");
                  }}
                  className="dropdown-item"
                >
                  {t("header.amigos")}
                </button>
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/profile");
                  }}
                  className="dropdown-item"
                >
                  {t("header.ajustes")}
                </button>

                <button
                  onClick={() => {
                    authService.logout();
                    navigate("/");
                  }}
                  className="dropdown-item logout"
                >
                  {t("header.cerrarSesion")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MENÚ MÓVIL */}
      {menuOpen && (
        <nav className="mobile-menu fadeIn">
          <img src="/logo.png" alt="Logo" className="mobile-logo" />
          <Link to="/coleccion" className="mobile-link">
            {t("header.coleccion")}
          </Link>
          <Link to="/trade" className="mobile-link">
            {t("header.intercambio")}
          </Link>
        </nav>
      )}
    </header>
  );
};

export default Header;

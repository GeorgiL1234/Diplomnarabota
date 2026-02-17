import { useState, useEffect, useRef } from "react";
import type { View } from "../types";
import type { Language as LangType } from "../translations";
import { translations } from "../translations";

type HeaderProps = {
  language: LangType;
  setLanguage: (lang: LangType) => void;
  loggedInEmail: string | null;
  view: View;
  setView: (view: View) => void;
  setSelectedItem: (item: any) => void;
  setReviews: (reviews: any[]) => void;
  handleLogout: () => void;
};

export function Header({
  language,
  setLanguage,
  loggedInEmail,
  view,
  setView,
  setSelectedItem,
  setReviews,
  handleLogout,
}: HeaderProps) {
  const t = translations[language];
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const inMenu = menuRef.current?.contains(target);
      const inUserMenu = userMenuRef.current?.contains(target);
      const inMobileBtn = mobileMenuBtnRef.current?.contains(target);
      if (!inMenu && !inUserMenu && !inMobileBtn) {
        setIsMenuOpen(false);
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleViewChange = (newView: View) => {
    setView(newView);
    setSelectedItem(null);
    setReviews([]);
    setIsMenuOpen(false);
  };

  return (
    <header className="app-header">
      <div className="app-header-content">
        <div className="app-header-left">
          <h1
            className="app-title logo-clickable"
            onClick={() => handleViewChange(loggedInEmail ? "all" : "home")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && handleViewChange(loggedInEmail ? "all" : "home")}
          >
            <span className="logo-icon-large">🛍️</span>
            Web Shop
            <span style={{ fontSize: "0.5em", opacity: 0.7, marginLeft: "4px" }} title="Версия с снимка в create request">v2</span>
          </h1>
        </div>
        
        <div className="app-header-right">
          {/* Desktop Navigation */}
          <nav className="app-nav desktop-nav">
            {!loggedInEmail && (
              <>
                <button
                  type="button"
                  className={`nav-btn ${view === "home" ? "active" : ""}`}
                  onClick={() => handleViewChange("home")}
                >
                  <span className="nav-icon">🏠</span>
                  {t.navHome || "Начало"}
                </button>
                <button
                  type="button"
                  className={`nav-btn ${view === "all" ? "active" : ""}`}
                  onClick={() => handleViewChange("all")}
                >
                  <span className="nav-icon">📋</span>
                  {t.navListings}
                </button>
              </>
            )}
            {loggedInEmail && (
              <>
                <button
                  type="button"
                  className={`nav-btn ${view === "all" ? "active" : ""}`}
                  onClick={() => handleViewChange("all")}
                >
                  <span className="nav-icon">📋</span>
                  {t.navListings}
                </button>
                <button
                  type="button"
                  className={`nav-btn ${view === "mine" ? "active" : ""}`}
                  onClick={() => handleViewChange("mine")}
                >
                  <span className="nav-icon">📦</span>
                  {t.navMyListings}
                </button>
                <button
                  type="button"
                  className={`nav-btn ${view === "favorites" ? "active" : ""}`}
                  onClick={() => handleViewChange("favorites")}
                >
                  <span className="nav-icon">⭐</span>
                  {t.navFavorites}
                </button>
                <div className="dropdown-container" ref={menuRef}>
                  <button
                    type="button"
                    className={`nav-btn dropdown-toggle ${["messages", "orders", "vip"].includes(view) ? "active" : ""}`}
                    onClick={() => {
                      setIsMenuOpen((prev) => !prev);
                      setIsUserMenuOpen(false);
                    }}
                  >
                    <span className="nav-icon">⚙️</span>
                    {t.navMore || "Още"}
                    <span className="dropdown-arrow">▼</span>
                  </button>
                  {isMenuOpen && (
                    <div className="dropdown-menu">
                      <button
                        type="button"
                        className={`dropdown-item ${view === "messages" ? "active" : ""}`}
                        onClick={() => handleViewChange("messages")}
                      >
                        <span className="nav-icon">💬</span>
                        {t.navMessages}
                      </button>
                      <button
                        type="button"
                        className={`dropdown-item ${view === "orders" ? "active" : ""}`}
                        onClick={() => handleViewChange("orders")}
                      >
                        <span className="nav-icon">🛒</span>
                        {t.navOrders}
                      </button>
                      <button
                        type="button"
                        className={`dropdown-item ${view === "vip" ? "active" : ""}`}
                        onClick={() => handleViewChange("vip")}
                      >
                        <span className="nav-icon">👑</span>
                        VIP Обяви
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
            
            {/* User Menu */}
            {loggedInEmail ? (
              <div className="dropdown-container user-menu" ref={userMenuRef}>
                <button
                  type="button"
                  className="nav-btn user-menu-btn"
                  onClick={() => {
                    setIsUserMenuOpen((prev) => !prev);
                    setIsMenuOpen(false);
                  }}
                >
                  <span className="nav-icon">👤</span>
                  {loggedInEmail.split("@")[0]}
                  <span className="dropdown-arrow">▼</span>
                </button>
                {isUserMenuOpen && (
                  <div className="dropdown-menu user-dropdown">
                    <div className="dropdown-header">
                      <span className="user-email">{loggedInEmail}</span>
                    </div>
                    <button
                      type="button"
                      className="dropdown-item logout-btn"
                      onClick={() => {
                        handleLogout();
                        setIsUserMenuOpen(false);
                      }}
                    >
                      <span className="nav-icon">🚪</span>
                      Изход
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                className={`nav-btn ${view === "login" || view === "register" ? "active" : ""}`}
                onClick={() => handleViewChange("login")}
              >
                <span className="nav-icon">🔐</span>
                {t.navLogin}
              </button>
            )}
            <select
              className="language-selector"
              value={language}
              onChange={(e) => setLanguage(e.target.value as LangType)}
            >
              <option value="bg">🇧🇬 БГ</option>
              <option value="en">🇬🇧 EN</option>
              <option value="ru">🇷🇺 RU</option>
            </select>
          </nav>

          {/* Mobile Menu Button */}
          <button
            ref={mobileMenuBtnRef}
            className="mobile-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className="hamburger-icon">☰</span>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="app-nav mobile-nav">
            {!loggedInEmail && (
              <>
                <button
                  type="button"
                  className={`nav-btn mobile-nav-btn ${view === "home" ? "active" : ""}`}
                  onClick={() => handleViewChange("home")}
                >
                  <span className="nav-icon">🏠</span>
                  {t.navHome || "Начало"}
                </button>
                <button
                  type="button"
                  className={`nav-btn mobile-nav-btn ${view === "all" ? "active" : ""}`}
                  onClick={() => handleViewChange("all")}
                >
                  <span className="nav-icon">📋</span>
                  {t.navListings}
                </button>
              </>
            )}
            {loggedInEmail && (
              <>
                <button
                  type="button"
                  className={`nav-btn mobile-nav-btn ${view === "all" ? "active" : ""}`}
                  onClick={() => handleViewChange("all")}
                >
                  <span className="nav-icon">📋</span>
                  {t.navListings}
                </button>
                <button
                  type="button"
                  className={`nav-btn mobile-nav-btn ${view === "mine" ? "active" : ""}`}
                  onClick={() => handleViewChange("mine")}
                >
                  <span className="nav-icon">📦</span>
                  {t.navMyListings}
                </button>
                <button
                  type="button"
                  className={`nav-btn mobile-nav-btn ${view === "favorites" ? "active" : ""}`}
                  onClick={() => handleViewChange("favorites")}
                >
                  <span className="nav-icon">⭐</span>
                  {t.navFavorites}
                </button>
                <button
                  type="button"
                  className={`nav-btn mobile-nav-btn ${view === "messages" ? "active" : ""}`}
                  onClick={() => handleViewChange("messages")}
                >
                  <span className="nav-icon">💬</span>
                  {t.navMessages}
                </button>
                <button
                  type="button"
                  className={`nav-btn mobile-nav-btn ${view === "orders" ? "active" : ""}`}
                  onClick={() => handleViewChange("orders")}
                >
                  <span className="nav-icon">🛒</span>
                  {t.navOrders}
                </button>
                <button
                  type="button"
                  className={`nav-btn mobile-nav-btn ${view === "vip" ? "active" : ""}`}
                  onClick={() => handleViewChange("vip")}
                >
                  <span className="nav-icon">👑</span>
                  VIP Обяви
                </button>
                <button
                  type="button"
                  className="nav-btn mobile-nav-btn logout-btn"
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                >
                  <span className="nav-icon">🚪</span>
                  Изход
                </button>
              </>
            )}
            <div className="mobile-nav-language">
              <select
                className="language-selector mobile"
                value={language}
                onChange={(e) => setLanguage(e.target.value as LangType)}
              >
                <option value="bg">🇧🇬 БГ</option>
                <option value="en">🇬🇧 EN</option>
                <option value="ru">🇷🇺 RU</option>
              </select>
            </div>
            {!loggedInEmail && (
              <button
                type="button"
                className={`nav-btn mobile-nav-btn ${view === "login" || view === "register" ? "active" : ""}`}
                onClick={() => handleViewChange("login")}
              >
                <span className="nav-icon">🔐</span>
                {t.navLogin}
              </button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}

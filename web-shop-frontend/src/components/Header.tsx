import { useState } from "react";
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

  const handleViewChange = (newView: View) => {
    setView(newView);
    setSelectedItem(null);
    setReviews([]);
    setIsMenuOpen(false);
  };

  return (
    <>
      <div className="app-topbar">
        <div className="app-topbar-left">
          <span className="logo-icon">🛍️</span>
          <span>Web Shop</span>
        </div>
        <div className="app-topbar-right">
          <select
            className="language-selector"
            value={language}
            onChange={(e) => setLanguage(e.target.value as LangType)}
          >
            <option value="bg">🇧🇬 БГ</option>
            <option value="en">🇬🇧 EN</option>
            <option value="ru">🇷🇺 RU</option>
          </select>
        </div>
      </div>
      <header className="app-header">
        <div className="app-header-content">
          <div className="app-header-left">
            <h1 className="app-title">
              <span className="logo-icon-large">🛍️</span>
              Web Shop
            </h1>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="app-nav desktop-nav">
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
                <div className="dropdown-container">
                  <button
                    type="button"
                    className={`nav-btn dropdown-toggle ${["messages", "orders", "vip"].includes(view) ? "active" : ""}`}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
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
              <div className="dropdown-container user-menu">
                <button
                  type="button"
                  className="nav-btn user-menu-btn"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
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
          </nav>

          {/* Mobile Menu Button */}
          <button
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
      </header>
    </>
  );
}

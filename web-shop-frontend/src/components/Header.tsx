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

  const handleViewChange = (newView: View) => {
    setView(newView);
    setSelectedItem(null);
    setReviews([]);
  };

  return (
    <>
      <div className="app-topbar">
        <div className="app-topbar-left">Web Shop</div>
        <div className="app-topbar-right">
          <select
            className="language-selector"
            value={language}
            onChange={(e) => setLanguage(e.target.value as LangType)}
            style={{
              background: 'transparent',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            <option value="bg" style={{ background: '#000', color: '#fff' }}>🇧🇬 БГ</option>
            <option value="en" style={{ background: '#000', color: '#fff' }}>🇬🇧 EN</option>
            <option value="ru" style={{ background: '#000', color: '#fff' }}>🇷🇺 RU</option>
          </select>
        </div>
      </div>
      <header className="app-header">
        <div className="app-header-content">
          <div>
            <h1 className="app-title">Web Shop</h1>
          </div>
          <nav className="app-nav">
        {loggedInEmail && (
          <>
            <button
              type="button"
              className={`nav-btn ${view === "all" ? "active" : ""}`}
              onClick={() => handleViewChange("all")}
            >
              {t.navListings}
            </button>
            <button
              type="button"
              className={`nav-btn ${view === "mine" ? "active" : ""}`}
              onClick={() => handleViewChange("mine")}
            >
              {t.navMyListings}
            </button>
            <button
              type="button"
              className={`nav-btn ${view === "favorites" ? "active" : ""}`}
              onClick={() => handleViewChange("favorites")}
            >
              {t.navFavorites}
            </button>
            <button
              type="button"
              className={`nav-btn ${view === "messages" ? "active" : ""}`}
              onClick={() => handleViewChange("messages")}
            >
              {t.navMessages}
            </button>
            <button
              type="button"
              className={`nav-btn ${view === "orders" ? "active" : ""}`}
              onClick={() => handleViewChange("orders")}
            >
              {t.navOrders}
            </button>
          </>
        )}
        {loggedInEmail ? (
          <button
            type="button"
            className="nav-btn"
            onClick={handleLogout}
          >
            Изход
          </button>
        ) : (
          <button
            type="button"
            className={`nav-btn ${view === "login" || view === "register" ? "active" : ""}`}
            onClick={() => handleViewChange("login")}
          >
            {t.navLogin}
          </button>
        )}
          </nav>
        </div>
      </header>
    </>
  );
}

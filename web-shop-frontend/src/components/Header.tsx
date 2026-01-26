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
};

export function Header({
  language,
  setLanguage,
  loggedInEmail,
  view,
  setView,
  setSelectedItem,
  setReviews,
}: HeaderProps) {
  const t = translations[language];

  const handleViewChange = (newView: View) => {
    setView(newView);
    setSelectedItem(null);
    setReviews([]);
  };

  return (
    <header className="app-header">
      <div>
        <h1 className="app-title">Web Shop</h1>
        <p className="app-subtitle">{t.subtitle}</p>
      </div>
      <nav className="app-nav">
        <select
          className="language-selector"
          value={language}
          onChange={(e) => setLanguage(e.target.value as LangType)}
        >
          <option value="bg">🇧🇬 БГ</option>
          <option value="en">🇬🇧 EN</option>
          <option value="ru">🇷🇺 RU</option>
        </select>
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
        <button
          type="button"
          className={`nav-btn ${view === "auth" ? "active" : ""}`}
          onClick={() => handleViewChange("auth")}
        >
          {loggedInEmail ? t.navProfile : t.navLogin}
        </button>
      </nav>
    </header>
  );
}

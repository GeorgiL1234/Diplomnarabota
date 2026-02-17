import type { Language } from "../translations";

type LandingPageProps = {
  language: Language;
  onBrowseListings: () => void;
  onLogin: () => void;
  onRegister: () => void;
};

const landingTranslations = {
  bg: {
    heroTitle: "Платформа за обяви и продажби",
    heroSubtitle: "Купете и продавайте лесно. Безплатни обяви, VIP видимост, директна комуникация.",
    browseListings: "Разгледай обяви",
    login: "Вход",
    register: "Регистрирай се",
    feature1: "Безплатни обяви",
    feature2: "VIP видимост",
    feature3: "Съобщения",
    feature4: "Поръчки",
  },
  en: {
    heroTitle: "Listings & Sales Platform",
    heroSubtitle: "Buy and sell easily. Free listings, VIP visibility, direct messaging.",
    browseListings: "Browse Listings",
    login: "Login",
    register: "Sign Up",
    feature1: "Free Listings",
    feature2: "VIP Visibility",
    feature3: "Messages",
    feature4: "Orders",
  },
  ru: {
    heroTitle: "Платформа объявлений и продаж",
    heroSubtitle: "Покупайте и продавайте легко. Бесплатные объявления, VIP видимость, прямая связь.",
    browseListings: "Смотреть объявления",
    login: "Вход",
    register: "Регистрация",
    feature1: "Бесплатные объявления",
    feature2: "VIP видимость",
    feature3: "Сообщения",
    feature4: "Заказы",
  },
};

export function LandingPage({ language, onBrowseListings, onLogin, onRegister }: LandingPageProps) {
  const t = landingTranslations[language] || landingTranslations.bg;

  return (
    <main className="landing-page">
      <section className="landing-hero">
        <h1 className="landing-title">{t.heroTitle}</h1>
        <p className="landing-subtitle">{t.heroSubtitle}</p>
        <div className="landing-ctas">
          <button type="button" className="landing-btn landing-btn-primary" onClick={onBrowseListings}>
            <span className="landing-btn-icon">📋</span>
            {t.browseListings}
          </button>
          <button type="button" className="landing-btn landing-btn-secondary" onClick={onLogin}>
            <span className="landing-btn-icon">🔐</span>
            {t.login}
          </button>
          <button type="button" className="landing-btn landing-btn-outline" onClick={onRegister}>
            <span className="landing-btn-icon">✨</span>
            {t.register}
          </button>
        </div>
      </section>

      <section className="landing-features">
        <div className="landing-feature">
          <span className="landing-feature-icon">📦</span>
          <span>{t.feature1}</span>
        </div>
        <div className="landing-feature">
          <span className="landing-feature-icon">👑</span>
          <span>{t.feature2}</span>
        </div>
        <div className="landing-feature">
          <span className="landing-feature-icon">💬</span>
          <span>{t.feature3}</span>
        </div>
        <div className="landing-feature">
          <span className="landing-feature-icon">🛒</span>
          <span>{t.feature4}</span>
        </div>
      </section>
    </main>
  );
}

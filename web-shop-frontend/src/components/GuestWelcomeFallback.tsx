import { translations, type Language } from "../translations";
import type { View } from "../types";

type Props = {
  language: Language;
  loggedInEmail: string | null;
  view: View;
  onGoLogin: () => void;
};

export function GuestWelcomeFallback({ language, loggedInEmail, view, onGoLogin }: Props) {
  const t = translations[language] || translations["bg"];
  const hidden =
    loggedInEmail ||
    view === "login" ||
    view === "register" ||
    view === "detail" ||
    view === "favorites" ||
    view === "orders" ||
    view === "messages" ||
    view === "all" ||
    view === "mine" ||
    view === "vip" ||
    view === "home";
  if (hidden) return null;

  return (
    <div
      style={{
        padding: "40px",
        textAlign: "center",
        background: "rgba(255, 255, 255, 0.95)",
        margin: "40px auto",
        maxWidth: "600px",
        borderRadius: "12px",
      }}
    >
      <h2>{t.welcomeToWebShop}</h2>
      <p>{t.pleaseLoginOrRegister}</p>
      <button className="btn-primary" onClick={onGoLogin} style={{ marginTop: "20px" }}>
        {t.authTitle}
      </button>
    </div>
  );
}

import type { FormEvent } from "react";
import { translations, type Language } from "../translations";

type LoginPageProps = {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  language: Language;
  handleLogin: (e: FormEvent) => void;
  onSwitchToRegister: () => void;
  error: string | null;
};

export function LoginPage({
  email,
  setEmail,
  password,
  setPassword,
  language,
  handleLogin,
  onSwitchToRegister,
  error,
}: LoginPageProps) {
  const t = translations[language] || translations["bg"];
  
  return (
    <section className="auth-section">
      <h2>{t.login}</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleLogin} className="auth-form">
        <div className="form-group">
          <label>{t.email}:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div className="form-group">
          <label>{t.password}:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        <button type="submit" className="btn-primary">
          {t.login}
        </button>
      </form>
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <p>{language === "bg" ? "Нямате акаунт?" : language === "en" ? "Don't have an account?" : "Нет аккаунта?"}</p>
        <button type="button" className="btn-secondary" onClick={onSwitchToRegister}>
          {t.register}
        </button>
      </div>
    </section>
  );
}

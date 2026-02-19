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
  isLoggingIn?: boolean;
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
  isLoggingIn = false,
}: LoginPageProps) {
  const t = translations[language] || translations["bg"];
  
  return (
    <section className="auth-section">
      <div className="auth-header-icon">🔐</div>
      <h2>{t.login}</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleLogin} className="auth-form">
        <div className="form-group">
          <label htmlFor="login-email">
            <span className="label-icon">📧</span>
            {t.email}:
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="email@example.com"
            disabled={isLoggingIn}
            className={isLoggingIn ? "input-disabled" : ""}
          />
        </div>
        <div className="form-group">
          <label htmlFor="login-password">
            <span className="label-icon">🔒</span>
            {t.password}:
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            disabled={isLoggingIn}
            className={isLoggingIn ? "input-disabled" : ""}
          />
        </div>
        <button type="submit" className={`btn-primary ${isLoggingIn ? "btn-loading" : ""}`} disabled={isLoggingIn}>
          {isLoggingIn ? (
            <>
              <span className="btn-icon spinning">⏳</span>
              {language === "bg" ? "Влизане..." : language === "en" ? "Logging in..." : "Вход..."}
            </>
          ) : (
            <>
              <span className="btn-icon">🚀</span>
              {t.login}
            </>
          )}
        </button>
      </form>
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <p>{language === "bg" ? "Нямате акаунт?" : language === "en" ? "Don't have an account?" : "Нет аккаунта?"}</p>
        <button type="button" className="btn-secondary" onClick={onSwitchToRegister}>
          <span className="btn-icon">✨</span>
          {t.register}
        </button>
      </div>
    </section>
  );
}

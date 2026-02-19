import type { FormEvent } from "react";
import { translations, type Language } from "../translations";

type RegisterPageProps = {
  fullName: string;
  setFullName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  language: Language;
  handleRegister: (e: FormEvent) => void;
  onSwitchToLogin: () => void;
  error: string | null;
  isRegistering: boolean;
};

export function RegisterPage({
  fullName,
  setFullName,
  email,
  setEmail,
  password,
  setPassword,
  language,
  handleRegister,
  onSwitchToLogin,
  error,
  isRegistering,
}: RegisterPageProps) {
  const t = translations[language] || translations["bg"];
  
  return (
    <section className="auth-section">
      <div className="auth-header-icon">✨</div>
      <h2>{t.register}</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleRegister} className="auth-form">
        <div className="form-group">
          <label htmlFor="register-fullName">
            <span className="label-icon">👤</span>
            {t.fullName}:
          </label>
          <input
            id="register-fullName"
            name="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            autoComplete="name"
            placeholder="Иван Иванов"
            disabled={isRegistering}
            className={isRegistering ? "input-disabled" : ""}
          />
        </div>
        <div className="form-group">
          <label htmlFor="register-email">
            <span className="label-icon">📧</span>
            {t.email}:
          </label>
          <input
            id="register-email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="email@example.com"
            disabled={isRegistering}
            className={isRegistering ? "input-disabled" : ""}
          />
        </div>
        <div className="form-group">
          <label htmlFor="register-password">
            <span className="label-icon">🔒</span>
            {t.password}:
          </label>
          <input
            id="register-password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            placeholder="••••••••"
            disabled={isRegistering}
            className={isRegistering ? "input-disabled" : ""}
          />
          <p style={{ fontSize: "12px", color: "#64748b", marginTop: "4px", marginBottom: 0 }}>
            {t.passwordHint}
          </p>
        </div>
        <button type="submit" className={`btn-primary ${isRegistering ? "btn-loading" : ""}`} disabled={isRegistering}>
          {isRegistering 
            ? (
              <>
                <span className="btn-icon spinning">⏳</span>
                {language === "bg" ? "Регистрира се..." : language === "en" ? "Registering..." : "Регистрация..."}
              </>
            )
            : (
              <>
                <span className="btn-icon">🚀</span>
                {t.register}
              </>
            )}
        </button>
      </form>
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <p>{language === "bg" ? "Вече имате акаунт?" : language === "en" ? "Already have an account?" : "Уже есть аккаунт?"}</p>
        <button type="button" className="btn-secondary" onClick={onSwitchToLogin}>
          <span className="btn-icon">🔐</span>
          {t.login}
        </button>
      </div>
    </section>
  );
}

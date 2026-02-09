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
      <h2>{t.register}</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleRegister} className="auth-form">
        <div className="form-group">
          <label>{t.fullName}:</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            autoComplete="name"
          />
        </div>
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
            autoComplete="new-password"
          />
          <p style={{ fontSize: "12px", color: "#64748b", marginTop: "4px", marginBottom: 0 }}>
            {t.passwordHint}
          </p>
        </div>
        <button type="submit" className="btn-primary" disabled={isRegistering}>
          {isRegistering 
            ? (language === "bg" ? "Регистрира се..." : language === "en" ? "Registering..." : "Регистрация...")
            : t.register}
        </button>
      </form>
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <p>{language === "bg" ? "Вече имате акаунт?" : language === "en" ? "Already have an account?" : "Уже есть аккаунт?"}</p>
        <button type="button" className="btn-secondary" onClick={onSwitchToLogin}>
          {t.login}
        </button>
      </div>
    </section>
  );
}

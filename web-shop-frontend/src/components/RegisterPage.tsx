import type { FormEvent } from "react";
import type { Language } from "../translations";

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
};

export function RegisterPage({
  fullName,
  setFullName,
  email,
  setEmail,
  password,
  setPassword,
  language: _language,
  handleRegister,
  onSwitchToLogin,
  error,
}: RegisterPageProps) {
  return (
    <section className="auth-section">
      <h2>Регистрация</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleRegister} className="auth-form">
        <div className="form-group">
          <label>Пълно име:</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            autoComplete="name"
          />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div className="form-group">
          <label>Парола:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          <p style={{ fontSize: "12px", color: "#64748b", marginTop: "4px", marginBottom: 0 }}>
            Паролата трябва да има поне 8 символа и да съдържа поне един специален символ (!@#$%^&* и т.н.)
          </p>
        </div>
        <button type="submit" className="btn-primary">
          Регистрация
        </button>
      </form>
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <p>Вече имате акаунт?</p>
        <button type="button" className="btn-secondary" onClick={onSwitchToLogin}>
          Влезте в системата
        </button>
      </div>
    </section>
  );
}

import type { FormEvent } from "react";
import type { Language } from "../translations";
import { translations } from "../translations";

type AuthSectionProps = {
  loggedInEmail: string | null;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  fullName: string;
  setFullName: (name: string) => void;
  language: Language;
  handleLogin: (e: FormEvent) => void;
  handleRegister: (e: FormEvent) => void;
  handleLogout: () => void;
};

export function AuthSection({
  loggedInEmail,
  email,
  setEmail,
  password,
  setPassword,
  fullName,
  setFullName,
  language,
  handleLogin,
  handleRegister,
  handleLogout,
}: AuthSectionProps) {
  if (loggedInEmail) {
    return (
      <section className="auth-section">
        <div className="auth-welcome">
          <h2>Добре дошли!</h2>
          <p>
            Логнат като: <strong>{loggedInEmail}</strong>
          </p>
          <button className="btn-primary" onClick={handleLogout}>
            Изход
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="auth-section">
      <h2>Вход / Регистрация</h2>
      <form onSubmit={handleLogin} className="auth-form">
        <h3>Вход</h3>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Парола:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-primary">
          Вход
        </button>
      </form>

      <form onSubmit={handleRegister} className="auth-form">
        <h3>Регистрация</h3>
        <div className="form-group">
          <label>Пълно име:</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Парола:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <p style={{ fontSize: "12px", color: "#64748b", marginTop: "4px", marginBottom: 0 }}>
            Паролата трябва да има поне 8 символа и да съдържа поне един специален символ (!@#$%^&* и т.н.)
          </p>
        </div>
        <button type="submit" className="btn-primary">
          Регистрация
        </button>
      </form>
    </section>
  );
}

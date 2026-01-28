import type { FormEvent } from "react";
import type { Language } from "../translations";

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
  language: _language,
  handleLogin,
  onSwitchToRegister,
  error,
}: LoginPageProps) {
  return (
    <section className="auth-section">
      <h2>Вход</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleLogin} className="auth-form">
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
            autoComplete="current-password"
          />
        </div>
        <button type="submit" className="btn-primary">
          Вход
        </button>
      </form>
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <p>Нямате акаунт?</p>
        <button type="button" className="btn-secondary" onClick={onSwitchToRegister}>
          Регистрирайте се
        </button>
      </div>
    </section>
  );
}

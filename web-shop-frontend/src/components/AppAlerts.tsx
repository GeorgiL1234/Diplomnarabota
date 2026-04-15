import { translations, type Language } from "../translations";

type Props = {
  language: Language;
  error: string | null;
  message: string | null;
};

export function AppAlerts({ language, error, message }: Props) {
  const t = translations[language] || translations["bg"];
  if (!error && !message) return null;
  return (
    <div className="alerts-container">
      {error && (
        <div className="alert alert-error">
          <strong>{t.error}</strong> {error}
        </div>
      )}
      {message && <div className="alert alert-success">{message}</div>}
    </div>
  );
}

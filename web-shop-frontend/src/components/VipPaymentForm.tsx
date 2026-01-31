import type { FormEvent } from "react";
import { translations, type Language } from "../translations";

type VipPaymentFormProps = {
  itemId: number;
  amount: number;
  language: Language;
  onPaymentComplete: () => void;
  onCancel: () => void;
  error: string | null;
};

export function VipPaymentForm({
  itemId: _itemId,
  amount,
  language,
  onPaymentComplete,
  onCancel,
  error,
}: VipPaymentFormProps) {
  const t = translations[language] || translations["bg"];

  const handlePayment = async (e: FormEvent) => {
    e.preventDefault();
    // Симулация на плащане - в реална система тук ще има интеграция с платежен процесор
    // За сега просто приемаме плащането като успешно
    onPaymentComplete();
  };

  return (
    <div className="payment-modal" style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    }}>
      <div className="payment-form" style={{
        backgroundColor: "white",
        padding: "32px",
        borderRadius: "12px",
        maxWidth: "500px",
        width: "90%",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
      }}>
        <h2 style={{ marginTop: 0 }}>
          {language === "bg" ? "Плащане за VIP статус" : language === "en" ? "VIP Status Payment" : "Оплата VIP статуса"}
        </h2>
        
        {error && (
          <div className="error-message" style={{
            backgroundColor: "#fee2e2",
            color: "#991b1b",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "16px",
          }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: "24px" }}>
          <p style={{ fontSize: "16px", marginBottom: "8px" }}>
            {language === "bg" ? "Сума за плащане:" : language === "en" ? "Amount to pay:" : "Сумма к оплате:"}
          </p>
          <p style={{ fontSize: "32px", fontWeight: "bold", color: "#2563eb", margin: 0 }}>
            {amount.toFixed(2)} €
          </p>
        </div>

        <form onSubmit={handlePayment}>
          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              {language === "bg" ? "Начин на плащане:" : language === "en" ? "Payment method:" : "Способ оплаты:"}
            </label>
            <select
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "16px",
              }}
              defaultValue="card"
            >
              <option value="card">
                {language === "bg" ? "Карта" : language === "en" ? "Card" : "Карта"}
              </option>
              <option value="bank_transfer">
                {language === "bg" ? "Банков път" : language === "en" ? "Bank Transfer" : "Банковский перевод"}
              </option>
            </select>
          </div>

          <div style={{
            backgroundColor: "#f3f4f6",
            padding: "16px",
            borderRadius: "8px",
            marginBottom: "24px",
            fontSize: "14px",
            color: "#6b7280",
          }}>
            {language === "bg" 
              ? "За демонстрационни цели, плащането се приема автоматично. В реална система тук ще има интеграция с платежен процесор (Stripe, PayPal и др.)."
              : language === "en"
              ? "For demonstration purposes, payment is automatically accepted. In a real system, this would integrate with a payment processor (Stripe, PayPal, etc.)."
              : "В демонстрационных целях платеж принимается автоматически. В реальной системе здесь будет интеграция с платежным процессором (Stripe, PayPal и др.)."}
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                flex: 1,
                padding: "12px 24px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                backgroundColor: "white",
                color: "#374151",
                fontSize: "16px",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: "12px 24px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#2563eb",
                color: "white",
                fontSize: "16px",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              {language === "bg" ? "Плати 2€" : language === "en" ? "Pay €2" : "Оплатить 2€"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState, type FormEvent } from "react";
import { translations, type Language } from "../translations";

type VipPaymentFormProps = {
  itemId: number;
  amount: number;
  language: Language;
  onPaymentComplete: (cardNumber: string, cardHolder: string, expiryDate: string, cvv: string) => Promise<void>;
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
  
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Валидиране на картата - трябва да е валидна карта
  const validateCard = (cardNum: string): boolean => {
    // Премахни всички интервали и тирета
    const cleaned = cardNum.replace(/\s+/g, "").replace(/-/g, "");
    
    // Проверка за Luhn алгоритъм (базова валидация)
    if (cleaned.length < 13 || cleaned.length > 19) {
      return false;
    }
    
    let sum = 0;
    let isEven = false;
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  };

  const handlePayment = async (e: FormEvent) => {
    e.preventDefault();
    
    console.log("handlePayment called, isProcessing:", isProcessing);
    
    // Ако вече се обработва, не прави нищо
    if (isProcessing) {
      console.log("Already processing, returning");
      return;
    }
    
    setFormError(null);
    setIsProcessing(true);
    
    try {
      console.log("Starting validation...");
      // Валидация на картата
      const cleanedCardNumber = cardNumber.replace(/\s+/g, "").replace(/-/g, "");
      console.log("Cleaned card number length:", cleanedCardNumber.length);
      
      if (!cleanedCardNumber || cleanedCardNumber.length < 13) {
        console.log("Card number too short");
        setFormError(language === "bg" ? "Моля, въведете валиден номер на карта" : language === "en" ? "Please enter a valid card number" : "Пожалуйста, введите действительный номер карты");
        setIsProcessing(false);
        return;
      }
      
      const isValidCard = validateCard(cleanedCardNumber);
      console.log("Card validation result:", isValidCard);
      if (!isValidCard) {
        setFormError(language === "bg" ? "Невалиден номер на карта. Моля, проверете номера." : language === "en" ? "Invalid card number. Please check the number." : "Недействительный номер карты. Пожалуйста, проверьте номер.");
        setIsProcessing(false);
        return;
      }
      
      if (!cardHolder.trim()) {
        console.log("Cardholder name missing");
        setFormError(language === "bg" ? "Моля, въведете името на картодържателя" : language === "en" ? "Please enter cardholder name" : "Пожалуйста, введите имя держателя карты");
        setIsProcessing(false);
        return;
      }
      
      if (!expiryDate.trim() || !/^\d{2}\/\d{2}$/.test(expiryDate)) {
        console.log("Invalid expiry date:", expiryDate);
        setFormError(language === "bg" ? "Моля, въведете валидна дата на изтичане (MM/YY)" : language === "en" ? "Please enter a valid expiry date (MM/YY)" : "Пожалуйста, введите действительную дату истечения (ММ/ГГ)");
        setIsProcessing(false);
        return;
      }
      
      if (!cvv.trim() || cvv.length < 3 || cvv.length > 4) {
        console.log("Invalid CVV:", cvv);
        setFormError(language === "bg" ? "Моля, въведете валиден CVV код" : language === "en" ? "Please enter a valid CVV code" : "Пожалуйста, введите действительный CVV код");
        setIsProcessing(false);
        return;
      }
      
      console.log("All validations passed, calling onPaymentComplete...");
      // Симулация на плащане - в реална система тук ще има интеграция с платежен процесор (Stripe, PayPal и др.)
      // За сега просто приемаме плащането като успешно ако картата е валидна
      await onPaymentComplete(cleanedCardNumber, cardHolder.trim(), expiryDate.trim(), cvv.trim());
      console.log("onPaymentComplete finished successfully");
    } catch (err) {
      console.error("Payment error:", err);
      setFormError(language === "bg" 
        ? `Грешка при обработка на плащането: ${err}` 
        : language === "en" 
        ? `Error processing payment: ${err}`
        : `Ошибка обработки платежа: ${err}`);
      setIsProcessing(false);
    }
  };
  
  // Форматиране на номера на картата (добавяне на интервали всеки 4 цифри)
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s+/g, "");
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
    return formatted.substring(0, 19); // Максимум 16 цифри + 3 интервала
  };
  
  // Форматиране на датата на изтичане (MM/YY)
  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + "/" + cleaned.substring(2, 4);
    }
    return cleaned;
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
      pointerEvents: "auto",
    }} onClick={(e) => {
      // Затвори модала при клик извън формата (само ако не се обработва)
      if (!isProcessing && e.target === e.currentTarget) {
        onCancel();
      }
    }}>
      <div className="payment-form" style={{
        backgroundColor: "white",
        padding: "32px",
        borderRadius: "12px",
        maxWidth: "500px",
        width: "90%",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        pointerEvents: "auto",
      }} onClick={(e) => {
        // Спре разпространението на клика, за да не се затваря формата при клик върху нея
        e.stopPropagation();
      }}>
        <h2 style={{ marginTop: 0 }}>
          {language === "bg" ? "Плащане за VIP статус" : language === "en" ? "VIP Status Payment" : "Оплата VIP статуса"}
        </h2>
        
        {(error || formError) && (
          <div className="error-message" style={{
            backgroundColor: "#fee2e2",
            color: "#991b1b",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "16px",
          }}>
            {error || formError}
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
          <div style={{
            backgroundColor: "#fef3c7",
            border: "1px solid #f59e0b",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "16px",
            fontSize: "14px",
            color: "#92400e",
          }}>
            {language === "bg" 
              ? "⚠️ За VIP статус плащането трябва да бъде с карта. Моля, попълнете данните на картата."
              : language === "en"
              ? "⚠️ For VIP status, payment must be made with a card. Please enter your card details."
              : "⚠️ Для VIP статуса оплата должна производиться картой. Пожалуйста, введите данные карты."}
          </div>

          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              {language === "bg" ? "Номер на карта:" : language === "en" ? "Card Number:" : "Номер карты:"} *
            </label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => {
                const formatted = formatCardNumber(e.target.value);
                setCardNumber(formatted);
              }}
              placeholder={language === "bg" ? "1234 5678 9012 3456" : language === "en" ? "1234 5678 9012 3456" : "1234 5678 9012 3456"}
              maxLength={19}
              required
              disabled={isProcessing}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "16px",
                backgroundColor: isProcessing ? "#f3f4f6" : "white",
                cursor: isProcessing ? "not-allowed" : "text",
              }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              {language === "bg" ? "Име на картодържателя:" : language === "en" ? "Cardholder Name:" : "Имя держателя карты:"} *
            </label>
            <input
              type="text"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
              placeholder={language === "bg" ? "ИВАН ИВАНОВ" : language === "en" ? "JOHN DOE" : "ИВАН ИВАНОВ"}
              required
              disabled={isProcessing}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "16px",
                backgroundColor: isProcessing ? "#f3f4f6" : "white",
                cursor: isProcessing ? "not-allowed" : "text",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                {language === "bg" ? "Дата на изтичане:" : language === "en" ? "Expiry Date:" : "Срок действия:"} *
              </label>
              <input
                type="text"
                value={expiryDate}
                onChange={(e) => {
                  const formatted = formatExpiryDate(e.target.value);
                  setExpiryDate(formatted);
                }}
                placeholder="MM/YY"
                maxLength={5}
                required
                disabled={isProcessing}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  fontSize: "16px",
                  backgroundColor: isProcessing ? "#f3f4f6" : "white",
                  cursor: isProcessing ? "not-allowed" : "text",
                }}
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                CVV *
              </label>
              <input
                type="text"
                value={cvv}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, "");
                  setCvv(cleaned.substring(0, 4));
                }}
                placeholder="123"
                maxLength={4}
                required
                disabled={isProcessing}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  fontSize: "16px",
                  backgroundColor: isProcessing ? "#f3f4f6" : "white",
                  cursor: isProcessing ? "not-allowed" : "text",
                }}
              />
            </div>
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
              ? "За демонстрационни цели, плащането се приема автоматично след валидация на картата. В реална система тук ще има интеграция с платежен процесор (Stripe, PayPal и др.)."
              : language === "en"
              ? "For demonstration purposes, payment is automatically accepted after card validation. In a real system, this would integrate with a payment processor (Stripe, PayPal, etc.)."
              : "В демонстрационных целях платеж принимается автоматически после проверки карты. В реальной системе здесь будет интеграция с платежным процессором (Stripe, PayPal и др.)."}
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
              disabled={isProcessing}
              style={{
                flex: 1,
                padding: "12px 24px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: isProcessing ? "#9ca3af" : "#2563eb",
                color: "white",
                fontSize: "16px",
                fontWeight: "500",
                cursor: isProcessing ? "not-allowed" : "pointer",
                opacity: isProcessing ? 0.7 : 1,
              }}
            >
              {isProcessing 
                ? (language === "bg" ? "Обработва се..." : language === "en" ? "Processing..." : "Обработка...")
                : (language === "bg" ? "Готово" : language === "en" ? "Complete Payment" : "Готово")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

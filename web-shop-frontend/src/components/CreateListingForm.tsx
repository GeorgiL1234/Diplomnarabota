import { useRef, useEffect, useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { CATEGORIES } from "../types";
import { translations, getCategoryLabel, type Language } from "../translations";

type CreateListingFormProps = {
  show: boolean;
  title: string;
  description: string;
  price: string;
  category: string;
  contactEmail: string;
  contactPhone: string;
  contactPhonePrefilled?: boolean;
  paymentMethod: string;
  isVip: boolean;
  language: Language;
  file: File | null;
  isCreating?: boolean;
  loggedInEmail?: string | null;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (desc: string) => void;
  onPriceChange: (price: string) => void;
  onCategoryChange: (cat: string) => void;
  onContactEmailChange: (email: string) => void;
  onContactPhoneChange: (phone: string) => void;
  onPaymentMethodChange: (method: string) => void;
  onVipChange: (isVip: boolean) => void;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: FormEvent) => void;
};

export function CreateListingForm({
  show,
  title,
  description,
  price,
  category,
  contactEmail,
  contactPhone,
  contactPhonePrefilled,
  paymentMethod,
  isVip,
  language,
  file,
  isCreating,
  onTitleChange,
  onDescriptionChange,
  onPriceChange,
  onCategoryChange,
  onContactEmailChange,
  onContactPhoneChange,
  onPaymentMethodChange,
  onVipChange,
  onFileChange,
  onSubmit,
  loggedInEmail,
}: CreateListingFormProps) {
  if (!show) return null;
  const t = translations[language] || translations["bg"];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [file]);

  return (
    <form onSubmit={onSubmit} className="create-listing-form">
      <div className="form-header-icon">➕</div>
      <h3>{t.createNewListing}</h3>
      <div className="form-group">
        <label>{t.title}</label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          required
          disabled={isCreating}
        />
      </div>
      <div className="form-group">
        <label>{t.description} * ({language === "bg" ? "мин. 40 символа" : language === "en" ? "min 40 chars" : "мин. 40 символов"})</label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          required
          minLength={40}
          rows={3}
          disabled={isCreating}
          placeholder={language === "bg" ? "Опишете подробно продукта (минимум 40 символа)..." : language === "en" ? "Describe the product in detail (min 40 characters)..." : "Опишите продукт подробно (минимум 40 символов)..."}
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>{t.price}</label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => onPriceChange(e.target.value)}
            required
            disabled={isCreating}
          />
        </div>
        <div className="form-group">
          <label>{t.category}</label>
          <select value={category} onChange={(e) => onCategoryChange(e.target.value)} disabled={isCreating}>
            {CATEGORIES.filter((c) => c !== "Всички").map((cat) => (
              <option key={cat} value={cat}>
                {getCategoryLabel(cat, t)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-row">
        <p style={{ width: "100%", fontSize: "12px", color: "#64748b", marginBottom: "8px", fontStyle: "italic" }}>
          {t.contactRequired}
        </p>
        <div className="form-group">
          <label>{t.contactEmail}</label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => onContactEmailChange(e.target.value)}
            placeholder="email@example.com"
            disabled={isCreating}
          />
          {loggedInEmail && (
            <p style={{ fontSize: "11px", color: "var(--success)", marginTop: "4px", marginBottom: 0 }}>
              {language === "bg" ? "Попълнено от вашия акаунт" : language === "en" ? "Filled from your account" : "Заполнено из вашего аккаунта"}
            </p>
          )}
        </div>
        <div className="form-group">
          <label>{t.contactPhone}</label>
          <input
            type="tel"
            value={contactPhone}
            onChange={(e) => onContactPhoneChange(e.target.value)}
            placeholder="+359 888 123 456"
            disabled={isCreating}
          />
          {contactPhonePrefilled && (
            <p style={{ fontSize: "11px", color: "var(--success)", marginTop: "4px", marginBottom: 0 }}>
              {language === "bg" ? "Запомнено от предишна обява" : language === "en" ? "Saved from previous listing" : "Сохранено из предыдущего объявления"}
            </p>
          )}
        </div>
      </div>
      <div className="form-group">
        <label>{t.paymentMethod}</label>
        <select value={paymentMethod} onChange={(e) => onPaymentMethodChange(e.target.value)} disabled={isCreating}>
          <option value="cash_on_delivery">{t.paymentCashOnDelivery}</option>
          <option value="bank_transfer">{t.paymentBankTransfer}</option>
        </select>
      </div>
      <div className="form-group vip-checkbox-group">
        <label className="vip-checkbox-label">
          <input
            type="checkbox"
            checked={isVip}
            onChange={(e) => onVipChange(e.target.checked)}
            disabled={isCreating}
            className="vip-checkbox-input"
          />
          <span>{t.makeVip}</span>
        </label>
      </div>
      <div className="form-group">
        <label>{t.image} *</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onFileChange}
          required
          disabled={isCreating}
          className="file-input-hidden"
        />
        <div
          className={`file-picker ${file ? "file-picker-has-file" : ""} ${isCreating ? "file-picker-disabled" : ""}`}
          onClick={() => !isCreating && fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && !isCreating && fileInputRef.current?.click()}
          aria-label={t.chooseImage}
        >
          {file && previewUrl ? (
            <>
              <div className="file-picker-preview">
                <img src={previewUrl} alt="" />
              </div>
              <div className="file-picker-info">
                <span className="file-picker-name">{file.name}</span>
                <span className="file-picker-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                <span className="file-picker-action">{t.changeImage}</span>
              </div>
            </>
          ) : (
            <>
              <span className="file-picker-icon">🖼️</span>
              <span className="file-picker-text">{t.chooseImage}</span>
            </>
          )}
        </div>
        <p className="file-picker-hint">{t.maxFileSize}</p>
      </div>
      <button type="submit" className={`btn-primary ${isCreating ? "btn-loading" : ""}`} disabled={isCreating}>
        {isCreating ? (
          <>
            <span className="btn-icon spinning">⏳</span>
            {language === "bg" ? "Създава се..." : language === "en" ? "Creating..." : "Создание..."}
          </>
        ) : (
          <>
            <span className="btn-icon">✨</span>
            {t.submitListing}
          </>
        )}
      </button>
    </form>
  );
}

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
  files: File[];
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
  onFilesChange: (e: ChangeEvent<HTMLInputElement>) => void;
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
  files,
  isCreating,
  onTitleChange,
  onDescriptionChange,
  onPriceChange,
  onCategoryChange,
  onContactEmailChange,
  onContactPhoneChange,
  onPaymentMethodChange,
  onVipChange,
  onFilesChange,
  onSubmit,
  loggedInEmail,
}: CreateListingFormProps) {
  if (!show) return null;
  const t = translations[language] || translations["bg"];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    if (files.length > 0) {
      const urls = files.map((f) => URL.createObjectURL(f));
      setPreviewUrls(urls);
      return () => urls.forEach((u) => URL.revokeObjectURL(u));
    }
    setPreviewUrls([]);
  }, [files]);

  return (
    <form onSubmit={onSubmit} className="create-listing-form">
      <div className="form-header-icon">➕</div>
      <h3>{t.createNewListing}</h3>
      <div className="form-group">
        <label htmlFor="create-title">{t.title}</label>
        <input
          id="create-title"
          name="title"
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          required
          disabled={isCreating}
        />
      </div>
      <div className="form-group">
        <label htmlFor="create-description">{t.description} * ({language === "bg" ? "мин. 40 символа" : language === "en" ? "min 40 chars" : "мин. 40 символов"})</label>
        <textarea
          id="create-description"
          name="description"
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
          <label htmlFor="create-price">{t.price}</label>
          <input
            id="create-price"
            name="price"
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => onPriceChange(e.target.value)}
            required
            disabled={isCreating}
          />
        </div>
        <div className="form-group">
          <label htmlFor="create-category">{t.category}</label>
          <select id="create-category" name="category" value={category} onChange={(e) => onCategoryChange(e.target.value)} disabled={isCreating}>
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
          <label htmlFor="create-contactEmail">{t.contactEmail}</label>
          <input
            id="create-contactEmail"
            name="contactEmail"
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
          <label htmlFor="create-contactPhone">{t.contactPhone}</label>
          <input
            id="create-contactPhone"
            name="contactPhone"
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
        <label htmlFor="create-paymentMethod">{t.paymentMethod}</label>
        <select id="create-paymentMethod" name="paymentMethod" value={paymentMethod} onChange={(e) => onPaymentMethodChange(e.target.value)} disabled={isCreating}>
          <option value="cash_on_delivery">{t.paymentCashOnDelivery}</option>
          <option value="bank_transfer">{t.paymentBankTransfer}</option>
        </select>
      </div>
      <div className="form-group vip-checkbox-group">
        <label htmlFor="create-isVip" className="vip-checkbox-label">
          <input
            id="create-isVip"
            name="isVip"
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
        <label htmlFor="create-image">{t.image} * ({language === "bg" ? "до 5 снимки" : language === "en" ? "up to 5 images" : "до 5 фото"})</label>
        <input
          id="create-image"
          name="image"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={onFilesChange}
          required
          disabled={isCreating}
          className="file-input-hidden"
        />
        <div
          className={`file-picker ${files.length ? "file-picker-has-file" : ""} ${isCreating ? "file-picker-disabled" : ""}`}
          onClick={() => !isCreating && fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && !isCreating && fileInputRef.current?.click()}
          aria-label={t.chooseImage}
        >
          {files.length > 0 && previewUrls.length > 0 ? (
            <>
              <div className="file-picker-preview-grid">
                {previewUrls.slice(0, 5).map((url, i) => (
                  <div key={i} className="file-picker-preview-thumb">
                    <img src={url} alt="" />
                  </div>
                ))}
              </div>
              <div className="file-picker-info">
                <span className="file-picker-name">{files.length} {language === "bg" ? "снимки" : language === "en" ? "images" : "фото"}</span>
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

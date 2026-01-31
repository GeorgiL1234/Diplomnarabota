import type { FormEvent, ChangeEvent } from "react";
import { CATEGORIES } from "../types";
import { translations, type Language } from "../translations";

type CreateListingFormProps = {
  show: boolean;
  title: string;
  description: string;
  price: string;
  category: string;
  contactEmail: string;
  contactPhone: string;
  paymentMethod: string;
  isVip: boolean;
  language: Language;
  file: File | null;
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
  paymentMethod,
  isVip,
  language,
  file,
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
}: CreateListingFormProps) {
  if (!show) return null;
  const t = translations[language] || translations["bg"];

  return (
    <form onSubmit={onSubmit} className="create-listing-form">
      <h3>{t.createNewListing}</h3>
      <div className="form-group">
        <label>{t.title}</label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label>{t.description}</label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          required
          rows={3}
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
          />
        </div>
        <div className="form-group">
          <label>{t.category}</label>
          <select value={category} onChange={(e) => onCategoryChange(e.target.value)}>
            {CATEGORIES.filter((c) => c !== "Всички").map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>{t.contactEmail}</label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => onContactEmailChange(e.target.value)}
            placeholder="email@example.com"
          />
        </div>
        <div className="form-group">
          <label>{t.contactPhone}</label>
          <input
            type="tel"
            value={contactPhone}
            onChange={(e) => onContactPhoneChange(e.target.value)}
            placeholder="+359 888 123 456"
          />
        </div>
      </div>
      <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "16px", fontStyle: "italic" }}>
        {t.contactRequired}
      </p>
      <div className="form-group">
        <label>{t.paymentMethod}</label>
        <select value={paymentMethod} onChange={(e) => onPaymentMethodChange(e.target.value)}>
          <option value="cash_on_delivery">{t.paymentCashOnDelivery}</option>
          <option value="bank_transfer">{t.paymentBankTransfer}</option>
        </select>
      </div>
      <div className="form-group">
        <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input
            type="checkbox"
            checked={isVip}
            onChange={(e) => onVipChange(e.target.checked)}
          />
          <span>{t.makeVip}</span>
        </label>
      </div>
      <div className="form-group">
        <label>{t.image} *</label>
        <input type="file" accept="image/*" onChange={onFileChange} required />
        {file && (
          <p style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
            {t.selected}: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
        <p style={{ fontSize: "11px", color: "#9ca3af", marginTop: "4px", marginBottom: 0 }}>
          Максимален размер: 20MB
        </p>
      </div>
      <button type="submit" className="btn-primary">
        {t.submitListing}
      </button>
    </form>
  );
}

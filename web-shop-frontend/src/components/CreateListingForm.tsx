import type { FormEvent, ChangeEvent } from "react";
import { CATEGORIES } from "../types";

type CreateListingFormProps = {
  show: boolean;
  title: string;
  description: string;
  price: string;
  category: string;
  contactEmail: string;
  contactPhone: string;
  paymentMethod: string;
  file: File | null;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (desc: string) => void;
  onPriceChange: (price: string) => void;
  onCategoryChange: (cat: string) => void;
  onContactEmailChange: (email: string) => void;
  onContactPhoneChange: (phone: string) => void;
  onPaymentMethodChange: (method: string) => void;
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
  file,
  onTitleChange,
  onDescriptionChange,
  onPriceChange,
  onCategoryChange,
  onContactEmailChange,
  onContactPhoneChange,
  onPaymentMethodChange,
  onFileChange,
  onSubmit,
}: CreateListingFormProps) {
  if (!show) return null;

  return (
    <form onSubmit={onSubmit} className="create-listing-form">
      <h3>Създай нова обява</h3>
      <div className="form-group">
        <label>Заглавие:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label>Описание:</label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          required
          rows={3}
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Цена (лв.):</label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => onPriceChange(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Категория:</label>
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
          <label>Контакт Email:</label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => onContactEmailChange(e.target.value)}
            placeholder="email@example.com"
          />
        </div>
        <div className="form-group">
          <label>Контакт Телефон:</label>
          <input
            type="tel"
            value={contactPhone}
            onChange={(e) => onContactPhoneChange(e.target.value)}
            placeholder="+359 888 123 456"
          />
        </div>
      </div>
      <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "16px", fontStyle: "italic" }}>
        * Трябва да посочите поне email или телефон за контакт
      </p>
      <div className="form-group">
        <label>Начин на плащане:</label>
        <select value={paymentMethod} onChange={(e) => onPaymentMethodChange(e.target.value)}>
          <option value="card">Карта</option>
          <option value="cash">Кеш</option>
        </select>
      </div>
      <div className="form-group">
        <label>Снимка *</label>
        <input type="file" accept="image/*" onChange={onFileChange} required />
        {file && (
          <p style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
            Избрано: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
        <p style={{ fontSize: "11px", color: "#9ca3af", marginTop: "4px", marginBottom: 0 }}>
          Максимален размер: 20MB
        </p>
      </div>
      <button type="submit" className="btn-primary">
        Създай обява
      </button>
    </form>
  );
}

import { useState, useEffect } from "react";
import type { FormEvent, ChangeEvent } from "react";
import type { Item, Review } from "../types";
import type { Language } from "../translations";
import { translations } from "../translations";
import { getDisplayImageUrl, API_BASE } from "../config";

type ItemDetailProps = {
  item: Item;
  reviews: Review[];
  loggedInEmail: string | null;
  language: Language;
  favoriteItemIds: Set<number>;
  showOrderForm: boolean;
  paymentMethod: string;
  deliveryMethod: string;
  deliveryAddress: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  reviewRating: number;
  reviewComment: string;
  file: File | null;
  onBack: () => void;
  onAddToFavorites: (itemId: number) => void;
  onRemoveFromFavorites: (itemId: number) => void;
  onActivateVip: (itemId: number) => void;
  onToggleOrderForm: () => void;
  onPaymentMethodChange: (method: string) => void;
  onDeliveryMethodChange: (method: string) => void;
  onDeliveryAddressChange: (address: string) => void;
  onCustomerNameChange: (name: string) => void;
  onCustomerPhoneChange: (phone: string) => void;
  onCustomerEmailChange: (email: string) => void;
  onCreateOrder: (e: FormEvent) => void;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => void;
  onReviewRatingChange: (rating: number) => void;
  onReviewCommentChange: (comment: string) => void;
  onAddReview: (e: FormEvent) => void;
  onGoToMessages: () => void;
};

export function ItemDetail({
  item,
  reviews,
  loggedInEmail,
  language,
  favoriteItemIds,
  showOrderForm,
  paymentMethod,
  deliveryMethod,
  deliveryAddress,
  customerName,
  customerPhone,
  customerEmail,
  reviewRating,
  reviewComment,
  file,
  onBack,
  onAddToFavorites,
  onRemoveFromFavorites,
  onActivateVip,
  onToggleOrderForm,
  onPaymentMethodChange,
  onDeliveryMethodChange,
  onDeliveryAddressChange,
  onCustomerNameChange,
  onCustomerPhoneChange,
  onCustomerEmailChange,
  onCreateOrder,
  onFileChange,
  onUpload,
  onReviewRatingChange,
  onReviewCommentChange,
  onAddReview,
  onGoToMessages,
}: ItemDetailProps) {
  const t = translations[language];
  const placeholderSvg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f1f5f9' width='400' height='300'/%3E%3Ctext fill='%2394a3b8' font-family='sans-serif' font-size='24' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3E🖼️%3C/text%3E%3C/svg%3E";

  const initialSrc = item?.imageUrl ? getDisplayImageUrl(item.imageUrl, item.id ?? undefined) : (item?.id ? `${API_BASE}/items/${item.id}/image/raw?t=${Date.now()}` : null);
  const [imageSrc, setImageSrc] = useState<string>(initialSrc || placeholderSvg);
  const dataUriFallback = item?.imageUrl?.startsWith("data:") && (item.imageUrl?.length ?? 0) < 500000 ? item.imageUrl : null;

  useEffect(() => {
    const src = item?.imageUrl ? getDisplayImageUrl(item.imageUrl, item.id ?? undefined) : (item?.id ? `${API_BASE}/items/${item.id}/image/raw?t=${Date.now()}` : null);
    if (src) setImageSrc(src);
    else setImageSrc(placeholderSvg);
  }, [item?.id, item?.imageUrl]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (!img) return;
    if (dataUriFallback && dataUriFallback.length < 500000) {
      setImageSrc(dataUriFallback);
      return;
    }
    if ((imageSrc.includes("/image/raw") || imageSrc.includes("/image")) && item?.id) {
      fetch(`${API_BASE}/items/${item.id}/image?t=${Date.now()}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (!img.isConnected) return;
          if (!data?.imageUrl) {
            setImageSrc(placeholderSvg);
            return;
          }
          if (data.imageUrl.startsWith("http")) {
            setImageSrc(data.imageUrl);
          } else if (data.imageUrl.startsWith("data:") && data.imageUrl.length < 500000) {
            setImageSrc(data.imageUrl);
          } else {
            setImageSrc(placeholderSvg);
          }
        })
        .catch(() => { if (img.isConnected) setImageSrc(placeholderSvg); });
    } else {
      setImageSrc(placeholderSvg);
    }
  };

  return (
    <section className="detail-view-section" key={`detail-${item.id}`}>
      <div className="detail-view-container">
        <button className="btn-back" onClick={onBack}>
          {t.backToListings}
        </button>
        <div className="item-details-full">
          {/* Снимка на обявата – винаги показваме (снимка или placeholder) */}
          <div className="item-detail-image-wrapper" style={{ marginBottom: "20px", borderRadius: "12px", overflow: "hidden", maxWidth: "100%", aspectRatio: "16/10", background: "#f1f5f9" }}>
            <img
              src={imageSrc}
              alt={item.title || ""}
              className="item-detail-image"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
              onError={handleImageError}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <h2 style={{ margin: 0 }}>{item.title || ""}</h2>
            {item.isVip && (
              <div className="vip-badge" style={{ fontSize: "14px", padding: "4px 12px" }}>
                ВИП
              </div>
            )}
          </div>
          {item.category && <span className="item-category-badge">{item.category}</span>}
          <p className="item-detail-description">{item.description || ""}</p>
          <p className="item-detail-price">
            <strong>
              {t.priceLabel} {Number(item?.price ?? 0).toFixed(2)} {t.currency}
            </strong>
          </p>

          {/* Бутон за добавяне към любими */}
          {item?.ownerEmail && item.ownerEmail !== loggedInEmail && (
            <div style={{ marginBottom: "16px" }}>
              {favoriteItemIds.has(item.id ?? 0) ? (
                <button
                  className="btn-secondary"
                  onClick={() => onRemoveFromFavorites(item.id)}
                >
                  {t.removeFromFavorites}
                </button>
              ) : (
                <button className="btn-secondary" onClick={() => onAddToFavorites(item.id)}>
                  {t.addToFavorites}
                </button>
              )}
            </div>
          )}

          {/* Бутон за активиране на VIP */}
          {item.ownerEmail && item.ownerEmail === loggedInEmail && !item.isVip && (
            <div style={{ marginBottom: "16px" }}>
              <button className="btn-primary" onClick={() => onActivateVip(item.id)}>
                {t.activateVip} (2 {t.currency})
              </button>
            </div>
          )}

          {/* Бутон за поръчка */}
          {item.ownerEmail && item.ownerEmail !== loggedInEmail && (
            <div className="order-section">
              <button className="btn-primary btn-order" onClick={onToggleOrderForm}>
                {showOrderForm ? t.cancelOrder : t.orderButton}
              </button>
            </div>
          )}

          {/* Форма за поръчка */}
          {showOrderForm && item.ownerEmail && item.ownerEmail !== loggedInEmail && (
            <form onSubmit={onCreateOrder} className="order-form">
              <h3>{t.orderTitle}</h3>
              
              {/* Лична информация */}
              <div className="form-group">
                <label htmlFor="order-customerName">{language === "bg" ? "Име:" : language === "en" ? "Full Name:" : "Имя:"} *</label>
                <input
                  id="order-customerName"
                  name="customerName"
                  type="text"
                  value={customerName}
                  onChange={(e) => onCustomerNameChange(e.target.value)}
                  placeholder={language === "bg" ? "Иван Иванов" : language === "en" ? "John Doe" : "Иван Иванов"}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="order-customerPhone">{language === "bg" ? "Телефон:" : language === "en" ? "Phone:" : "Телефон:"} *</label>
                <input
                  id="order-customerPhone"
                  name="customerPhone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => onCustomerPhoneChange(e.target.value)}
                  placeholder={language === "bg" ? "+359 888 123 456" : language === "en" ? "+1 234 567 8900" : "+7 123 456 7890"}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="order-customerEmail">{language === "bg" ? "Email:" : language === "en" ? "Email:" : "Email:"} *</label>
                <input
                  id="order-customerEmail"
                  name="customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => onCustomerEmailChange(e.target.value)}
                  placeholder={language === "bg" ? "email@example.com" : language === "en" ? "email@example.com" : "email@example.com"}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="order-paymentMethod">{t.paymentMethod}</label>
                <select
                  id="order-paymentMethod"
                  name="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => onPaymentMethodChange(e.target.value)}
                  required
                >
                  <option value="">{t.paymentMethod}</option>
                  <option value="bank_transfer">{t.paymentBankTransfer}</option>
                  <option value="cash_on_delivery">{t.paymentCashOnDelivery}</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="order-deliveryCourier">{t.deliveryCourier}</label>
                <select
                  id="order-deliveryCourier"
                  name="deliveryCourier"
                  value={(deliveryMethod && deliveryMethod.includes("_")) ? deliveryMethod.split("_")[0] : deliveryMethod || ""}
                  onChange={(e) => {
                    const courier = e.target.value;
                    if (courier) {
                      const prevType = deliveryMethod.includes("office") ? "office" : "address";
                      onDeliveryMethodChange(courier + "_" + (deliveryMethod.startsWith(courier) ? prevType : "address"));
                    } else {
                      onDeliveryMethodChange("");
                    }
                  }}
                  required
                >
                  <option value="">{t.deliveryCourier}</option>
                  <option value="speedy">{t.deliverySpeedy}</option>
                  <option value="econt">{t.deliveryEcont}</option>
                </select>
              </div>
              {deliveryMethod && (deliveryMethod.startsWith("speedy") || deliveryMethod.startsWith("econt")) && (
                <div className="form-group">
                  <label htmlFor="order-deliveryType">{t.deliveryType}</label>
                  <select
                    id="order-deliveryType"
                    name="deliveryType"
                    value={deliveryMethod.includes("office") ? "office" : "address"}
                    onChange={(e) => {
                      const type = e.target.value;
                      const courier = deliveryMethod.split("_")[0] || "speedy";
                      onDeliveryMethodChange(courier + "_" + type);
                    }}
                    required
                  >
                    <option value="address">{t.deliveryToAddress}</option>
                    <option value="office">{t.deliveryToOffice}</option>
                  </select>
                </div>
              )}
              <p className="delivery-note">{t.deliveryNote}</p>
              <div className="form-group">
                <label htmlFor="order-deliveryAddress">{deliveryMethod.includes("office") ? t.deliveryOfficeInfo : t.deliveryAddress}</label>
                <textarea
                  id="order-deliveryAddress"
                  name="deliveryAddress"
                  value={deliveryAddress}
                  onChange={(e) => onDeliveryAddressChange(e.target.value)}
                  placeholder={deliveryMethod.includes("office") ? t.deliveryOfficePlaceholder : t.deliveryAddressPlaceholder}
                  rows={3}
                  required
                />
              </div>
              <button type="submit" className="btn-primary">
                {t.submitOrder}
              </button>
            </form>
          )}

          {/* Контактна информация */}
          <div className="contact-section">
            <h3>{t.contactTitle}</h3>
            <div className="contact-info-wrapper">
              {item.contactEmail ? (
                <div className="contact-item">
                  <span className="contact-icon">📧</span>
                  <div className="contact-details">
                    <span className="contact-label">{t.contactEmailLabel}</span>
                    <a href={`mailto:${item.contactEmail}`} className="contact-value">
                      {item.contactEmail}
                    </a>
                  </div>
                </div>
              ) : null}
              {item.contactPhone ? (
                <div className="contact-item">
                  <span className="contact-icon">📱</span>
                  <div className="contact-details">
                    <span className="contact-label">{t.contactPhoneLabel}</span>
                    <a href={`tel:${item.contactPhone}`} className="contact-value">
                      {item.contactPhone}
                    </a>
                  </div>
                </div>
              ) : null}
              {!item.contactEmail && !item.contactPhone && (
                <p className="contact-empty">{t.noContactInfo}</p>
              )}
            </div>
          </div>

          {/* Качване на снимка */}
          {item.ownerEmail && item.ownerEmail === loggedInEmail && (
            <div className="upload-section">
              <label htmlFor="detail-upload-image">
                <h3>{t.uploadImage}</h3>
              </label>
              <input id="detail-upload-image" name="image" type="file" accept="image/*" onChange={onFileChange} aria-label={t.uploadImage} />
              <button className="btn-secondary" onClick={onUpload} disabled={!file}>
                {t.upload}
              </button>
            </div>
          )}

          {/* Връзка към страницата за съобщения */}
          <div className="messages-link-section">
            <p className="info-text">
              {item.ownerEmail && item.ownerEmail === loggedInEmail
                ? t.viewMessagesInPage
                : t.askQuestionInMessagesPage}
            </p>
            <button className="btn-secondary" onClick={onGoToMessages}>
              {t.goToMessagesPage}
            </button>
          </div>

          {/* Ревюта */}
          <div className="reviews-section">
            <h3>
              {t.reviews} ({reviews.length})
            </h3>
            {reviews.length === 0 ? (
              <p className="info-text">{t.noReviews}</p>
            ) : (
              <ul className="reviews-list">
                {reviews.map((r) => (
                  <li key={r.id} className="review-item">
                    <div className="review-header">
                      <strong>{r.authorEmail}</strong>
                      <span className="review-rating">⭐ {r.rating}/5</span>
                    </div>
                    <p className="review-comment">{r.comment}</p>
                  </li>
                ))}
              </ul>
            )}

            {item.ownerEmail !== loggedInEmail && (
              <form onSubmit={onAddReview} className="review-form">
                <div className="form-group">
                  <label htmlFor="review-rating">{t.rating}</label>
                  <input
                    id="review-rating"
                    name="rating"
                    type="number"
                    min={1}
                    max={5}
                    value={reviewRating}
                    onChange={(e) => onReviewRatingChange(Number(e.target.value))}
                    className="rating-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="review-comment">{t.comment}</label>
                  <textarea
                    id="review-comment"
                    name="comment"
                    value={reviewComment}
                    onChange={(e) => onReviewCommentChange(e.target.value)}
                    rows={3}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary">
                  {t.addReview}
                </button>
              </form>
            )}
            {item.ownerEmail === loggedInEmail && (
              <p className="info-text">{t.cannotReviewOwn}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

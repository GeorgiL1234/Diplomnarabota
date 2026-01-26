import type { FormEvent, ChangeEvent } from "react";
import type { Item, Review } from "../types";
import type { Language } from "../translations";
import { translations } from "../translations";
import { getImageUrl } from "../config";

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
  onCreateOrder,
  onFileChange,
  onUpload,
  onReviewRatingChange,
  onReviewCommentChange,
  onAddReview,
  onGoToMessages,
}: ItemDetailProps) {
  const t = translations[language];

  return (
    <section className="detail-view-section" key={`detail-${item.id}`}>
      <div className="detail-view-container">
        <button className="btn-back" onClick={onBack}>
          {t.backToListings}
        </button>
        <div className="item-details-full">
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
              {t.priceLabel} {(item.price || 0).toFixed(2)} {t.currency}
            </strong>
          </p>

          {/* Бутон за добавяне към любими */}
          {item.ownerEmail && item.ownerEmail !== loggedInEmail && (
            <div style={{ marginBottom: "16px" }}>
              {favoriteItemIds.has(item.id) ? (
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
              <div className="form-group">
                <label>{t.paymentMethod}</label>
                <select
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
                <label>{t.deliveryMethod}</label>
                <select
                  value={deliveryMethod}
                  onChange={(e) => onDeliveryMethodChange(e.target.value)}
                  required
                >
                  <option value="">{t.deliveryMethod}</option>
                  <option value="speedy">{t.deliverySpeedy}</option>
                  <option value="econt">{t.deliveryEcont}</option>
                </select>
              </div>
              <p className="delivery-note">{t.deliveryNote}</p>
              <div className="form-group">
                <label>{t.deliveryAddress}</label>
                <textarea
                  value={deliveryAddress}
                  onChange={(e) => onDeliveryAddressChange(e.target.value)}
                  placeholder={t.deliveryAddressPlaceholder}
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

          {item.imageUrl && (
            <img
              src={getImageUrl(item.imageUrl)}
              alt={item.title}
              className="item-detail-image"
            />
          )}

          {/* Качване на снимка */}
          {item.ownerEmail && item.ownerEmail === loggedInEmail && (
            <div className="upload-section">
              <h3>{t.uploadImage}</h3>
              <input type="file" onChange={onFileChange} />
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
                  <label>{t.rating}</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={reviewRating}
                    onChange={(e) => onReviewRatingChange(Number(e.target.value))}
                    className="rating-input"
                  />
                </div>
                <div className="form-group">
                  <label>{t.comment}</label>
                  <textarea
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

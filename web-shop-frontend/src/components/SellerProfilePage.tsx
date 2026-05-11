import type { Item, Review } from "../types";
import { ItemCard } from "./ItemCard";
import type { Language } from "../translations";

type Props = {
  sellerEmail: string;
  items: Item[];
  reviews: Review[];
  language: Language;
  onBack: () => void;
  onItemClick: (item: Item) => void;
};

export function SellerProfilePage({ sellerEmail, items, reviews, language, onBack, onItemClick }: Props) {
  const sellerItems = items.filter((item) => (item.ownerEmail || "").toLowerCase() === sellerEmail.toLowerCase());
  const avgRating = reviews.length
    ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length
    : 0;
  const activeItems = sellerItems.filter((item) => !item.sold).length;

  return (
    <section className="listings-section">
      <div className="listings-main seller-profile">
        <button type="button" className="btn-back" onClick={onBack}>Назад</button>
        <div className="seller-hero">
          <div className="seller-avatar">{sellerEmail.slice(0, 1).toUpperCase()}</div>
          <div>
            <p className="seller-eyebrow">Профил на продавач</p>
            <h2>{sellerEmail.split("@")[0]}</h2>
            <p>{sellerEmail}</p>
          </div>
        </div>
        <div className="seller-stats">
          <div><strong>{sellerItems.length}</strong><span>Обяви</span></div>
          <div><strong>{activeItems}</strong><span>Активни</span></div>
          <div><strong>{avgRating ? avgRating.toFixed(1) : "-"}</strong><span>Рейтинг</span></div>
        </div>
        {sellerItems.length ? (
          <div className="items-grid">
            {sellerItems.map((item) => (
              <ItemCard key={item.id} item={item} language={language} onClick={() => onItemClick(item)} />
            ))}
          </div>
        ) : (
          <p className="info-text">Този продавач няма активни обяви.</p>
        )}
      </div>
    </section>
  );
}

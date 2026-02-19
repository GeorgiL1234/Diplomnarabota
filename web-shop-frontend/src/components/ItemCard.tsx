import { useEffect, useState } from "react";
import type { Item } from "../types";
import { getDisplayImageUrl, API_BASE } from "../config";
import { translations, getCategoryLabel, type Language } from "../translations";

const PLACEHOLDER_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f1f5f9' width='400' height='300'/%3E%3Ctext fill='%2394a3b8' font-family='sans-serif' font-size='24' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3E🖼️%3C/text%3E%3C/svg%3E";

type ItemCardProps = {
  item: Item;
  language: Language;
  onClick: () => void;
};

export function ItemCard({ item, language, onClick }: ItemCardProps) {
  const t = translations[language] || translations["bg"];
  const [imageUrl, setImageUrl] = useState<string>(
    item.imageUrl ? getDisplayImageUrl(item.imageUrl, item.id) || PLACEHOLDER_SVG : PLACEHOLDER_SVG
  );

  // Lazy-load снимка – за base64 използваме /image/raw (избягва големи JSON)
  useEffect(() => {
    if (item.imageUrl) {
      setImageUrl(getDisplayImageUrl(item.imageUrl, item.id) || PLACEHOLDER_SVG);
      return;
    }
    if (!item.id) return;
    let cancelled = false;
    fetch(`${API_BASE}/items/${item.id}/image?t=${Date.now()}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data?.imageUrl) return;
        setImageUrl(getDisplayImageUrl(data.imageUrl, item.id) || PLACEHOLDER_SVG);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [item.id, item.imageUrl]);
  
  return (
    <div className="item-card" onClick={onClick}>
      {item.isVip && <div className="vip-badge">{t.vipBadge}</div>}
      <div className="item-image-wrapper">
        <img
          src={imageUrl}
          alt={item.title}
          className="item-image"
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER_SVG;
          }}
        />
        <div className="item-image-overlay">
          <span className="view-details-icon">👁️</span>
        </div>
      </div>
      <div className="item-info">
        <div className="item-header">
          <h3 className="item-title">{item.title}</h3>
          {item.category && (
            <span className="item-category-badge">
              {item.category === "Електроника" && "📱"}
              {item.category === "Книги" && "📚"}
              {item.category === "Дрехи" && "👕"}
              {item.category === "Спорт" && "⚽"}
              {item.category === "Дом и градина" && "🏠"}
              {item.category === "Автомобили" && "🚗"}
              {!["Електроника", "Книги", "Дрехи", "Спорт", "Дом и градина", "Автомобили"].includes(item.category) && "📦"}
            </span>
          )}
        </div>
        <p className="item-description">{item.description}</p>
        <div className="item-footer">
          <div className="item-price-wrapper">
            <span className="item-price">{Number(item?.price ?? 0).toFixed(2)}</span>
            <span className="item-currency">{t.currency}</span>
          </div>
          {item.category && (
            <span className="item-category">{getCategoryLabel(item.category, t)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

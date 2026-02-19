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
  const [dataUriFallback, setDataUriFallback] = useState<string | null>(null);

  // Lazy-load: първо опитай /image/raw директно (1 заявка, по-добре при cold start)
  useEffect(() => {
    if (item.imageUrl) {
      setDataUriFallback(item.imageUrl.startsWith("data:") ? item.imageUrl : null);
      setImageUrl(getDisplayImageUrl(item.imageUrl, item.id) || PLACEHOLDER_SVG);
      return;
    }
    if (!item.id) return;
    setImageUrl(`${API_BASE}/items/${item.id}/image/raw?t=${Date.now()}`);
  }, [item.id, item.imageUrl]);
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (!img) return;
    if (dataUriFallback && dataUriFallback.length < 500000) {
      img.src = dataUriFallback;
      return;
    }
    if (imageUrl.includes("/image/raw") && item.id) {
      fetch(`${API_BASE}/items/${item.id}/image?t=${Date.now()}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (!img.isConnected) return;
          if (!data?.imageUrl) {
            setImageUrl(PLACEHOLDER_SVG);
            return;
          }
          if (data.imageUrl.startsWith("http")) {
            setImageUrl(data.imageUrl);
          } else if (data.imageUrl.startsWith("data:") && data.imageUrl.length < 500000) {
            setImageUrl(data.imageUrl);
          } else {
            setImageUrl(PLACEHOLDER_SVG);
          }
        })
        .catch(() => { if (img.isConnected) setImageUrl(PLACEHOLDER_SVG); });
    } else {
      setImageUrl(PLACEHOLDER_SVG);
    }
  }
  
  return (
    <div className="item-card" onClick={onClick}>
      {item.isVip && <div className="vip-badge">{t.vipBadge}</div>}
      <div className="item-image-wrapper">
        <img
          src={imageUrl}
          alt={item.title}
          className="item-image"
          onError={handleImageError}
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

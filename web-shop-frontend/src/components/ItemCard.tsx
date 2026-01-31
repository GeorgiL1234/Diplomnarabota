import type { Item } from "../types";
import { getImageUrl } from "../config";
import { translations, type Language } from "../translations";

type ItemCardProps = {
  item: Item;
  language: Language;
  onClick: () => void;
};

export function ItemCard({ item, language, onClick }: ItemCardProps) {
  const t = translations[language] || translations["bg"];
  
  return (
    <div className="item-card" onClick={onClick}>
      {item.isVip && <div className="vip-badge">{t.vipBadge}</div>}
      {item.imageUrl && (
        <img
          src={getImageUrl(item.imageUrl)}
          alt={item.title}
          className="item-image"
        />
      )}
      <div className="item-content">
        <h3 className="item-title">{item.title}</h3>
        <p className="item-description">{item.description}</p>
        <div className="item-footer">
          <span className="item-price">{item.price.toFixed(2)} {t.currency}</span>
          {item.category && <span className="item-category">{item.category}</span>}
        </div>
      </div>
    </div>
  );
}

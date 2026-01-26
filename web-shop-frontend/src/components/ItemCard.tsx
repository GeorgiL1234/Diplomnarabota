import type { Item } from "../types";
import { getImageUrl } from "../config";

type ItemCardProps = {
  item: Item;
  onClick: () => void;
};

export function ItemCard({ item, onClick }: ItemCardProps) {
  return (
    <div className="item-card" onClick={onClick}>
      {item.isVip && <div className="vip-badge">ВИП</div>}
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
          <span className="item-price">{item.price.toFixed(2)} лв.</span>
          {item.category && <span className="item-category">{item.category}</span>}
        </div>
      </div>
    </div>
  );
}

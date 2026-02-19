import type { Favorite, Item } from "../types";
import type { Language } from "../translations";
import { translations } from "../translations";
import { getDisplayImageUrl } from "../config";

type FavoritesPageProps = {
  favorites: Favorite[];
  language: Language;
  onItemClick: (item: Item) => void;
  onRemoveFavorite: (itemId: number) => void;
};

export function FavoritesPage({
  favorites,
  language,
  onItemClick,
  onRemoveFavorite,
}: FavoritesPageProps) {
  const t = translations[language];

  return (
    <section className="listings-section">
      <div className="listings-main">
        <h2>{t.favoritesTitle}</h2>
        {favorites.length === 0 ? (
          <p className="info-text">{t.noFavorites}</p>
        ) : (
          <ul className="items-list">
            {favorites.map((fav) => {
              const item = fav.item;
              if (!item) return null;
              return (
                <li key={item.id} className="item-card">
                  {item.isVip && <div className="vip-badge">ВИП</div>}
                  {item.imageUrl && (
                    <img
                      src={getDisplayImageUrl(item.imageUrl, item.id)}
                      alt={item.title}
                      className="item-image"
                      onClick={() => onItemClick(item)}
                    />
                  )}
                  <div className="item-info">
                    <h3 onClick={() => onItemClick(item)}>{item.title}</h3>
                    <p className="item-price">
                      {item.price.toFixed(2)} {t.currency}
                    </p>
                    <p className="item-category">{item.category}</p>
                    <button
                      className="btn-secondary"
                      onClick={() => onRemoveFavorite(item.id)}
                    >
                      {t.removeFromFavorites}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

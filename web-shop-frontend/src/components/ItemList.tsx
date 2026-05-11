import type { Item, View } from "../types";
import type { Language } from "../translations";
import { translations } from "../translations";
import { ItemCard } from "./ItemCard";

type ItemListProps = {
  items: Item[];
  view: View;
  loggedInEmail: string | null;
  selectedCategory: string;
  query: string;
  minPrice: string;
  maxPrice: string;
  sortBy: string;
  showSold: boolean;
  language: Language;
  onItemClick: (item: Item) => void;
};

export function filterAndSortItems({
  items,
  view,
  loggedInEmail,
  selectedCategory,
  query,
  minPrice,
  maxPrice,
  sortBy,
  showSold,
}: Omit<ItemListProps, "language" | "onItemClick">) {
  const normalizedQuery = query.trim().toLowerCase();
  const min = minPrice ? Number(minPrice) : null;
  const max = maxPrice ? Number(maxPrice) : null;

  return items
    .filter((item) => {
      if (selectedCategory !== "Р’СЃРёС‡РєРё" && item.category !== selectedCategory) return false;
      if (!showSold && item.sold) return false;
      if (view === "mine") {
        if (!loggedInEmail) return false;
        if ((item.ownerEmail || "").trim().toLowerCase() !== loggedInEmail.trim().toLowerCase()) return false;
      }
      if (normalizedQuery) {
        const haystack = `${item.title || ""} ${item.description || ""} ${item.ownerEmail || ""} ${item.category || ""}`.toLowerCase();
        if (!haystack.includes(normalizedQuery)) return false;
      }
      const price = Number(item.price || 0);
      if (min != null && !Number.isNaN(min) && price < min) return false;
      if (max != null && !Number.isNaN(max) && price > max) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "priceAsc") return Number(a.price || 0) - Number(b.price || 0);
      if (sortBy === "priceDesc") return Number(b.price || 0) - Number(a.price || 0);
      if (sortBy === "title") return (a.title || "").localeCompare(b.title || "");
      if (sortBy === "newest") return Number(b.id || 0) - Number(a.id || 0);
      const aVip = a.isVip === true;
      const bVip = b.isVip === true;
      if (aVip && !bVip) return -1;
      if (!aVip && bVip) return 1;
      return Number(b.id || 0) - Number(a.id || 0);
    });
}

export function ItemList(props: ItemListProps) {
  const { language, onItemClick } = props;
  const filteredItems = filterAndSortItems(props);
  const t = translations[language];

  if (filteredItems.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📭</div>
        <p className="info-text">{t.noListings}</p>
      </div>
    );
  }

  return (
    <div className="items-grid">
      {filteredItems.map((item) => (
        <ItemCard key={item.id} item={item} language={language} onClick={() => onItemClick(item)} />
      ))}
    </div>
  );
}

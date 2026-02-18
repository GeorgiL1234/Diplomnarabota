import type { Item, View } from "../types";
import type { Language } from "../translations";
import { translations } from "../translations";
import { ItemCard } from "./ItemCard";

type ItemListProps = {
  items: Item[];
  view: View;
  loggedInEmail: string | null;
  selectedCategory: string;
  language: Language;
  onItemClick: (item: Item) => void;
};

export function ItemList({ items, view, loggedInEmail, selectedCategory, language, onItemClick }: ItemListProps) {
  const filteredItems = items.filter((it) => {
    // филтър по категория
    if (selectedCategory !== "Всички") {
      if (!it.category || it.category !== selectedCategory) return false;
    }
    // филтър по "моите обяви"
    if (view === "mine") {
      if (!loggedInEmail) return false;
      return it.ownerEmail === loggedInEmail;
    }
    return true;
  });

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
      {filteredItems.map((it) => (
        <ItemCard key={it.id} item={it} language={language} onClick={() => onItemClick(it)} />
      ))}
    </div>
  );
}

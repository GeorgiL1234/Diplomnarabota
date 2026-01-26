import type { Item, View } from "../types";
import { ItemCard } from "./ItemCard";

type ItemListProps = {
  items: Item[];
  view: View;
  loggedInEmail: string | null;
  selectedCategory: string;
  onItemClick: (item: Item) => void;
};

export function ItemList({ items, view, loggedInEmail, selectedCategory, onItemClick }: ItemListProps) {
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

  if (filteredItems.length === 0) {
    return <p className="info-text">Няма обяви.</p>;
  }

  return (
    <div className="items-grid">
      {filteredItems.map((it) => (
        <ItemCard key={it.id} item={it} onClick={() => onItemClick(it)} />
      ))}
    </div>
  );
}

import type { Item } from "../types";
import type { Language } from "../translations";
import { ItemList } from "./ItemList";

type VipListingsPageProps = {
  items: Item[];
  loggedInEmail: string | null;
  selectedCategory: string;
  language: Language;
  onItemClick: (item: Item) => void;
  onCategoryChange: (category: string) => void;
};

export function VipListingsPage({
  items,
  loggedInEmail,
  selectedCategory,
  language,
  onItemClick,
  onCategoryChange,
}: VipListingsPageProps) {
  // Филтрираме само VIP обявите
  const vipItems = items.filter((item) => item.isVip === true);

  // Филтрираме по категория ако е избрана
  const filteredItems =
    selectedCategory === "Всички"
      ? vipItems
      : vipItems.filter((item) => item.category === selectedCategory);

  return (
    <section className="listings-section">
      <div className="listings-main">
        <div className="listings-header">
          <h2 style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '-40px', top: '50%', transform: 'translateY(-50%)', fontSize: '32px' }}>👑</span>
            VIP Обяви
          </h2>
        </div>

        {/* Филтър по категория */}
        <div className="category-filter">
          <label>
            <strong>Категория:</strong>
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
            >
              <option value="Всички">Всички</option>
              <option value="Електроника">Електроника</option>
              <option value="Книги">Книги</option>
              <option value="Дрехи">Дрехи</option>
              <option value="Спорт">Спорт</option>
              <option value="Дом и градина">Дом и градина</option>
              <option value="Автомобили">Автомобили</option>
              <option value="Други">Други</option>
            </select>
          </label>
        </div>

        {filteredItems.length === 0 ? (
          <p className="info-text">Няма VIP обяви в тази категория.</p>
        ) : (
          <ItemList
            items={filteredItems}
            view="all"
            loggedInEmail={loggedInEmail}
            selectedCategory={selectedCategory}
            language={language}
            onItemClick={onItemClick}
          />
        )}
      </div>
    </section>
  );
}

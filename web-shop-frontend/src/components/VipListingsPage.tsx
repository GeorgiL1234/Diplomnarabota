import type { Item } from "../types";
import type { Language } from "../translations";
import { translations, getCategoryLabel } from "../translations";
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
  const t = translations[language];
  const vipItems = items.filter((item) => item.isVip === true);
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
            {t.vipListingsTitle}
          </h2>
        </div>

        <div className="category-filter">
          <label>
            <strong>{t.category}</strong>
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
            >
              <option value="Всички">{getCategoryLabel("Всички", t)}</option>
              <option value="Електроника">{getCategoryLabel("Електроника", t)}</option>
              <option value="Книги">{getCategoryLabel("Книги", t)}</option>
              <option value="Дрехи">{getCategoryLabel("Дрехи", t)}</option>
              <option value="Спорт">{getCategoryLabel("Спорт", t)}</option>
              <option value="Дом и градина">{getCategoryLabel("Дом и градина", t)}</option>
              <option value="Автомобили">{getCategoryLabel("Автомобили", t)}</option>
              <option value="Други">{getCategoryLabel("Други", t)}</option>
            </select>
          </label>
        </div>

        {filteredItems.length === 0 ? (
          <p className="info-text">{t.noVipListingsInCategory}</p>
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

type Props = {
  query: string;
  minPrice: string;
  maxPrice: string;
  sortBy: string;
  showSold: boolean;
  resultCount: number;
  onQueryChange: (value: string) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onSortByChange: (value: string) => void;
  onShowSoldChange: (value: boolean) => void;
  onClear: () => void;
};

export function MarketplaceFilters({
  query,
  minPrice,
  maxPrice,
  sortBy,
  showSold,
  resultCount,
  onQueryChange,
  onMinPriceChange,
  onMaxPriceChange,
  onSortByChange,
  onShowSoldChange,
  onClear,
}: Props) {
  return (
    <div className="marketplace-filters">
      <div className="filter-field filter-search">
        <label htmlFor="listing-search">Търсене</label>
        <input
          id="listing-search"
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Заглавие, описание, продавач..."
        />
      </div>
      <div className="filter-field">
        <label htmlFor="listing-min-price">Цена от</label>
        <input
          id="listing-min-price"
          type="number"
          min="0"
          value={minPrice}
          onChange={(e) => onMinPriceChange(e.target.value)}
          placeholder="0"
        />
      </div>
      <div className="filter-field">
        <label htmlFor="listing-max-price">Цена до</label>
        <input
          id="listing-max-price"
          type="number"
          min="0"
          value={maxPrice}
          onChange={(e) => onMaxPriceChange(e.target.value)}
          placeholder="999"
        />
      </div>
      <div className="filter-field">
        <label htmlFor="listing-sort">Сортиране</label>
        <select id="listing-sort" value={sortBy} onChange={(e) => onSortByChange(e.target.value)}>
          <option value="vip">VIP първо</option>
          <option value="newest">Най-нови</option>
          <option value="priceAsc">Най-евтини</option>
          <option value="priceDesc">Най-скъпи</option>
          <option value="title">По име</option>
        </select>
      </div>
      <label className="filter-toggle">
        <input
          type="checkbox"
          checked={showSold}
          onChange={(e) => onShowSoldChange(e.target.checked)}
        />
        Показвай продадени
      </label>
      <div className="filter-actions">
        <span className="filter-count">{resultCount} обяви</span>
        <button type="button" className="btn-secondary" onClick={onClear}>
          Изчисти
        </button>
      </div>
    </div>
  );
}

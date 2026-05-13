type CategoryOption = {
  value: string;
  label: string;
};

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
  // Optional category field – when provided, renders as first filter
  selectedCategory?: string;
  categoryOptions?: CategoryOption[];
  categoryLabel?: string;
  onCategoryChange?: (value: string) => void;
  // Optional i18n labels (fall back to Bulgarian)
  searchLabel?: string;
  searchPlaceholder?: string;
  minPriceLabel?: string;
  maxPriceLabel?: string;
  sortLabel?: string;
  showSoldLabel?: string;
  clearLabel?: string;
  resultCountLabel?: string;
  sortOptions?: { value: string; label: string }[];
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
  selectedCategory,
  categoryOptions,
  categoryLabel = "Категория",
  onCategoryChange,
  searchLabel = "Търсене",
  searchPlaceholder = "Заглавие, описание, продавач...",
  minPriceLabel = "Цена от",
  maxPriceLabel = "Цена до",
  sortLabel = "Сортиране",
  showSoldLabel = "Показвай продадени",
  clearLabel = "Изчисти",
  resultCountLabel,
  sortOptions,
}: Props) {
  const defaultSortOptions = [
    { value: "vip", label: "VIP първо" },
    { value: "newest", label: "Най-нови" },
    { value: "priceAsc", label: "Най-евтини" },
    { value: "priceDesc", label: "Най-скъпи" },
    { value: "title", label: "По име" },
  ];
  const sortOpts = sortOptions ?? defaultSortOptions;
  const showCategory = !!categoryOptions && !!onCategoryChange;

  return (
    <div className="marketplace-filters">
      <div className="filter-grid">
        {showCategory && (
          <div className="filter-field">
            <label htmlFor="listing-category">{categoryLabel}</label>
            <select
              id="listing-category"
              name="category"
              value={selectedCategory}
              onChange={(e) => onCategoryChange!(e.target.value)}
            >
              {categoryOptions!.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="filter-field filter-search">
          <label htmlFor="listing-search">{searchLabel}</label>
          <input
            id="listing-search"
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={searchPlaceholder}
          />
        </div>
        <div className="filter-field">
          <label htmlFor="listing-min-price">{minPriceLabel}</label>
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
          <label htmlFor="listing-max-price">{maxPriceLabel}</label>
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
          <label htmlFor="listing-sort">{sortLabel}</label>
          <select id="listing-sort" value={sortBy} onChange={(e) => onSortByChange(e.target.value)}>
            {sortOpts.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="filter-footer">
        <label className="filter-toggle">
          <input
            type="checkbox"
            checked={showSold}
            onChange={(e) => onShowSoldChange(e.target.checked)}
          />
          <span>{showSoldLabel}</span>
        </label>
        <div className="filter-actions">
          <span className="filter-count">
            {resultCountLabel ?? `${resultCount} обяви`}
          </span>
          <button type="button" className="btn-secondary" onClick={onClear}>
            {clearLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

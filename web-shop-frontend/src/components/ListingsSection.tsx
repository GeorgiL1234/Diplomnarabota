import type { FormEvent } from "react";
import { translations, getCategoryLabel, type Language } from "../translations";
import type { Item, View } from "../types";
import { CATEGORIES } from "../types";
import { CreateListingForm } from "./CreateListingForm";
import { filterAndSortItems, ItemList } from "./ItemList";
import { MarketplaceFilters } from "./MarketplaceFilters";

type Props = {
  view: View;
  loggedInEmail: string | null;
  language: Language;
  items: Item[];
  selectedCategory: string;
  query: string;
  minPrice: string;
  maxPrice: string;
  sortBy: string;
  showSold: boolean;
  showCreateForm: boolean;
  contactPhonePrefilled: boolean;
  isCreatingListing: boolean;
  newItemTitle: string;
  newItemDescription: string;
  newItemPrice: string;
  newItemCategory: string;
  newItemContactEmail: string;
  newItemContactPhone: string;
  newItemPaymentMethod: string;
  newItemIsVip: boolean;
  newItemFiles: File[];
  onToggleCreateForm: () => void;
  onCategoryChange: (c: string) => void;
  onQueryChange: (v: string) => void;
  onMinPriceChange: (v: string) => void;
  onMaxPriceChange: (v: string) => void;
  onSortByChange: (v: string) => void;
  onShowSoldChange: (v: boolean) => void;
  onClearFilters: () => void;
  onItemClick: (item: Item | number) => void;
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onPriceChange: (v: string) => void;
  onNewItemCategoryChange: (v: string) => void;
  onContactEmailChange: (v: string) => void;
  onContactPhoneChange: (v: string) => void;
  onPaymentMethodChange: (v: string) => void;
  onVipChange: (v: boolean) => void;
  onFilesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
  onCreateSubmit: (e: FormEvent) => void;
};

export function ListingsSection({
  view,
  loggedInEmail,
  language,
  items,
  selectedCategory,
  query,
  minPrice,
  maxPrice,
  sortBy,
  showSold,
  showCreateForm,
  contactPhonePrefilled,
  isCreatingListing,
  newItemTitle,
  newItemDescription,
  newItemPrice,
  newItemCategory,
  newItemContactEmail,
  newItemContactPhone,
  newItemPaymentMethod,
  newItemIsVip,
  newItemFiles,
  onToggleCreateForm,
  onCategoryChange,
  onQueryChange,
  onMinPriceChange,
  onMaxPriceChange,
  onSortByChange,
  onShowSoldChange,
  onClearFilters,
  onItemClick,
  onTitleChange,
  onDescriptionChange,
  onPriceChange,
  onNewItemCategoryChange,
  onContactEmailChange,
  onContactPhoneChange,
  onPaymentMethodChange,
  onVipChange,
  onFilesChange,
  onRemoveFile,
  onCreateSubmit,
}: Props) {
  const t = translations[language] || translations["bg"];
  const resultCount = filterAndSortItems({
    items,
    view,
    loggedInEmail,
    selectedCategory,
    query,
    minPrice,
    maxPrice,
    sortBy,
    showSold,
  }).length;

  const subtitle = view === "mine" ? t.myListingsSubtitle : t.allListingsSubtitle;

  if (!(view === "all" || (view === "mine" && loggedInEmail))) return null;

  return (
    <section className="listings-section">
      <div className="listings-main">
        <div className={`listings-header ${view === "mine" ? "mine" : "all"}`}>
          <div>
            <h2>{view === "all" ? t.allListings : t.myListings}</h2>
            <p className="listings-subtitle">{subtitle}</p>
          </div>
          {view === "mine" && loggedInEmail && (
            <button className="btn-primary" onClick={onToggleCreateForm}>
              {showCreateForm ? t.cancel : t.createListing}
            </button>
          )}
        </div>

        <CreateListingForm
          show={showCreateForm && !!loggedInEmail}
          title={newItemTitle}
          description={newItemDescription}
          price={newItemPrice}
          category={newItemCategory}
          contactEmail={newItemContactEmail}
          contactPhone={newItemContactPhone}
          contactPhonePrefilled={contactPhonePrefilled}
          paymentMethod={newItemPaymentMethod}
          isVip={newItemIsVip}
          language={language}
          files={newItemFiles}
          isCreating={isCreatingListing}
          loggedInEmail={loggedInEmail}
          onTitleChange={onTitleChange}
          onDescriptionChange={onDescriptionChange}
          onPriceChange={onPriceChange}
          onCategoryChange={onNewItemCategoryChange}
          onContactEmailChange={onContactEmailChange}
          onContactPhoneChange={onContactPhoneChange}
          onPaymentMethodChange={onPaymentMethodChange}
          onVipChange={onVipChange}
          onFilesChange={onFilesChange}
          onRemoveFile={onRemoveFile}
          onSubmit={onCreateSubmit}
        />

        {!showCreateForm && (
          <MarketplaceFilters
            query={query}
            minPrice={minPrice}
            maxPrice={maxPrice}
            sortBy={sortBy}
            showSold={showSold}
            resultCount={resultCount}
            onQueryChange={onQueryChange}
            onMinPriceChange={onMinPriceChange}
            onMaxPriceChange={onMaxPriceChange}
            onSortByChange={onSortByChange}
            onShowSoldChange={onShowSoldChange}
            onClear={onClearFilters}
            selectedCategory={selectedCategory}
            categoryOptions={CATEGORIES.map((cat) => ({
              value: cat,
              label: getCategoryLabel(cat, t),
            }))}
            categoryLabel={t.category}
            onCategoryChange={onCategoryChange}
          />
        )}

        {view === "mine" && !loggedInEmail && <p className="info-text">{t.loginToSeeListings}</p>}

        <ItemList
          items={items}
          view={view}
          loggedInEmail={loggedInEmail}
          selectedCategory={selectedCategory}
          query={query}
          minPrice={minPrice}
          maxPrice={maxPrice}
          sortBy={sortBy}
          showSold={showSold}
          language={language}
          onItemClick={onItemClick}
        />
      </div>
    </section>
  );
}

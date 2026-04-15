import type { FormEvent } from "react";
import { translations, getCategoryLabel, type Language } from "../translations";
import type { Item, View } from "../types";
import { CATEGORIES } from "../types";
import { CreateListingForm } from "./CreateListingForm";
import { ItemList } from "./ItemList";

type Props = {
  view: View;
  loggedInEmail: string | null;
  language: Language;
  items: Item[];
  selectedCategory: string;
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

  if (!(view === "all" || (view === "mine" && loggedInEmail))) return null;

  return (
    <section className="listings-section">
      <div className="listings-main">
        <div className="listings-header">
          <h2>{view === "all" ? t.allListings : t.myListings}</h2>
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
          <div className="category-filter">
            <label htmlFor="main-category-filter">
              <strong>{t.category}</strong>
              <select
                id="main-category-filter"
                name="category"
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {getCategoryLabel(cat, t)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        {view === "mine" && !loggedInEmail && <p className="info-text">{t.loginToSeeListings}</p>}

        <ItemList
          items={items}
          view={view}
          loggedInEmail={loggedInEmail}
          selectedCategory={selectedCategory}
          language={language}
          onItemClick={onItemClick}
        />
      </div>
    </section>
  );
}

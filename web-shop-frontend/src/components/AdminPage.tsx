import type { Item } from "../types";

type Props = {
  items: Item[];
  isAdmin: boolean;
  onDeleteItem: (itemId: number) => void;
  onToggleSold: (item: Item) => void;
  onViewItem: (item: Item | number) => void;
  onOpenSellerProfile?: (email?: string | null) => void;
};

export function AdminPage({ items, isAdmin, onDeleteItem, onToggleSold, onViewItem, onOpenSellerProfile }: Props) {
  if (!isAdmin) {
    return (
      <section className="listings-section">
        <div className="listings-main">
          <h2>Админ панел</h2>
          <p className="info-text">Нямате достъп до този панел.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="listings-section">
      <div className="listings-main admin-panel">
        <div className="listings-header">
          <h2>Админ панел</h2>
          <span className="filter-count">{items.length} обяви</span>
        </div>
        <div className="admin-table">
          {items.map((item) => (
            <div key={item.id} className="admin-row">
              <div>
                <strong>{item.title}</strong>
                <p>
                  {item.ownerEmail ? (
                    onOpenSellerProfile ? (
                      <button
                        type="button"
                        className="link-button"
                        onClick={() => onOpenSellerProfile(item.ownerEmail)}
                      >
                        {item.ownerEmail}
                      </button>
                    ) : (
                      <span>{item.ownerEmail}</span>
                    )
                  ) : (
                    "Без продавач"
                  )}
                  {" · "}
                  {Number(item.price || 0).toFixed(2)} €
                </p>
              </div>
              <span className={item.sold ? "sold-pill" : "active-pill"}>{item.sold ? "Продадено" : "Активно"}</span>
              <div className="admin-actions">
                <button type="button" className="btn-secondary" onClick={() => onViewItem(item)}>Виж</button>
                <button type="button" className="btn-secondary" onClick={() => onToggleSold(item)}>
                  {item.sold ? "Активирай" : "Продадено"}
                </button>
                <button type="button" className="btn-secondary danger-action" onClick={() => onDeleteItem(item.id)}>
                  Изтрий
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

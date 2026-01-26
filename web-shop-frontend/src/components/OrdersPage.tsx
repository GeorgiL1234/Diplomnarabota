import type { ItemOrder, Item, View } from "../types";
import type { Language } from "../translations";
import { translations } from "../translations";

type OrdersPageProps = {
  myOrders: ItemOrder[];
  sellerOrders: ItemOrder[];
  language: Language;
  onViewItem: (item: Item) => void;
  onUpdateOrderStatus: (orderId: number, status: string) => void;
};

export function OrdersPage({
  myOrders,
  sellerOrders,
  language,
  onViewItem,
  onUpdateOrderStatus,
}: OrdersPageProps) {
  const t = translations[language];

  return (
    <section className="listings-section">
      <div className="listings-main">
        <h2>{t.ordersTitle}</h2>

        <div className="orders-page-section">
          <h3>{t.myOrders}</h3>
          {myOrders.length === 0 ? (
            <p className="info-text">{t.noOrders}</p>
          ) : (
            <ul className="orders-list">
              {myOrders.map((order) => (
                <li key={order.id} className="order-item">
                  <div className="order-header">
                    <div className="order-info">
                      <h4>{order.item.title}</h4>
                      <p className="order-date">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`order-status status-${order.status.toLowerCase()}`}>
                      {t[`status${order.status}` as keyof typeof t] || order.status}
                    </span>
                  </div>
                  <div className="order-details">
                    <p>
                      <strong>{t.priceLabel}:</strong> {order.totalPrice.toFixed(2)} {t.currency}
                    </p>
                    <p>
                      <strong>{t.paymentMethod}:</strong>{" "}
                      {order.paymentMethod === "bank_transfer"
                        ? t.paymentBankTransfer
                        : order.paymentMethod === "cash_on_delivery"
                          ? t.paymentCashOnDelivery
                          : order.paymentMethod}
                    </p>
                    <p>
                      <strong>{t.deliveryMethod}:</strong>{" "}
                      {order.deliveryMethod === "speedy"
                        ? t.deliverySpeedy
                        : order.deliveryMethod === "econt"
                          ? t.deliveryEcont
                          : order.deliveryMethod}
                    </p>
                    <p>
                      <strong>{t.deliveryAddress}:</strong> {order.deliveryAddress}
                    </p>
                  </div>
                  <button className="btn-secondary" onClick={() => onViewItem(order.item)}>
                    {t.viewListing}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="orders-page-section">
          <h3>{t.sellerOrders}</h3>
          {sellerOrders.length === 0 ? (
            <p className="info-text">{t.noSellerOrders}</p>
          ) : (
            <ul className="orders-list">
              {sellerOrders.map((order) => (
                <li key={order.id} className="order-item">
                  <div className="order-header">
                    <div className="order-info">
                      <h4>{order.item.title}</h4>
                      <p className="order-date">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <p className="order-customer">
                        {t.orderedBy}: {order.customerEmail}
                      </p>
                    </div>
                    <span className={`order-status status-${order.status.toLowerCase()}`}>
                      {t[`status${order.status}` as keyof typeof t] || order.status}
                    </span>
                  </div>
                  <div className="order-details">
                    <p>
                      <strong>{t.priceLabel}:</strong> {order.totalPrice.toFixed(2)} {t.currency}
                    </p>
                    <p>
                      <strong>{t.paymentMethod}:</strong>{" "}
                      {order.paymentMethod === "bank_transfer"
                        ? t.paymentBankTransfer
                        : order.paymentMethod === "cash_on_delivery"
                          ? t.paymentCashOnDelivery
                          : order.paymentMethod}
                    </p>
                    <p>
                      <strong>{t.deliveryMethod}:</strong>{" "}
                      {order.deliveryMethod === "speedy"
                        ? t.deliverySpeedy
                        : order.deliveryMethod === "econt"
                          ? t.deliveryEcont
                          : order.deliveryMethod}
                    </p>
                    <p>
                      <strong>{t.deliveryAddress}:</strong> {order.deliveryAddress}
                    </p>
                  </div>
                  {order.status === "PENDING" && (
                    <div className="order-actions">
                      <button
                        className="btn-primary"
                        onClick={() => onUpdateOrderStatus(order.id, "CONFIRMED")}
                      >
                        {t.confirmOrder}
                      </button>
                      <button
                        className="btn-secondary"
                        onClick={() => onUpdateOrderStatus(order.id, "CANCELLED")}
                      >
                        {t.cancelOrder}
                      </button>
                    </div>
                  )}
                  {order.status === "CONFIRMED" && (
                    <div className="order-actions">
                      <button
                        className="btn-primary"
                        onClick={() => onUpdateOrderStatus(order.id, "SHIPPED")}
                      >
                        {t.markAsShipped}
                      </button>
                    </div>
                  )}
                  {order.status === "SHIPPED" && (
                    <div className="order-actions">
                      <button
                        className="btn-primary"
                        onClick={() => onUpdateOrderStatus(order.id, "DELIVERED")}
                      >
                        {t.markAsDelivered}
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

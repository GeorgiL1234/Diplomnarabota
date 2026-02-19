import type { FormEvent } from "react";
import type { Message, Item } from "../types";
import type { Language } from "../translations";
import { translations } from "../translations";
import { getDisplayImageUrl } from "../config";
import { ItemCard } from "./ItemCard";

type MessagesPageProps = {
  selectedItem: Item | null;
  items: Item[];
  loggedInEmail: string | null;
  sentMessages: Message[];
  receivedMessages: Message[];
  newQuestion: string;
  newAnswer: { [key: number]: string };
  language: Language;
  onQuestionChange: (question: string) => void;
  onAnswerChange: (messageId: number, answer: string) => void;
  onSelectItem: (item: Item) => void;
  onClearSelection: () => void;
  onSendQuestion: (e: FormEvent) => void;
  onSendAnswer: (messageId: number) => void;
  isSendingQuestion?: boolean;
  onViewItem: (item: Item) => void;
};

export function MessagesPage({
  selectedItem,
  items,
  loggedInEmail,
  sentMessages,
  receivedMessages,
  newQuestion,
  newAnswer,
  language,
  onQuestionChange,
  onAnswerChange,
  onSelectItem,
  onClearSelection,
  onSendQuestion,
  onSendAnswer,
  onViewItem,
  isSendingQuestion = false,
}: MessagesPageProps) {
  const t = translations[language];

  return (
    <section className="listings-section">
      <div className="listings-main">
        <h2>{t.questionsTitle}</h2>

        {selectedItem && selectedItem.ownerEmail !== loggedInEmail && (
          <div className="new-question-section">
            <h3>{t.askQuestion}</h3>
            <form onSubmit={onSendQuestion} className="question-form">
              <div className="form-group">
                <label htmlFor="message-question">
                  {t.listingTitle} {selectedItem.title}
                </label>
                <textarea
                  id="message-question"
                  name="question"
                  value={newQuestion}
                  onChange={(e) => onQuestionChange(e.target.value)}
                  placeholder={t.questionPlaceholder}
                  rows={3}
                  required
                  disabled={isSendingQuestion}
                />
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="submit" className={`btn-primary ${isSendingQuestion ? "btn-loading" : ""}`} disabled={isSendingQuestion}>
                  {isSendingQuestion ? (
                    <>
                      <span className="btn-icon spinning">⏳</span>
                      {language === "bg" ? "Изпраща се..." : language === "en" ? "Sending..." : "Отправка..."}
                    </>
                  ) : (
                    t.sendMessage
                  )}
                </button>
                <button type="button" className="btn-secondary" onClick={onClearSelection} disabled={isSendingQuestion}>
                  {t.cancel}
                </button>
              </div>
            </form>
          </div>
        )}

        {!selectedItem && (
          <div className="select-listing-section" style={{ marginBottom: "30px" }}>
            <h3>{t.selectListingToAskQuestion}</h3>
            <div className="items-grid" style={{ marginTop: "16px" }}>
              {items
                .filter((it) => it.ownerEmail !== loggedInEmail)
                .slice(0, 6)
                .map((it) => (
                  <ItemCard key={it.id} item={it} language={language} onClick={() => onSelectItem(it)} />
                ))}
            </div>
          </div>
        )}

        <div className="messages-page-section">
          <h3>{t.sentQuestions}</h3>
          {sentMessages.length === 0 ? (
            <p className="info-text">{t.noSentQuestions}</p>
          ) : (
            <ul className="messages-list">
              {sentMessages.map((msg) => (
                <li key={msg.id} className="message-item-full">
                  {msg.item && (
                    <div className="message-item-listing-card">
                      <div className="listing-card-header">
                        {msg.item.imageUrl && (
                          <img
                            src={getDisplayImageUrl(msg.item.imageUrl, msg.item.id)}
                            alt={msg.item.title}
                            className="listing-card-image"
                          />
                        )}
                        <div className="listing-card-info">
                          <h4>{msg.item.title}</h4>
                          <p className="listing-card-description">{msg.item.description}</p>
                          <p className="listing-card-price">
                            {t.priceLabel}: {Number(msg.item?.price ?? 0).toFixed(2)} {t.currency}
                          </p>
                          <button className="btn-secondary" onClick={() => onViewItem(msg.item!)}>
                            {t.viewListing}
                          </button>
                        </div>
                      </div>
                      <div className="listing-card-contact">
                        <h5>{t.contactTitle}</h5>
                        {msg.item.contactEmail && (
                          <div className="contact-item">
                            <span className="contact-icon">📧</span>
                            <a href={`mailto:${msg.item.contactEmail}`} className="contact-value">
                              {msg.item.contactEmail}
                            </a>
                          </div>
                        )}
                        {msg.item.contactPhone && (
                          <div className="contact-item">
                            <span className="contact-icon">📱</span>
                            <a href={`tel:${msg.item.contactPhone}`} className="contact-value">
                              {msg.item.contactPhone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="message-question">
                    <div className="message-header">
                      <strong>{t.yourQuestion}</strong>
                      <span className="message-date">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="message-content">{msg.content}</p>
                  </div>
                  {msg.response ? (
                    <div className="message-response">
                      <div className="message-header">
                        <strong>{t.sellerResponse}</strong>
                      </div>
                      <p className="message-content">{msg.response}</p>
                    </div>
                  ) : (
                    <p className="info-text" style={{ fontStyle: "italic", color: "#64748b" }}>
                      {t.noResponseYet}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="messages-page-section">
          <h3>{t.receivedQuestions}</h3>
          {receivedMessages.length === 0 ? (
            <p className="info-text">{t.noReceivedQuestions}</p>
          ) : (
            <ul className="messages-list">
              {receivedMessages.map((msg) => (
                <li key={msg.id} className="message-item-full">
                  {msg.item && (
                    <div className="message-item-listing-card">
                      <div className="listing-card-header">
                        {msg.item.imageUrl && (
                          <img
                            src={getDisplayImageUrl(msg.item.imageUrl, msg.item.id)}
                            alt={msg.item.title}
                            className="listing-card-image"
                          />
                        )}
                        <div className="listing-card-info">
                          <h4>{msg.item.title}</h4>
                          <p className="listing-card-description">{msg.item.description}</p>
                          <p className="listing-card-price">
                            {t.priceLabel}: {Number(msg.item?.price ?? 0).toFixed(2)} {t.currency}
                          </p>
                          <button className="btn-secondary" onClick={() => onViewItem(msg.item!)}>
                            {t.viewListing}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="message-question">
                    <div className="message-header">
                      <strong>{msg.senderEmail}</strong>
                      <span className="message-date">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="message-content">{msg.content}</p>
                  </div>
                  {msg.response ? (
                    <div className="message-response">
                      <div className="message-header">
                        <strong>{t.sellerResponse}</strong>
                      </div>
                      <p className="message-content">{msg.response}</p>
                    </div>
                  ) : (
                    <div className="message-answer-form">
                      <label htmlFor={`message-answer-${msg.id}`} className="sr-only">{t.answerPlaceholder}</label>
                      <textarea
                        id={`message-answer-${msg.id}`}
                        name="answer"
                        value={newAnswer[msg.id] || ""}
                        onChange={(e) => onAnswerChange(msg.id, e.target.value)}
                        placeholder={t.answerPlaceholder}
                        rows={3}
                      />
                      <button
                        className="btn-primary"
                        onClick={() => onSendAnswer(msg.id)}
                        disabled={!newAnswer[msg.id]?.trim()}
                      >
                        {t.submitAnswer}
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

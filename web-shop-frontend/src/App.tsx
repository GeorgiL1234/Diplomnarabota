
import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import "./App.css";
import { translations, type Language } from "./translations";
import type { Item, Favorite, Review, Message, ItemOrder, View } from "./types";
import { CATEGORIES } from "./types";
import { API_BASE } from "./config";
import { Header } from "./components/Header";
import { AuthSection } from "./components/AuthSection";
import { ItemDetail } from "./components/ItemDetail";
import { ItemList } from "./components/ItemList";
import { CreateListingForm } from "./components/CreateListingForm";
import { MessagesPage } from "./components/MessagesPage";
import { OrdersPage } from "./components/OrdersPage";
import { FavoritesPage } from "./components/FavoritesPage";

function App() {
  // auth
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loggedInEmail, setLoggedInEmail] = useState<string | null>(null);

  // items
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("Всички");

  // create listing form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("Други");
  const [newItemContactEmail, setNewItemContactEmail] = useState("");
  const [newItemContactPhone, setNewItemContactPhone] = useState("");
  const [newItemFile, setNewItemFile] = useState<File | null>(null);

  // reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  // upload
  const [file, setFile] = useState<File | null>(null);

  // order
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  // messages/questions
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState<{ [key: number]: string }>({});

  // view / навигация
  const [view, setView] = useState<View>("auth"); // Започваме с auth страницата
  
  // Debug: винаги показваме нещо
  useEffect(() => {
    console.log('App state:', { view, loggedInEmail: !!loggedInEmail, itemsCount: items.length });
  }, [view, loggedInEmail, items.length]);
  
  // messages page
  const [sentMessages, setSentMessages] = useState<Message[]>([]);
  const [receivedMessages, setReceivedMessages] = useState<Message[]>([]);
  
  // orders page
  const [myOrders, setMyOrders] = useState<ItemOrder[]>([]);
  const [sellerOrders, setSellerOrders] = useState<ItemOrder[]>([]);
  
  // favorites page
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [favoriteItemIds, setFavoriteItemIds] = useState<Set<number>>(new Set());

  // language / език
  const [language, setLanguage] = useState<Language>("bg");
  const t = translations[language] || translations["bg"]; // Fallback към български

  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // зареждане на продуктите
  const loadItems = () => {
    fetch(`${API_BASE}/items`)
      .then((res) => {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then((data) => {
        // Сортираме обявите: VIP първо
        const sortedData = [...data].sort((a: Item, b: Item) => {
          const aVip = a.isVip === true;
          const bVip = b.isVip === true;
          if (aVip && !bVip) return -1;
          if (!aVip && bVip) return 1;
          return 0;
        });
        setItems(sortedData);
        if (selectedItem) {
          const updated = sortedData.find((it: Item) => it.id === selectedItem.id) || null;
          setSelectedItem(updated);
        }
      })
      .catch((err) => setError(String(err)));
  };

  useEffect(() => {
    // Зареждаме items само ако е логнат
    if (loggedInEmail) {
      loadItems();
    }
  }, [loggedInEmail]);

  useEffect(() => {
    // Зареждаме съобщенията когато отворим страницата за съобщения
    if (view === "messages" && loggedInEmail) {
      loadAllMessages();
    }
    // Зареждаме поръчките когато отворим страницата за поръчки
    if (view === "orders" && loggedInEmail) {
      loadAllOrders();
    }
    // Зареждаме любимите когато отворим страницата за любими
    if (view === "favorites" && loggedInEmail) {
      loadFavorites();
    }
  }, [view, loggedInEmail]);

  // валидация на парола
  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return t.passwordMinLength;
    }
    // Проверка за специален символ (не буква или цифра)
    const hasSpecialChar = /[^a-zA-Z0-9]/.test(pwd);
    if (!hasSpecialChar) {
      return t.passwordSpecialChar;
    }
    return null;
  };

  // auth – register
  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    
    // Валидация на паролата
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({ email, password, fullName }),
      });
      if (!res.ok) throw new Error(t.errorRegistration);
      setMessage(t.successRegistration);
      setLoggedInEmail(email);
      setEmail("");
      setPassword("");
      setFullName("");
      setView("all");
    } catch (err) {
      setError(String(err));
    }
  };

  // auth – login
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    
    // Валидация на празни полета
    if (!email || !password) {
      setError("Моля, попълнете email и парола");
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({ email, password }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Login error response:", errorText);
        throw new Error(errorText || t.errorLogin);
      }
      
      const responseText = await res.text();
      console.log("Login response:", responseText);
      
      setLoggedInEmail(email);
      setMessage(t.successLogin);
      setEmail("");
      setPassword("");
      setView("all"); // След успешен вход, отиваме на обявите
    } catch (err) {
      console.error("Login error:", err);
      setError(String(err));
    }
  };

  const handleLogout = () => {
    setLoggedInEmail(null);
    setMessage(t.loggedOut);
    setEmail("");
    setPassword("");
    setFullName("");
    setSelectedItem(null);
    setReviews([]);
    setView("auth");
  };

  // създаване на обява
  const handleCreateListing = async (e: FormEvent) => {
    e.preventDefault();
    if (!loggedInEmail) {
      setError(t.errorMustLogin);
      return;
    }
    setError(null);
    setMessage(null);
    
    // Валидация: поне email или телефон трябва да е попълнен
    const emailTrimmed = newItemContactEmail.trim();
    const phoneTrimmed = newItemContactPhone.trim();
    if (!emailTrimmed && !phoneTrimmed) {
      setError(t.errorContactRequired);
      return;
    }
    
    // Валидация: снимката е задължителна
    if (!newItemFile) {
      setError(t.errorImageRequired);
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({
          title: newItemTitle,
          description: newItemDescription,
          price: parseFloat(newItemPrice),
          ownerEmail: loggedInEmail,
          category: newItemCategory,
          contactEmail: emailTrimmed || null,
          contactPhone: phoneTrimmed || null,
        }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || t.errorCreateListing);
      }
      const createdItem = await res.json();
      
      setNewItemTitle("");
      setNewItemDescription("");
      setNewItemPrice("");
      setNewItemCategory("Други");
      setNewItemContactEmail("");
      setNewItemContactPhone("");
      const fileToUpload = newItemFile;
      setNewItemFile(null);
      setShowCreateForm(false);
      
      // Зареди items първо
      loadItems();
      
      // Отвори автоматично новосъздадената обява в детайлен view
      setSelectedItem(createdItem);
      setReviews([]); // Празни ревюта, защото е нова обява
      setView("detail"); // Превключи към детайлен view
      setMessage(t.successListingCreated);
      
      // Ако има избрана снимка, качи я автоматично
      if (fileToUpload && createdItem.id) {
        try {
          const formData = new FormData();
          formData.append("file", fileToUpload);
          const uploadRes = await fetch(`${API_BASE}/upload/${createdItem.id}`, {
            method: "POST",
            body: formData,
          });
          if (uploadRes.ok) {
            setMessage(t.successListingImageUploaded);
            // Презареди items и обнови selectedItem, за да видим новата снимка
            setTimeout(() => {
              loadItems();
              // Презареди selectedItem с актуализираните данни
              fetch(`${API_BASE}/items/${createdItem.id}`)
                .then((res) => res.json())
                .then((updated) => setSelectedItem(updated))
                .catch(() => {});
            }, 500);
          } else {
            const errorText = await uploadRes.text();
            setError(`${t.errorImageNotUploaded} ${errorText}`);
          }
        } catch (uploadErr: any) {
          setError(`${t.errorImageNotUploaded} ${uploadErr.message}`);
        }
      }
    } catch (err) {
      setError(String(err));
    }
  };

  // handler за промяна на файла при създаване
  const handleNewItemFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setNewItemFile(e.target.files[0]);
    }
  };


  // избиране на продукт + зареждане на ревюта и съобщения
  const openItem = async (item: Item | number) => {
    try {
      // Ако е подадено ID вместо обект, зареди обявата от сървъра
      let itemObj: Item;
      if (typeof item === 'number') {
        const res = await fetch(`${API_BASE}/items/${item}`);
        if (!res.ok) throw new Error("Failed to load item");
        itemObj = await res.json();
      } else {
        itemObj = item;
      }
      
      // Валидирай данните преди да ги използваш
      if (!itemObj || !itemObj.id) {
        throw new Error("Invalid item data");
      }
      
      console.log("Opening item:", itemObj);
      
      // Изчисти състоянието първо
      setError(null);
      setMessage(null);
      setShowOrderForm(false);
      setReviews([]);
      
      // Задай selectedItem и view заедно
      setSelectedItem(itemObj);
      setView("detail");
      
      // Зареди ревютата
      try {
        const res = await fetch(`${API_BASE}/items/${itemObj.id}/reviews`);
        if (!res.ok) throw new Error(t.errorLoadReviews);
        const data = await res.json();
        setReviews(data || []);
      } catch (err) {
        console.error("Error loading reviews:", err);
        setReviews([]);
      }
    } catch (err) {
      console.error("Error opening item:", err);
      setError(`Грешка при зареждане на обява: ${err instanceof Error ? err.message : String(err)}`);
      setSelectedItem(null);
      setView("all");
    }
    // Не зареждаме съобщенията тук - те са в страницата за съобщения
  };

  // Съобщенията се зареждат в страницата за съобщения, не тук

  // Зареждане на всички изпратени съобщения (като купувач)
  const loadSentMessages = async () => {
    if (!loggedInEmail) return;
    try {
      const res = await fetch(`${API_BASE}/items/messages/sent/${encodeURIComponent(loggedInEmail)}`);
      if (!res.ok) throw new Error("Failed to load sent messages");
      const data = await res.json();
      setSentMessages(data);
    } catch (err) {
      console.error("Error loading sent messages:", err);
      setSentMessages([]);
    }
  };

  // Зареждане на всички получени съобщения (като продавач)
  const loadReceivedMessages = async () => {
    if (!loggedInEmail) return;
    try {
      const res = await fetch(`${API_BASE}/items/messages/received/${encodeURIComponent(loggedInEmail)}`);
      if (!res.ok) throw new Error("Failed to load received messages");
      const data = await res.json();
      setReceivedMessages(data);
    } catch (err) {
      console.error("Error loading received messages:", err);
      setReceivedMessages([]);
    }
  };

  // Зареждане на всички съобщения за страницата
  const loadAllMessages = async () => {
    await Promise.all([loadSentMessages(), loadReceivedMessages()]);
  };

  // Зареждане на поръчките на потребителя (като купувач)
  const loadMyOrders = async () => {
    if (!loggedInEmail) return;
    try {
      const res = await fetch(`${API_BASE}/item-orders/customer/${encodeURIComponent(loggedInEmail)}`);
      if (!res.ok) throw new Error("Failed to load orders");
      const data = await res.json();
      setMyOrders(data);
    } catch (err) {
      console.error("Error loading orders:", err);
      setMyOrders([]);
    }
  };

  // Зареждане на поръчките към обявите на потребителя (като продавач)
  const loadSellerOrders = async () => {
    if (!loggedInEmail) return;
    try {
      const res = await fetch(`${API_BASE}/item-orders/seller/${encodeURIComponent(loggedInEmail)}`);
      if (!res.ok) throw new Error("Failed to load seller orders");
      const data = await res.json();
      setSellerOrders(data);
    } catch (err) {
      console.error("Error loading seller orders:", err);
      setSellerOrders([]);
    }
  };

  // Зареждане на всички поръчки
  const loadAllOrders = async () => {
    await Promise.all([loadMyOrders(), loadSellerOrders()]);
  };

  // Зареждане на любими обяви
  const loadFavorites = async () => {
    if (!loggedInEmail) return;
    try {
      const res = await fetch(`${API_BASE}/favorites/${encodeURIComponent(loggedInEmail)}`);
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Failed to load favorites:", errorText);
        throw new Error(errorText || "Failed to load favorites");
      }
      const data = await res.json();
      console.log("Favorites loaded:", data);
      setFavorites(data);
      // Създаваме Set от ID-та на любимите обяви за бърза проверка
      const favoriteIds = new Set<number>(data.map((f: Favorite) => f.item?.id).filter((id: any): id is number => id != null && typeof id === 'number'));
      setFavoriteItemIds(favoriteIds);
    } catch (err) {
      console.error("Error loading favorites:", err);
      setError(`Грешка при зареждане на любими: ${err instanceof Error ? err.message : String(err)}`);
      setFavorites([]);
      setFavoriteItemIds(new Set());
    }
  };

  // Добавяне към любими
  const addToFavorites = async (itemId: number) => {
    if (!loggedInEmail) {
      setError(t.errorMustLogin);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/favorites`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({ userEmail: loggedInEmail, itemId }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || t.errorAddFavorite);
      }
      await loadFavorites();
      setMessage(t.successAddedToFavorites);
    } catch (err: any) {
      setError(err.message || t.errorAddFavorite);
    }
  };

  // Премахване от любими
  const removeFromFavorites = async (itemId: number) => {
    if (!loggedInEmail) return;
    try {
      const res = await fetch(`${API_BASE}/favorites/${encodeURIComponent(loggedInEmail)}/${itemId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove from favorites");
      await loadFavorites();
      setMessage(t.successRemovedFromFavorites);
    } catch (err) {
      setError(t.errorRemoveFavorite);
    }
  };

  // Активиране на VIP
  const activateVip = async (itemId: number) => {
    if (!loggedInEmail) {
      setError(t.errorMustLogin);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/vip/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({ ownerEmail: loggedInEmail, itemId }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || t.errorActivateVip);
      }
      await loadItems();
      if (selectedItem && selectedItem.id === itemId) {
        const updated = await fetch(`${API_BASE}/items/${itemId}`).then(r => r.json());
        setSelectedItem(updated);
      }
      setMessage(t.successVipActivated);
    } catch (err: any) {
      setError(err.message || t.errorActivateVip);
    }
  };

  // Обновяване на статус на поръчка (само за продавачи)
  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE}/item-orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update order status");
      await loadAllOrders();
      setMessage(t.orderStatusUpdated);
    } catch (err) {
      setError(String(err));
    }
  };

  // изпращане на въпрос
  const handleSendQuestion = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !loggedInEmail) return;
    if (selectedItem.ownerEmail === loggedInEmail) {
      setError(t.cannotAskOwnListing);
      return;
    }
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/items/${selectedItem.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({
          senderEmail: loggedInEmail,
          content: newQuestion,
        }),
      });
      if (!res.ok) throw new Error(t.errorSendQuestion);
      await res.json(); // Съобщението е изпратено
      setNewQuestion("");
      setMessage(t.successQuestionSent);
      setSelectedItem(null);
      // Презареди всички съобщения
      await loadAllMessages();
    } catch (err) {
      setError(String(err));
    }
  };

  // изпращане на отговор
  const handleSendAnswer = async (messageId: number) => {
    if (!newAnswer[messageId] || !loggedInEmail) return;
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/items/messages/${messageId}/response`, {
        method: "PUT",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({
          response: newAnswer[messageId],
        }),
      });
      if (!res.ok) throw new Error(t.errorSendAnswer);
      await res.json(); // Отговорът е изпратен
      setNewAnswer((prev) => {
        const updated = { ...prev };
        delete updated[messageId];
        return updated;
      });
      setMessage(t.successAnswerSent);
      // Презареди всички съобщения
      await loadAllMessages();
    } catch (err) {
      setError(String(err));
    }
  };

  // създаване на поръчка
  const handleCreateOrder = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !loggedInEmail) return;
    if (!paymentMethod || !deliveryMethod || !deliveryAddress.trim()) {
      setError(t.orderRequired);
      return;
    }
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/item-orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({
          customerEmail: loggedInEmail,
          itemId: selectedItem.id,
          paymentMethod: paymentMethod,
          deliveryMethod: deliveryMethod,
          deliveryAddress: deliveryAddress,
        }),
      });
      if (!res.ok) throw new Error(t.errorCreateOrder);
      setMessage(t.successOrderCreated);
      setShowOrderForm(false);
      setPaymentMethod("");
      setDeliveryMethod("");
      setDeliveryAddress("");
      // Презареди поръчките ако сме на страницата за поръчки
      if (view === "orders") {
        await loadAllOrders();
      }
    } catch (err) {
      setError(String(err));
    }
  };

  // добавяне на ревю
  const handleAddReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    // Блокирай ревюта на собствени обяви
    if (selectedItem.ownerEmail === loggedInEmail) {
      setError(t.cannotReviewOwn);
      return;
    }
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/items/${selectedItem.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({
          authorEmail: loggedInEmail || "guest@example.com",
          rating: reviewRating,
          comment: reviewComment,
        }),
      });
      if (!res.ok) throw new Error(t.errorAddReview);
      const created = await res.json();
      setReviews((prev) => [...prev, created]);
      setReviewComment("");
      setReviewRating(5);
      setMessage(t.successReviewAdded);
    } catch (err) {
      setError(String(err));
    }
  };

  // upload на снимка
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedItem || !file) return;
    
    // Проверка дали потребителят е собственик на обявата
    if (!loggedInEmail || selectedItem.ownerEmail !== loggedInEmail) {
      setError("Можете да качвате снимки само към собствените си обяви");
      return;
    }
    
    setError(null);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("ownerEmail", loggedInEmail);

      const res = await fetch(`${API_BASE}/upload/${selectedItem.id}`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || t.errorUploadImage);
      }
      await res.text(); // "UPLOAD_OK"
      setMessage(t.successImageUploaded);
      setFile(null);
      loadItems();
    } catch (err) {
      setError(String(err));
    }
  };


  // Debug logging
  useEffect(() => {
    console.log('App render:', { view, loggedInEmail, itemsCount: items.length });
  }, [view, loggedInEmail, items.length]);

  return (
    <div className="app-container">
      <Header
        language={language}
        setLanguage={setLanguage}
        loggedInEmail={loggedInEmail}
        view={view}
        setView={setView}
        setSelectedItem={setSelectedItem}
        setReviews={setReviews}
      />

      {/* AUTH СЕКЦИЯ - показва се когато view === "auth" */}
      {view === "auth" && (
        <AuthSection
          loggedInEmail={loggedInEmail}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          fullName={fullName}
          setFullName={setFullName}
          language={language}
          handleLogin={handleLogin}
          handleRegister={handleRegister}
          handleLogout={handleLogout}
        />
      )}

      {error && (
        <div className="alert alert-error">
          <strong>{t.error}</strong> {error}
        </div>
      )}
      {message && (
        <div className="alert alert-success">
          <strong>{message}</strong>
        </div>
      )}

      {/* ДЕТАЙЛЕН VIEW - показва се когато view === "detail" */}
      {view === "detail" && selectedItem && selectedItem.id && (
        <ItemDetail
          item={selectedItem}
          reviews={reviews}
          loggedInEmail={loggedInEmail}
          language={language}
          favoriteItemIds={favoriteItemIds}
          showOrderForm={showOrderForm}
          paymentMethod={paymentMethod}
          deliveryMethod={deliveryMethod}
          deliveryAddress={deliveryAddress}
          reviewRating={reviewRating}
          reviewComment={reviewComment}
          file={file}
          onBack={() => {
            setView("all");
            setSelectedItem(null);
            setReviews([]);
          }}
          onAddToFavorites={addToFavorites}
          onRemoveFromFavorites={removeFromFavorites}
          onActivateVip={activateVip}
          onToggleOrderForm={() => setShowOrderForm(!showOrderForm)}
          onPaymentMethodChange={setPaymentMethod}
          onDeliveryMethodChange={setDeliveryMethod}
          onDeliveryAddressChange={setDeliveryAddress}
          onCreateOrder={handleCreateOrder}
          onFileChange={handleFileChange}
          onUpload={handleUpload}
          onReviewRatingChange={setReviewRating}
          onReviewCommentChange={setReviewComment}
          onAddReview={handleAddReview}
          onGoToMessages={() => {
            setView("messages");
            loadAllMessages();
          }}
        />
      )}

      {/* СТРАНИЦА ЗА СЪОБЩЕНИЯ */}
      {loggedInEmail && view === "messages" && (
        <MessagesPage
          selectedItem={selectedItem}
          items={items}
          loggedInEmail={loggedInEmail}
          sentMessages={sentMessages}
          receivedMessages={receivedMessages}
          newQuestion={newQuestion}
          newAnswer={newAnswer}
          language={language}
          onQuestionChange={setNewQuestion}
          onAnswerChange={(messageId, answer) =>
            setNewAnswer((prev) => ({ ...prev, [messageId]: answer }))
          }
          onSelectItem={setSelectedItem}
          onClearSelection={() => {
            setSelectedItem(null);
            setNewQuestion("");
          }}
          onSendQuestion={handleSendQuestion}
          onSendAnswer={(messageId) => {
            handleSendAnswer(messageId);
            loadAllMessages();
          }}
          onViewItem={(item) => {
            setSelectedItem(item);
            setView("detail");
          }}
        />
      )}

      {/* СТРАНИЦА ЗА ЛЮБИМИ */}
      {loggedInEmail && view === "favorites" && (
        <FavoritesPage
          favorites={favorites}
          language={language}
          onItemClick={openItem}
          onRemoveFavorite={removeFromFavorites}
        />
      )}

      {loggedInEmail && view === "orders" && (
        <OrdersPage
          myOrders={myOrders}
          sellerOrders={sellerOrders}
          language={language}
          onViewItem={(item) => {
            setSelectedItem(item);
            setView("detail");
          }}
          onUpdateOrderStatus={updateOrderStatus}
        />
      )}

      {/* СПИСЪК С ОБЯВИ - само ако е логнат */}
      {loggedInEmail && (view === "all" || view === "mine") && (
        <section className="listings-section">
          <div className="listings-main">
            <div className="listings-header">
              <h2>{view === "all" ? "Всички обяви" : "Моите обяви"}</h2>
              {view === "mine" && loggedInEmail && (
                <button
                  className="btn-primary"
                  onClick={() => setShowCreateForm(!showCreateForm)}
                >
                  {showCreateForm ? "Откажи" : "+ Създай обява"}
                </button>
              )}
            </div>

            {/* Форма за създаване на обява */}
            <CreateListingForm
              show={showCreateForm && !!loggedInEmail}
              title={newItemTitle}
              description={newItemDescription}
              price={newItemPrice}
              category={newItemCategory}
              contactEmail={newItemContactEmail}
              contactPhone={newItemContactPhone}
              file={newItemFile}
              onTitleChange={setNewItemTitle}
              onDescriptionChange={setNewItemDescription}
              onPriceChange={setNewItemPrice}
              onCategoryChange={setNewItemCategory}
              onContactEmailChange={setNewItemContactEmail}
              onContactPhoneChange={setNewItemContactPhone}
              onFileChange={handleNewItemFileChange}
              onSubmit={handleCreateListing}
            />

            {/* Филтър по категория */}
            <div className="category-filter">
              <label>
                <strong>Категория:</strong>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {view === "mine" && !loggedInEmail && (
              <p className="info-text">
                За да виждате „моите обяви“, първо влезте в системата.
              </p>
            )}

            <ItemList
              items={items}
              view={view}
              loggedInEmail={loggedInEmail}
              selectedCategory={selectedCategory}
              onItemClick={openItem}
            />
          </div>
        </section>
      )}

      {/* FALLBACK - ако нищо не се показва, покажи поне това */}
      {!loggedInEmail && view !== "auth" && view !== "detail" && view !== "favorites" && view !== "orders" && view !== "messages" && view !== "all" && view !== "mine" && (
        <div style={{ padding: "40px", textAlign: "center", background: "rgba(255, 255, 255, 0.95)", margin: "40px auto", maxWidth: "600px", borderRadius: "12px" }}>
          <h2>Добре дошли в Web Shop!</h2>
          <p>Моля, влезте в системата или се регистрирайте, за да продължите.</p>
          <button 
            className="btn-primary" 
            onClick={() => setView("auth")}
            style={{ marginTop: "20px" }}
          >
            Вход / Регистрация
          </button>
        </div>
      )}
    </div>
  );
}

export default App;

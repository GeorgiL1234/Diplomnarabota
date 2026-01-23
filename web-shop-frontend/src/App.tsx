
import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import "./App.css";
import { translations, type Language } from "./translations";

type Item = {
  id: number;
  title: string;
  description: string;
  price: number;
  imageUrl?: string | null;
  ownerEmail?: string | null;
  category?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  isVip?: boolean | null;
};

type Favorite = {
  id: number;
  userEmail: string;
  item: Item;
};

type Review = {
  id: number;
  authorEmail: string;
  rating: number;
  comment: string;
};

type Message = {
  id: number;
  senderEmail: string;
  content: string;
  response?: string | null;
  createdAt: string;
  item?: Item | null;
};

type ItemOrder = {
  id: number;
  customerEmail: string;
  item: Item;
  paymentMethod: string;
  deliveryMethod: string;
  deliveryAddress: string;
  totalPrice: number;
  createdAt: string;
  status: string;
};

const API_BASE = "http://localhost:8080";

const CATEGORIES = [
  "Всички",
  "Електроника",
  "Книги",
  "Дрехи",
  "Спорт",
  "Дом и градина",
  "Автомобили",
  "Други",
];

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
  type View = "all" | "mine" | "auth" | "detail" | "messages" | "orders" | "favorites";
  const [view, setView] = useState<View>("auth"); // Започваме с auth страницата
  
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
  const t = translations[language];

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

  // helper функция за пътя на изображенията
  const getImageUrl = (imageUrl: string | null | undefined): string => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http")) return imageUrl;
    return `${API_BASE}${imageUrl}`;
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

  // филтриране на обяви
  const filteredItems = items.filter((it) => {
    // филтър по категория
    if (selectedCategory !== "Всички") {
      if (!it.category || it.category !== selectedCategory) return false;
    }
    // филтър по "моите обяви"
    if (view === "mine") {
      if (!loggedInEmail) return false;
      return it.ownerEmail === loggedInEmail;
    }
    return true;
  });

  return (
    <div className="app-container">
      <header className="app-header">
        <div>
          <h1 className="app-title">Web Shop</h1>
          <p className="app-subtitle">{t.subtitle}</p>
        </div>
        <nav className="app-nav">
          <select
            className="language-selector"
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
          >
            <option value="bg">🇧🇬 БГ</option>
            <option value="en">🇬🇧 EN</option>
            <option value="ru">🇷🇺 RU</option>
          </select>
          {loggedInEmail && (
            <>
              <button
                type="button"
                className={`nav-btn ${view === "all" ? "active" : ""}`}
                onClick={() => {
                  setView("all");
                  setSelectedItem(null);
                  setReviews([]);
                }}
              >
                {t.navListings}
              </button>
              <button
                type="button"
                className={`nav-btn ${view === "mine" ? "active" : ""}`}
                onClick={() => {
                  setView("mine");
                  setSelectedItem(null);
                  setReviews([]);
                }}
              >
                {t.navMyListings}
              </button>
              <button
                type="button"
                className={`nav-btn ${view === "favorites" ? "active" : ""}`}
                onClick={() => {
                  setView("favorites");
                  setSelectedItem(null);
                  setReviews([]);
                }}
              >
                {t.navFavorites}
              </button>
              <button
                type="button"
                className={`nav-btn ${view === "messages" ? "active" : ""}`}
                onClick={() => {
                  setView("messages");
                  setSelectedItem(null);
                  setReviews([]);
                }}
              >
                {t.navMessages}
              </button>
              <button
                type="button"
                className={`nav-btn ${view === "orders" ? "active" : ""}`}
                onClick={() => {
                  setView("orders");
                  setSelectedItem(null);
                  setReviews([]);
                }}
              >
                {t.navOrders}
              </button>
            </>
          )}
          <button
            type="button"
            className={`nav-btn ${view === "auth" ? "active" : ""}`}
            onClick={() => {
              setView("auth");
              setSelectedItem(null);
              setReviews([]);
            }}
          >
            {loggedInEmail ? t.navProfile : t.navLogin}
          </button>
        </nav>
      </header>

      {/* AUTH СЕКЦИЯ - показва се винаги, ако не е логнат, но не когато е детайлен view или favorites */}
      {(!loggedInEmail || view === "auth") && view !== "detail" && view !== "favorites" && view !== "orders" && view !== "messages" && view !== "all" && view !== "mine" && (
        <section className="auth-section">
          {loggedInEmail ? (
            <div className="auth-welcome">
              <h2>Добре дошли!</h2>
              <p>
                Логнат като: <strong>{loggedInEmail}</strong>
              </p>
              <button className="btn-primary" onClick={handleLogout}>
                Изход
              </button>
            </div>
          ) : (
            <>
              <h2>Вход / Регистрация</h2>
              <form onSubmit={handleLogin} className="auth-form">
                <h3>Вход</h3>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Парола:</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary">
                  Вход
                </button>
              </form>

              <form onSubmit={handleRegister} className="auth-form">
                <h3>Регистрация</h3>
                <div className="form-group">
                  <label>Пълно име:</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Парола:</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <p style={{ fontSize: "12px", color: "#64748b", marginTop: "4px", marginBottom: 0 }}>
                    Паролата трябва да има поне 8 символа и да съдържа поне един специален символ (!@#$%^&* и т.н.)
                  </p>
                </div>
                <button type="submit" className="btn-primary">
                  Регистрация
                </button>
              </form>
            </>
          )}
        </section>
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
        <section className="detail-view-section" key={`detail-${selectedItem.id}`}>
          <div className="detail-view-container">
            <button
              className="btn-back"
              onClick={() => {
                setView("all");
                setSelectedItem(null);
                setReviews([]);
              }}
            >
              {t.backToListings}
            </button>
            <div className="item-details-full">
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <h2 style={{ margin: 0 }}>{selectedItem.title || ""}</h2>
                {selectedItem.isVip && (
                  <div className="vip-badge" style={{ fontSize: "14px", padding: "4px 12px" }}>ВИП</div>
                )}
              </div>
              {selectedItem.category && (
                <span className="item-category-badge">{selectedItem.category}</span>
              )}
              <p className="item-detail-description">{selectedItem.description || ""}</p>
              <p className="item-detail-price">
                <strong>{t.priceLabel} {(selectedItem.price || 0).toFixed(2)} {t.currency}</strong>
              </p>

              {/* Бутон за добавяне към любими */}
              {selectedItem.ownerEmail && selectedItem.ownerEmail !== loggedInEmail && (
                <div style={{ marginBottom: "16px" }}>
                  {favoriteItemIds.has(selectedItem.id) ? (
                    <button
                      className="btn-secondary"
                      onClick={() => removeFromFavorites(selectedItem.id)}
                    >
                      {t.removeFromFavorites}
                    </button>
                  ) : (
                    <button
                      className="btn-secondary"
                      onClick={() => addToFavorites(selectedItem.id)}
                    >
                      {t.addToFavorites}
                    </button>
                  )}
                </div>
              )}

              {/* Бутон за активиране на VIP - само за собственика */}
              {selectedItem.ownerEmail && selectedItem.ownerEmail === loggedInEmail && !selectedItem.isVip && (
                <div style={{ marginBottom: "16px" }}>
                  <button
                    className="btn-primary"
                    onClick={() => activateVip(selectedItem.id)}
                  >
                    {t.activateVip} (2 {t.currency})
                  </button>
                </div>
              )}

              {/* Бутон за поръчка - само ако не е собствена обява */}
              {selectedItem.ownerEmail && selectedItem.ownerEmail !== loggedInEmail && (
                <div className="order-section">
                  <button
                    className="btn-primary btn-order"
                    onClick={() => setShowOrderForm(!showOrderForm)}
                  >
                    {showOrderForm ? t.cancelOrder : t.orderButton}
                  </button>
                </div>
              )}

              {/* Форма за поръчка */}
              {showOrderForm && selectedItem.ownerEmail && selectedItem.ownerEmail !== loggedInEmail && (
                <form onSubmit={handleCreateOrder} className="order-form">
                  <h3>{t.orderTitle}</h3>
                  <div className="form-group">
                    <label>{t.paymentMethod}</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      required
                    >
                      <option value="">{t.paymentMethod}</option>
                      <option value="bank_transfer">{t.paymentBankTransfer}</option>
                      <option value="cash_on_delivery">{t.paymentCashOnDelivery}</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>{t.deliveryMethod}</label>
                    <select
                      value={deliveryMethod}
                      onChange={(e) => setDeliveryMethod(e.target.value)}
                      required
                    >
                      <option value="">{t.deliveryMethod}</option>
                      <option value="speedy">{t.deliverySpeedy}</option>
                      <option value="econt">{t.deliveryEcont}</option>
                    </select>
                  </div>
                  <p className="delivery-note">{t.deliveryNote}</p>
                  <div className="form-group">
                    <label>{t.deliveryAddress}</label>
                    <textarea
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder={t.deliveryAddressPlaceholder}
                      rows={3}
                      required
                    />
                  </div>
                  <button type="submit" className="btn-primary">
                    {t.submitOrder}
                  </button>
                </form>
              )}
              
              {/* Контактна информация */}
              <div className="contact-section">
                <h3>{t.contactTitle}</h3>
                <div className="contact-info-wrapper">
                  {selectedItem.contactEmail ? (
                    <div className="contact-item">
                      <span className="contact-icon">📧</span>
                      <div className="contact-details">
                        <span className="contact-label">{t.contactEmailLabel}</span>
                        <a href={`mailto:${selectedItem.contactEmail}`} className="contact-value">
                          {selectedItem.contactEmail}
                        </a>
                      </div>
                    </div>
                  ) : null}
                  {selectedItem.contactPhone ? (
                    <div className="contact-item">
                      <span className="contact-icon">📱</span>
                      <div className="contact-details">
                        <span className="contact-label">{t.contactPhoneLabel}</span>
                        <a href={`tel:${selectedItem.contactPhone}`} className="contact-value">
                          {selectedItem.contactPhone}
                        </a>
                      </div>
                    </div>
                  ) : null}
                  {!selectedItem.contactEmail && !selectedItem.contactPhone && (
                    <p className="contact-empty">{t.noContactInfo}</p>
                  )}
                </div>
              </div>
              
              {selectedItem.imageUrl && (
                <img
                  src={getImageUrl(selectedItem.imageUrl)}
                  alt={selectedItem.title}
                  className="item-detail-image"
                />
              )}

              {/* Качване на снимка - само за собственика */}
              {selectedItem.ownerEmail && selectedItem.ownerEmail === loggedInEmail && (
                <div className="upload-section">
                  <h3>{t.uploadImage}</h3>
                  <input type="file" onChange={handleFileChange} />
                  <button
                    className="btn-secondary"
                    onClick={handleUpload}
                    disabled={!file}
                  >
                    {t.upload}
                  </button>
                </div>
              )}

              {/* Връзка към страницата за съобщения */}
              <div className="messages-link-section">
                <p className="info-text">
                  {selectedItem.ownerEmail && selectedItem.ownerEmail === loggedInEmail 
                    ? t.viewMessagesInPage 
                    : t.askQuestionInMessagesPage}
                </p>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setView("messages");
                    loadAllMessages();
                  }}
                >
                  {t.goToMessagesPage}
                </button>
              </div>

              {/* Ревюта */}
              <div className="reviews-section">
                <h3>{t.reviews} ({reviews.length})</h3>
                {reviews.length === 0 ? (
                  <p className="info-text">{t.noReviews}</p>
                ) : (
                  <ul className="reviews-list">
                    {reviews.map((r) => (
                      <li key={r.id} className="review-item">
                        <div className="review-header">
                          <strong>{r.authorEmail}</strong>
                          <span className="review-rating">⭐ {r.rating}/5</span>
                        </div>
                        <p className="review-comment">{r.comment}</p>
          </li>
        ))}
      </ul>
                )}

                {/* Блокирай формата за ревю ако е собствена обява */}
                {selectedItem.ownerEmail !== loggedInEmail && (
                  <form onSubmit={handleAddReview} className="review-form">
                    <div className="form-group">
                      <label>{t.rating}</label>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={reviewRating}
                        onChange={(e) => setReviewRating(Number(e.target.value))}
                        className="rating-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>{t.comment}</label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        rows={3}
                        required
                      />
                    </div>
                    <button type="submit" className="btn-primary">
                      {t.addReview}
                    </button>
                  </form>
                )}
                {selectedItem.ownerEmail === loggedInEmail && (
                  <p className="info-text">{t.cannotReviewOwn}</p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* СТРАНИЦА ЗА СЪОБЩЕНИЯ */}
      {loggedInEmail && view === "messages" && (
        <section className="listings-section">
          <div className="listings-main">
            <h2>{t.questionsTitle}</h2>

            {/* Форма за задаване на нов въпрос */}
            {selectedItem && selectedItem.ownerEmail !== loggedInEmail && (
              <div className="new-question-section">
                <h3>{t.askQuestion}</h3>
                <form onSubmit={handleSendQuestion} className="question-form">
                  <div className="form-group">
                    <label>{t.listingTitle} {selectedItem.title}</label>
                    <textarea
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder={t.questionPlaceholder}
                      rows={3}
                      required
                    />
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button type="submit" className="btn-primary">
                      {t.sendMessage}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => {
                        setSelectedItem(null);
                        setNewQuestion("");
                      }}
                    >
                      {t.cancel}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Списък с обяви за избор */}
            {!selectedItem && (
              <div className="select-listing-section" style={{ marginBottom: "30px" }}>
                <h3>{t.selectListingToAskQuestion}</h3>
                <div className="items-grid" style={{ marginTop: "16px" }}>
                  {items
                    .filter((it) => it.ownerEmail !== loggedInEmail)
                    .slice(0, 6)
                    .map((it) => (
                      <div
                        key={it.id}
                        className="item-card"
                        onClick={() => setSelectedItem(it)}
                        style={{ cursor: "pointer" }}
                      >
            {it.imageUrl && (
              <img
                            src={getImageUrl(it.imageUrl)}
                alt={it.title}
                            className="item-image"
                          />
                        )}
                        <div className="item-info">
                          <h3 className="item-title">{it.title}</h3>
                          <p className="item-price">
                            {it.price.toFixed(2)} {t.currency}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Изпратени въпроси */}
            <div className="messages-page-section">
              <h3>{t.sentQuestions}</h3>
              {sentMessages.length === 0 ? (
                <p className="info-text">{t.noSentQuestions}</p>
              ) : (
                <ul className="messages-list">
                  {sentMessages.map((msg) => (
                    <li key={msg.id} className="message-item-full">
                      {/* Информация за обявата */}
                      {msg.item && (
                        <div className="message-item-listing-card">
                          <div className="listing-card-header">
                            {msg.item.imageUrl && (
                              <img
                                src={getImageUrl(msg.item.imageUrl)}
                                alt={msg.item.title}
                                className="listing-card-image"
                              />
                            )}
                            <div className="listing-card-info">
                              <h4>{msg.item.title}</h4>
                              <p className="listing-card-description">{msg.item.description}</p>
                              <p className="listing-card-price">
                                {t.priceLabel}: {msg.item.price.toFixed(2)} {t.currency}
                              </p>
                              <button
                                className="btn-secondary"
                                onClick={() => {
                                  setSelectedItem(msg.item!);
                                  setView("detail");
                                }}
                              >
                                {t.viewListing}
                              </button>
                            </div>
                          </div>
                          {/* Контактна информация на продавача */}
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
                      
                      {/* Съобщението */}
                      <div className="message-question">
                        <div className="message-header">
                          <strong>{t.yourQuestion}</strong>
                          <span className="message-date">
                            {new Date(msg.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="message-content">{msg.content}</p>
                      </div>
                      
                      {/* Отговорът */}
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

            {/* Получени въпроси */}
            <div className="messages-page-section">
              <h3>{t.receivedQuestions}</h3>
              {receivedMessages.length === 0 ? (
                <p className="info-text">{t.noReceivedQuestions}</p>
              ) : (
                <ul className="messages-list">
                  {receivedMessages.map((msg) => (
                    <li key={msg.id} className="message-item-full">
                      {/* Информация за обявата */}
                      {msg.item && (
                        <div className="message-item-listing-card">
                          <div className="listing-card-header">
                            {msg.item.imageUrl && (
                              <img
                                src={getImageUrl(msg.item.imageUrl)}
                                alt={msg.item.title}
                                className="listing-card-image"
                              />
                            )}
                            <div className="listing-card-info">
                              <h4>{msg.item.title}</h4>
                              <p className="listing-card-description">{msg.item.description}</p>
                              <p className="listing-card-price">
                                {t.priceLabel}: {msg.item.price.toFixed(2)} {t.currency}
                              </p>
                              <button
                                className="btn-secondary"
                                onClick={() => {
                                  setSelectedItem(msg.item!);
                                  setView("detail");
                                }}
                              >
                                {t.viewListing}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Съобщението */}
                      <div className="message-question">
                        <div className="message-header">
                          <strong>{msg.senderEmail}</strong>
                          <span className="message-date">
                            {new Date(msg.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="message-content">{msg.content}</p>
                      </div>
                      
                      {/* Отговорът или форма за отговор */}
                      {msg.response ? (
                        <div className="message-response">
                          <div className="message-header">
                            <strong>{t.sellerResponse}</strong>
                          </div>
                          <p className="message-content">{msg.response}</p>
                        </div>
                      ) : (
                        <div className="message-answer-form">
                          <textarea
                            value={newAnswer[msg.id] || ""}
                            onChange={(e) =>
                              setNewAnswer((prev) => ({
                                ...prev,
                                [msg.id]: e.target.value,
                              }))
                            }
                            placeholder={t.answerPlaceholder}
                            rows={3}
                          />
                          <button
                            className="btn-primary"
                            onClick={() => {
                              handleSendAnswer(msg.id);
                              loadAllMessages();
                            }}
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
      )}

      {/* СТРАНИЦА ЗА ПОРЪЧКИ */}
      {loggedInEmail && view === "favorites" && (
        <section className="listings-section">
          <div className="listings-main">
            <h2>{t.favoritesTitle}</h2>
            {favorites.length === 0 ? (
              <p className="info-text">{t.noFavorites}</p>
            ) : (
              <ul className="items-list">
                {favorites.map((fav) => {
                  const item = fav.item;
                  if (!item) return null; // Пропусни ако item е null/undefined
                  return (
                    <li key={item.id} className="item-card">
                      {item.isVip && (
                        <div className="vip-badge">ВИП</div>
                      )}
                      {item.imageUrl && (
                        <img
                          src={getImageUrl(item.imageUrl)}
                          alt={item.title}
                          className="item-image"
                          onClick={() => openItem(item)}
                        />
                      )}
                      <div className="item-info">
                        <h3 onClick={() => openItem(item)}>{item.title}</h3>
                        <p className="item-price">{item.price.toFixed(2)} {t.currency}</p>
                        <p className="item-category">{item.category}</p>
                        <button
                          className="btn-secondary"
                          onClick={() => removeFromFavorites(item.id)}
                        >
                          {t.removeFromFavorites}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      )}

      {loggedInEmail && view === "orders" && (
        <section className="listings-section">
          <div className="listings-main">
            <h2>{t.ordersTitle}</h2>

            {/* Моите поръчки (като купувач) */}
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
                        <p><strong>{t.priceLabel}:</strong> {order.totalPrice.toFixed(2)} {t.currency}</p>
                        <p><strong>{t.paymentMethod}:</strong> {
                          order.paymentMethod === 'bank_transfer' ? t.paymentBankTransfer :
                          order.paymentMethod === 'cash_on_delivery' ? t.paymentCashOnDelivery :
                          order.paymentMethod
                        }</p>
                        <p><strong>{t.deliveryMethod}:</strong> {
                          order.deliveryMethod === 'speedy' ? t.deliverySpeedy :
                          order.deliveryMethod === 'econt' ? t.deliveryEcont :
                          order.deliveryMethod
                        }</p>
                        <p><strong>{t.deliveryAddress}:</strong> {order.deliveryAddress}</p>
                      </div>
                      <button
                        className="btn-secondary"
                        onClick={() => {
                          setSelectedItem(order.item);
                          setView("detail");
                        }}
                      >
                        {t.viewListing}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Поръчки към моите обяви (като продавач) */}
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
                          <p className="order-customer">{t.orderedBy}: {order.customerEmail}</p>
                        </div>
                        <span className={`order-status status-${order.status.toLowerCase()}`}>
                          {t[`status${order.status}` as keyof typeof t] || order.status}
                        </span>
                      </div>
                      <div className="order-details">
                        <p><strong>{t.priceLabel}:</strong> {order.totalPrice.toFixed(2)} {t.currency}</p>
                        <p><strong>{t.paymentMethod}:</strong> {
                          order.paymentMethod === 'bank_transfer' ? t.paymentBankTransfer :
                          order.paymentMethod === 'cash_on_delivery' ? t.paymentCashOnDelivery :
                          order.paymentMethod
                        }</p>
                        <p><strong>{t.deliveryMethod}:</strong> {
                          order.deliveryMethod === 'speedy' ? t.deliverySpeedy :
                          order.deliveryMethod === 'econt' ? t.deliveryEcont :
                          order.deliveryMethod
                        }</p>
                        <p><strong>{t.deliveryAddress}:</strong> {order.deliveryAddress}</p>
                      </div>
                      {order.status === "PENDING" && (
                        <div className="order-actions">
                          <button
                            className="btn-primary"
                            onClick={() => updateOrderStatus(order.id, "CONFIRMED")}
                          >
                            {t.confirmOrder}
                          </button>
                          <button
                            className="btn-secondary"
                            onClick={() => updateOrderStatus(order.id, "CANCELLED")}
                          >
                            {t.cancelOrder}
                          </button>
                        </div>
                      )}
                      {order.status === "CONFIRMED" && (
                        <div className="order-actions">
                          <button
                            className="btn-primary"
                            onClick={() => updateOrderStatus(order.id, "SHIPPED")}
                          >
                            {t.markAsShipped}
                          </button>
                        </div>
                      )}
                      {order.status === "SHIPPED" && (
                        <div className="order-actions">
                          <button
                            className="btn-primary"
                            onClick={() => updateOrderStatus(order.id, "DELIVERED")}
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
            {showCreateForm && loggedInEmail && (
              <form onSubmit={handleCreateListing} className="create-listing-form">
                <h3>Създай нова обява</h3>
                <div className="form-group">
                  <label>Заглавие:</label>
                  <input
                    type="text"
                    value={newItemTitle}
                    onChange={(e) => setNewItemTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Описание:</label>
                  <textarea
                    value={newItemDescription}
                    onChange={(e) => setNewItemDescription(e.target.value)}
                    required
                    rows={3}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Цена (лв.):</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newItemPrice}
                      onChange={(e) => setNewItemPrice(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Категория:</label>
                    <select
                      value={newItemCategory}
                      onChange={(e) => setNewItemCategory(e.target.value)}
                    >
                      {CATEGORIES.filter((c) => c !== "Всички").map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Контакт Email:</label>
                    <input
                      type="email"
                      value={newItemContactEmail}
                      onChange={(e) => setNewItemContactEmail(e.target.value)}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="form-group">
                    <label>Контакт Телефон:</label>
                    <input
                      type="tel"
                      value={newItemContactPhone}
                      onChange={(e) => setNewItemContactPhone(e.target.value)}
                      placeholder="+359 888 123 456"
                    />
                  </div>
                </div>
                <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "16px", fontStyle: "italic" }}>
                  * Трябва да посочите поне email или телефон за контакт
                </p>
                <div className="form-group">
                  <label>{t.image} *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleNewItemFileChange}
                    required
                  />
                  {newItemFile && (
                    <p style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                      {t.selected}: {newItemFile.name}
                    </p>
                  )}
                </div>
                <button type="submit" className="btn-primary">
                  Създай обява
                </button>
              </form>
            )}

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

            {filteredItems.length === 0 ? (
              <p className="info-text">Няма обяви.</p>
            ) : (
              <div className="items-grid">
                {filteredItems.map((it) => (
                  <div
                    key={it.id}
                    className="item-card"
                    onClick={() => openItem(it)}
                  >
                    {it.isVip && (
                      <div className="vip-badge">ВИП</div>
                    )}
                    {it.imageUrl && (
                      <img
                        src={getImageUrl(it.imageUrl)}
                        alt={it.title}
                        className="item-image"
                      />
                    )}
                    <div className="item-content">
                      <h3 className="item-title">{it.title}</h3>
                      <p className="item-description">{it.description}</p>
                      <div className="item-footer">
                        <span className="item-price">{it.price.toFixed(2)} лв.</span>
                        {it.category && (
                          <span className="item-category">{it.category}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

export default App;

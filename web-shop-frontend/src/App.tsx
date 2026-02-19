
import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import "./App.css";
import { translations, getCategoryLabel, type Language } from "./translations";
import type { Item, Favorite, Review, Message, ItemOrder, View } from "./types";
import { CATEGORIES } from "./types";
import { API_BASE } from "./config";
import { Header } from "./components/Header";
import { LoginPage } from "./components/LoginPage";
import { RegisterPage } from "./components/RegisterPage";
import { ItemDetail } from "./components/ItemDetail";
import { ItemList } from "./components/ItemList";
import { CreateListingForm } from "./components/CreateListingForm";
import { MessagesPage } from "./components/MessagesPage";
import { OrdersPage } from "./components/OrdersPage";
import { FavoritesPage } from "./components/FavoritesPage";
import { VipListingsPage } from "./components/VipListingsPage";
import { VipPaymentForm } from "./components/VipPaymentForm";
import { LandingPage } from "./components/LandingPage";
import { useWebSocketMessages } from "./useWebSocketMessages";

function App() {
  // auth - login state (отделни променливи за вход)
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // auth - register state (отделни променливи за регистрация)
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Запазваме email в localStorage за персистентност
  const [loggedInEmail, setLoggedInEmail] = useState<string | null>(() => {
    return localStorage.getItem("loggedInEmail");
  });
  
  // Wrapper функция за setLoggedInEmail която също обновява localStorage
  const updateLoggedInEmail = (email: string | null) => {
    if (email) {
      localStorage.setItem("loggedInEmail", email);
    } else {
      localStorage.removeItem("loggedInEmail");
    }
    setLoggedInEmail(email);
  };

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
  const [newItemPaymentMethod, setNewItemPaymentMethod] = useState("cash_on_delivery");
  const [newItemIsVip, setNewItemIsVip] = useState(false);
  const [newItemFile, setNewItemFile] = useState<File | null>(null);
  const [isCreatingListing, setIsCreatingListing] = useState(false);
  
  // VIP Payment state
  const [showVipPayment, setShowVipPayment] = useState(false);
  const [pendingVipItemId, setPendingVipItemId] = useState<number | null>(null);

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
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  // messages/questions
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState<{ [key: number]: string }>({});
  const [isSendingQuestion, setIsSendingQuestion] = useState(false);

  // view / навигация
  // Проверяваме дали има запазен email в localStorage при зареждане
  const [view, setView] = useState<View>(() => {
    const savedEmail = localStorage.getItem("loggedInEmail");
    return savedEmail ? "all" : "home";
  });
  
  const [contactPhonePrefilled, setContactPhonePrefilled] = useState(false);
  // При отваряне на формата за създаване - попълни email и телефон от логнатия потребител / запомнени данни
  useEffect(() => {
    if (showCreateForm && loggedInEmail) {
      setNewItemContactEmail(loggedInEmail);
      const savedPhone = localStorage.getItem("userContactPhone");
      if (savedPhone) {
        setNewItemContactPhone(savedPhone);
        setContactPhonePrefilled(true);
      } else {
        setContactPhonePrefilled(false);
      }
    }
  }, [showCreateForm, loggedInEmail]);
  
  // messages page
  const [sentMessages, setSentMessages] = useState<Message[]>([]);
  const [receivedMessages, setReceivedMessages] = useState<Message[]>([]);
  
  // orders page
  const [myOrders, setMyOrders] = useState<ItemOrder[]>([]);
  const [sellerOrders, setSellerOrders] = useState<ItemOrder[]>([]);
  
  // favorites page
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [favoriteItemIds, setFavoriteItemIds] = useState<Set<number>>(new Set());

  // language / език – запазваме в localStorage за да остане след refresh
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return saved === "en" || saved === "ru" ? saved : "bg";
  });
  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);
  const t = translations[language] || translations["bg"];

  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // зареждане на продуктите
  const loadItems = () => {
    const tryFetch = (url: string) =>
      fetch(url).then((res) => {
        if (!res.ok) throw { status: res.status };
        return res.json();
      });

    // Локално: /items (пълен). Production: /items/list (избягва 500 от големи base64)
    const useFull = API_BASE.includes("localhost");
    const listUrl = useFull ? `${API_BASE}/items` : `${API_BASE}/items/list`;

    tryFetch(`${listUrl}?t=${Date.now()}`)
      .catch((err) => {
        if (!useFull && (err?.status === 400 || err?.status === 404)) {
          return tryFetch(`${API_BASE}/items`);
        }
        throw new Error("HTTP " + (err?.status || "?"));
      })
      .then((data) => {
        const sortedData = [...data].sort((a: Item, b: Item) => {
          const aVip = a.isVip === true;
          const bVip = b.isVip === true;
          if (aVip && !bVip) return -1;
          if (!aVip && bVip) return 1;
          return 0;
        });
        setItems(sortedData);
        setSelectedItem((prev) => {
          if (!prev) return prev;
          const updated = sortedData.find((it: Item) => it.id === prev.id);
          if (updated) {
            // Запази imageUrl – списъкът (/list) не го връща, иначе губим снимката след create
            return { ...updated, imageUrl: updated.imageUrl || prev.imageUrl };
          }
          return prev; // Не нулирай – item-ът може да още не е в списъка
        });
      })
      .catch((err) => setError(err?.message || String(err)));
  };

  useEffect(() => {
    // НЕ викай loadItems при view "detail" – иначе race с setSelectedItem(createdItem) → лилав екран
    if ((loggedInEmail || view === "all") && view !== "detail") {
      loadItems();
    }
  }, [loggedInEmail, view]);

  // Изчистване на съобщения при смяна на страница
  useEffect(() => {
    setError(null);
    setMessage(null);
  }, [view]);

  // Затваряне на формата за създаване при превключване от "Моите обяви" към "Обяви"
  useEffect(() => {
    if (view !== "mine") {
      setShowCreateForm(false);
    }
  }, [view]);

  // Подгряване на backend - /items/ping е в същия controller като основната логика (Render.com cold start ~50 сек)
  const warmBackend = () => {
    fetch(`${API_BASE}/items/ping`, { method: "GET" }).catch(() => 
      fetch(`${API_BASE}/actuator/health`, { method: "GET" }).catch(() => 
        fetch(`${API_BASE}/items/list`, { method: "GET" }).catch(() => {})
      )
    );
  };
  useEffect(() => { warmBackend(); }, []);
  useEffect(() => {
    if (view === "login" || view === "register" || view === "home") warmBackend();
  }, [view]);

  useEffect(() => {
    // Зареждаме съобщенията когато отворим страницата за съобщения
    if (view === "messages" && loggedInEmail) {
      loadAllMessages();
      // Fallback polling ако WebSocket не се свърже (напр. Render cold start)
      const fallbackInterval = setInterval(loadAllMessages, 10000);
      return () => clearInterval(fallbackInterval);
    }
    // Зареждаме поръчките когато отворим страницата за поръчки
    if (view === "orders" && loggedInEmail) {
      loadAllOrders();
    }
    // Зареждаме любимите САМО когато потребителят наистина отвори страницата за любими
    // НЕ зареждаме автоматично при login/register
    if (view === "favorites" && loggedInEmail) {
      const timer = setTimeout(() => {
        loadFavorites();
      }, 200); // Малко забавяне за да се гарантира че backend-ът е готов
      return () => clearTimeout(timer);
    } else if (view !== "favorites") {
      // Ако не сме на страницата за любими, изчисти грешките за любими
      // Това предотвратява показването на грешки от любими на други страници
      if (error && error.includes("любими")) {
        setError(null);
      }
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
    
    // Ако вече се обработва регистрация, не прави нищо
    if (isRegistering) {
      return;
    }
    
    setError(null);
    setMessage(null);
    
    // Валидация на празни полета
    if (!registerEmail || !registerPassword || !fullName) {
      setError(language === "bg" ? "Моля, попълнете всички полета" : language === "en" ? "Please fill in all fields" : "Пожалуйста, заполните все поля");
      return;
    }
    
    // Валидация на паролата
    const passwordError = validatePassword(registerPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    
    setIsRegistering(true);
    
    try {
      console.log("Register attempt:", { email: registerEmail, fullName });
      
      // Timeout 90 сек - Render.com cold start може да отнеме 50-60 сек
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.warn("Registration request timeout after 90 seconds");
        controller.abort();
      }, 90000);
      
      console.log("Sending registration request to:", `${API_BASE}/auth/register`);
      const requestStartTime = Date.now();
      
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({ email: registerEmail, password: registerPassword, fullName }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      const requestDuration = Date.now() - requestStartTime;
      console.log(`Registration request completed in ${requestDuration}ms`);
      
      const responseText = await res.text();
      console.log("Register response status:", res.status, "body:", responseText);
      
      // Първо проверяваме дали заявката е успешна
      if (!res.ok || res.status !== 200) {
        console.error("Register error response:", responseText);
        // Опитай се да парсне JSON грешката ако е възможно
        try {
          const errorJson = JSON.parse(responseText);
          throw new Error(errorJson.error || errorJson.message || t.errorRegistration);
        } catch {
          throw new Error(responseText || t.errorRegistration);
        }
      }
      
      // Проверка дали отговорът е успешен (само ако status е 200)
      const trimmedResponse = responseText.trim();
      if (trimmedResponse === "REGISTER_OK" || trimmedResponse.includes("REGISTER_OK")) {
        console.log("Registration successful, logging in user:", registerEmail);
        setMessage(t.successRegistration);
        
        // Изчисти формата първо
        const registeredEmail = registerEmail; // Запази email преди да изчистиш state
        setRegisterEmail("");
        setRegisterPassword("");
        setFullName("");
        
        // След успешна регистрация, автоматично влизаме
        updateLoggedInEmail(registeredEmail);
        setView("all");
        
        // Изчисти грешките преди да заредим данни
        setError(null);
        
        // Зареди items след успешна регистрация с по-дълго забавяне за да се обнови state
        setTimeout(() => {
          console.log("Loading items after registration, loggedInEmail:", registeredEmail);
          loadItems();
          // Не зареждаме любими веднага - ще се заредят когато потребителят отвори страницата
          setFavorites([]);
        }, 300);
      } else {
        console.error("Registration failed - unexpected response:", trimmedResponse);
        throw new Error(trimmedResponse || t.errorRegistration);
      }
    } catch (err: any) {
      console.error("Register error:", err);
      console.error("Error type:", err.name);
      console.error("Error message:", err.message);
      
      if (err.name === 'AbortError' || err.message?.includes('aborted')) {
        setError(language === "bg" 
          ? "Заявката отне твърде много време. Моля, проверете интернет връзката и опитайте отново." 
          : language === "en" 
          ? "Request took too long. Please check your internet connection and try again." 
          : "Запрос занял слишком много времени. Пожалуйста, проверьте интернет-соединение и попробуйте снова.");
      } else if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        setError(language === "bg" 
          ? "Не може да се свърже със сървъра. Моля, проверете интернет връзката и опитайте отново." 
          : language === "en" 
          ? "Cannot connect to server. Please check your internet connection and try again." 
          : "Не удается подключиться к серверу. Пожалуйста, проверьте интернет-соединение и попробуйте снова.");
      } else if (err.message?.includes('Email already in use') || err.message?.includes('already exists')) {
        setError(language === "bg" 
          ? "Този email вече се използва. Моля, използвайте друг email." 
          : language === "en" 
          ? "This email is already in use. Please use a different email." 
          : "Этот email уже используется. Пожалуйста, используйте другой email.");
      } else {
        const errorMsg = err.message || String(err) || (language === "bg" ? "Грешка при регистрация" : language === "en" ? "Registration error" : "Ошибка регистрации");
        setError(errorMsg);
      }
    } finally {
      setIsRegistering(false);
    }
  };

  // auth – login
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (isLoggingIn) return;
    
    setError(null);
    setMessage(null);
    
    // Валидация на празни полета
    if (!loginEmail || !loginPassword) {
      setError(language === "bg" ? "Моля, попълнете email и парола" : language === "en" ? "Please enter email and password" : "Пожалуйста, введите email и пароль");
      return;
    }
    
    setIsLoggingIn(true);
    
    try {
      console.log("Login attempt:", { email: loginEmail });
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      const responseText = await res.text();
      console.log("Login response status:", res.status, "body:", responseText);
      
      // Първо проверяваме дали заявката е успешна
      if (!res.ok || res.status !== 200) {
        console.error("Login error response:", responseText);
        // Опитай се да парсне JSON грешката ако е възможно
        try {
          const errorJson = JSON.parse(responseText);
          throw new Error(errorJson.error || errorJson.message || t.errorLogin);
        } catch {
          throw new Error(responseText || t.errorLogin);
        }
      }
      
      // Проверка дали отговорът е успешен (само ако status е 200)
      const trimmedResponse = responseText.trim();
      if (trimmedResponse === "LOGIN_OK" || trimmedResponse.includes("LOGIN_OK")) {
        console.log("Login successful, setting loggedInEmail:", loginEmail);
        
        // Изчисти формата първо
        const loggedInUserEmail = loginEmail; // Запази email преди да изчистиш state
        setLoginEmail("");
        setLoginPassword("");
        
        // Задай loggedInEmail и view
        updateLoggedInEmail(loggedInUserEmail);
        setMessage(t.successLogin);
        setView("all"); // След успешен вход, отиваме на обявите
        
        // Изчисти грешките преди да заредим данни
        setError(null);
        
        // Изчисти любимите - ще се заредят когато потребителят отвори страницата
        setFavorites([]);
        setFavoriteItemIds(new Set());
        
        // Зареди items след успешен вход с по-дълго забавяне за да се обнови state
        setTimeout(() => {
          console.log("Loading items after login, loggedInEmail:", loggedInUserEmail);
          loadItems();
        }, 300);
      } else {
        console.error("Login failed - unexpected response:", trimmedResponse);
        throw new Error(trimmedResponse || t.errorLogin);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.name === 'AbortError' || err.message?.includes('aborted')) {
        setError(language === "bg" 
          ? "Заявката отне твърде много време. Моля, проверете интернет връзката и опитайте отново." 
          : language === "en" 
          ? "Request took too long. Please check your internet connection and try again." 
          : "Запрос занял слишком много времени. Пожалуйста, проверьте интернет-соединение и попробуйте снова.");
      } else if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        setError(language === "bg" 
          ? "Не може да се свърже със сървъра. Моля, проверете интернет връзката и опитайте отново." 
          : language === "en" 
          ? "Cannot connect to server. Please check your internet connection and try again." 
          : "Не удается подключиться к серверу. Пожалуйста, проверьте интернет-соединение и попробуйте снова.");
      } else {
        setError(err.message || String(err) || t.errorLogin);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    updateLoggedInEmail(null);
    setMessage(t.loggedOut);
    setLoginEmail("");
    setLoginPassword("");
    setRegisterEmail("");
    setRegisterPassword("");
    setFullName("");
    setSelectedItem(null);
    setReviews([]);
    setView("login");
  };

  // Обработка на VIP плащане
  const handleVipPayment = async (cardNumber: string, cardHolder: string, expiryDate: string, _cvv: string) => {
    if (!pendingVipItemId || !loggedInEmail) {
      setError(language === "bg" ? "Липсва информация за плащане" : language === "en" ? "Missing payment information" : "Отсутствует информация об оплате");
      return;
    }

    // Валидация на картата
    if (!cardNumber || cardNumber.length < 13) {
      setError(language === "bg" ? "Моля, въведете валиден номер на карта" : language === "en" ? "Please enter a valid card number" : "Пожалуйста, введите действительный номер карты");
      return;
    }

    try {
      setError(null);
      setMessage(null);
      
      console.log("Starting VIP payment process...");

      // Стъпка 1: Създай плащането с данни за картата
      const createPaymentRes = await fetch(`${API_BASE}/vip-payment/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({
          itemId: pendingVipItemId,
          ownerEmail: loggedInEmail,
          paymentMethod: "card",
          cardNumber: cardNumber.substring(cardNumber.length - 4), // Изпращаме само последните 4 цифри за сигурност
          cardHolder: cardHolder,
          expiryDate: expiryDate,
        }),
      });

      if (!createPaymentRes.ok) {
        const errorText = await createPaymentRes.text();
        console.error("Failed to create payment:", createPaymentRes.status, errorText);
        let errorMessage = errorText;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorJson.message || errorText;
        } catch {
          // Not JSON, use as is
        }
        throw new Error(errorMessage || "Failed to create payment");
      }

      const paymentData = await createPaymentRes.json();
      console.log("Payment created:", paymentData);
      const paymentId = paymentData.paymentId;

      // Стъпка 2: Завърши плащането (симулация - в реална система тук ще има интеграция с платежен процесор)
      const completePaymentRes = await fetch(`${API_BASE}/vip-payment/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({
          paymentId: paymentId,
          ownerEmail: loggedInEmail,
          paymentMethodId: null, // В реална система тук ще се изпрати Stripe Payment Method ID
        }),
      });

      if (!completePaymentRes.ok) {
        const errorText = await completePaymentRes.text();
        console.error("Failed to complete payment:", completePaymentRes.status, errorText);
        let errorMessage = errorText;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorJson.message || errorText;
        } catch {
          // Not JSON, use as is
        }
        throw new Error(errorMessage || "Failed to complete payment");
      }
      
      console.log("Payment completed successfully");

      // Стъпка 3: Активирай VIP статуса
      const activateVipRes = await fetch(`${API_BASE}/vip/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({
          ownerEmail: loggedInEmail,
          itemId: pendingVipItemId,
        }),
      });

      if (!activateVipRes.ok) {
        const errorText = await activateVipRes.text();
        console.error("Failed to activate VIP:", activateVipRes.status, errorText);
        let errorMessage = errorText;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorJson.message || errorText;
        } catch {
          // Not JSON, use as is
        }
        throw new Error(errorMessage || "Failed to activate VIP");
      }
      
      console.log("VIP activated successfully");

      console.log("VIP payment completed successfully");
      
      // Успешно плащане и активиране на VIP
      setMessage(language === "bg" 
        ? "VIP статусът е активиран успешно! Плащането от 2€ е прието." 
        : language === "en" 
        ? "VIP status activated successfully! Payment of €2 has been accepted."
        : "VIP статус успешно активирован! Платеж 2€ принят.");
      
      // Затвори VIP payment модала ПРЕДИ да зареждаме items
      const completedItemId = pendingVipItemId;
      setShowVipPayment(false);
      setPendingVipItemId(null);
      setError(null); // Изчисти грешките
      
      // Презареди items и selectedItem
      try {
        await loadItems();
        if (selectedItem && selectedItem.id === completedItemId) {
          try {
            const updatedItem = await fetch(`${API_BASE}/items/${completedItemId}`).then(r => r.json());
            setSelectedItem(updatedItem);
          } catch (err) {
            console.error("Failed to reload item:", err);
          }
        }
      } catch (err) {
        console.error("Failed to reload items:", err);
      }
    } catch (err) {
      console.error("VIP payment error:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      // НЕ затваряме модала при грешка, за да може потребителят да види грешката
    }
  };

  const handleCancelVipPayment = () => {
    setShowVipPayment(false);
    setPendingVipItemId(null);
    setMessage(t.successListingCreated);
  };

  // създаване на обява
  const handleCreateListing = async (e: FormEvent) => {
    e.preventDefault();
    
    // Ако вече се обработва създаването, не прави нищо
    if (isCreatingListing) {
      return;
    }
    
    if (!loggedInEmail) {
      setError(t.errorMustLogin);
      return;
    }
    setError(null);
    setMessage(null);
    setIsCreatingListing(true);
    
    // Валидация: поне email или телефон трябва да е попълнен
    const emailTrimmed = newItemContactEmail.trim();
    const phoneTrimmed = newItemContactPhone.trim();
    if (!emailTrimmed && !phoneTrimmed) {
      setError(t.errorContactRequired);
      setIsCreatingListing(false);
      return;
    }
    
    // Валидация: снимката е задължителна
    if (!newItemFile) {
      setError(t.errorImageRequired);
      setIsCreatingListing(false);
      return;
    }
    
    // Валидация: цената трябва да е валидно число
    const priceValue = parseFloat(newItemPrice);
    if (isNaN(priceValue) || priceValue <= 0) {
      setError(language === "bg" ? "Моля, въведете валидна цена (по-голяма от 0)" : language === "en" ? "Please enter a valid price (greater than 0)" : "Пожалуйста, введите действительную цену (больше 0)");
      setIsCreatingListing(false);
      return;
    }
    
    // Валидация: заглавието и описанието не трябва да са празни
    if (!newItemTitle.trim()) {
      setError(language === "bg" ? "Моля, въведете заглавие" : language === "en" ? "Please enter a title" : "Пожалуйста, введите заголовок");
      setIsCreatingListing(false);
      return;
    }
    
    if (!newItemDescription.trim()) {
      setError(language === "bg" ? "Моля, въведете описание" : language === "en" ? "Please enter a description" : "Пожалуйста, введите описание");
      setIsCreatingListing(false);
      return;
    }
    if (newItemDescription.trim().length < 40) {
      setError(language === "bg" ? "Описанието трябва да е поне 40 символа" : language === "en" ? "Description must be at least 40 characters" : "Описание должно быть не менее 40 символов");
      setIsCreatingListing(false);
      return;
    }
    
    try {
      let createdItem: Item;
      let uploadFailed = false;
      const createPayload = {
        title: newItemTitle.trim(),
        description: newItemDescription.trim(),
        price: priceValue,
        ownerEmail: loggedInEmail,
        category: newItemCategory,
        contactEmail: emailTrimmed || null,
        contactPhone: phoneTrimmed || null,
        paymentMethod: newItemPaymentMethod || null,
        isVip: false,
      };
      
      // Create без снимка (избягва 500 на Render), после upload
      setMessage(language === "bg" ? "Създаване на обява..." : "Creating listing...");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000);
      let res = await fetch(`${API_BASE}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({ ...createPayload, imageUrl: null }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      if (res.ok) {
        createdItem = await res.json() as Item;
      } else {
        const errorText = await res.text();
        if (res.status === 413) {
          throw new Error(language === "bg"
            ? "Снимката е твърде голяма. Моля, изберете по-малка снимка."
            : "Image is too large. Please select a smaller image.");
        }
        let errMsg = t.errorCreateListing;
        try {
          const j = JSON.parse(errorText);
          errMsg = j.error || j.message || errMsg;
        } catch {
          if (errorText) errMsg = errorText;
        }
        throw new Error(errMsg);
      }
      console.log("Listing created successfully:", { id: createdItem?.id, hasImageUrl: !!createdItem?.imageUrl });
      
      // Backend create response не включва imageUrl (JsonView) – зареждаме пълния item
      if (createdItem.id && !createdItem.imageUrl) {
        createdItem = await fetch(`${API_BASE}/items/${createdItem.id}?t=${Date.now()}`, {
          cache: "no-store",
        }).then((r) => r.json());
      }
      
      // Качване на снимката чрез upload (multipart, компресирана до 300KB)
      if (createdItem.id && newItemFile) {
        setMessage(language === "bg" ? "Качване на снимката..." : "Uploading image...");
        const formData = new FormData();
        const fileToUpload = newItemFile.size > 300 * 1024
          ? await compressImage(newItemFile, 0.3)
          : newItemFile;
        formData.append("file", fileToUpload);
        formData.append("ownerEmail", loggedInEmail!);
        try {
          const uploadRes = await fetch(`${API_BASE}/upload/${createdItem.id}`, {
            method: "POST",
            body: formData,
          });
          if (uploadRes.ok) {
            const uploadJson = await uploadRes.json().catch(() => ({}));
            if (uploadJson?.imageAvailable && createdItem?.id) {
              createdItem = { ...createdItem, imageUrl: `${API_BASE}/items/${createdItem.id}/image/raw` };
            } else {
              createdItem = await fetch(`${API_BASE}/items/${createdItem.id}?t=${Date.now()}`, {
                cache: "no-store",
              }).then((r) => r.json());
              let imgData: { imageUrl?: string } | null = null;
              for (let attempt = 0; attempt < 3; attempt++) {
                const imgRes = await fetch(`${API_BASE}/items/${createdItem.id}/image?t=${Date.now()}`);
                if (imgRes.ok) {
                  imgData = await imgRes.json();
                  if (imgData?.imageUrl) break;
                }
                if (attempt < 2) await new Promise((r) => setTimeout(r, 600));
              }
              if (imgData?.imageUrl) createdItem = { ...createdItem, imageUrl: imgData.imageUrl };
            }
          } else {
            const errText = await uploadRes.text();
            console.warn("Upload failed:", uploadRes.status, errText);
            uploadFailed = true;
          }
        } catch (e) {
          console.warn("Upload error:", e);
          uploadFailed = true;
        }
        setMessage(null);
      }
      
      setNewItemTitle("");
      setNewItemDescription("");
      setNewItemPrice("");
      setNewItemCategory("Други");
      setNewItemContactEmail("");
      setNewItemContactPhone("");
      if (phoneTrimmed) localStorage.setItem("userContactPhone", phoneTrimmed);
      setNewItemPaymentMethod("cash_on_delivery");
      const shouldMakeVip = newItemIsVip;
      setNewItemIsVip(false);
      setNewItemFile(null);
      setShowCreateForm(false);
      
      // Оптимистично добави в списъка
      const safeItem: Item = {
        ...createdItem,
        id: Number(createdItem?.id) || 0,
        price: Number(createdItem?.price) || 0,
      };
      setItems((prev) => {
        if (prev.some((it) => it.id === safeItem.id)) return prev;
        const next = [...prev, { ...safeItem, ownerEmail: safeItem.ownerEmail || loggedInEmail }];
        return next.sort((a, b) => {
          const aVip = a.isVip === true;
          const bVip = b.isVip === true;
          if (aVip && !bVip) return -1;
          if (!aVip && bVip) return 1;
          return 0;
        });
      });
      setSelectedItem(safeItem);
      setReviews([]);
      setView("detail");
      setMessage(uploadFailed
        ? (language === "bg" ? "Обявата е създадена, но снимката не се качи. Опитайте с по-малка снимка." : "Listing created, but image upload failed. Try a smaller image.")
        : t.successListingCreated);
      
      // Ако е избрано VIP, покажи форма за плащане
      if (shouldMakeVip && safeItem.id) {
        setPendingVipItemId(safeItem.id);
        setShowVipPayment(true);
      }
      // Снимката се качва отделно след create (multipart upload)
    } catch (err: unknown) {
      setMessage(null);
      const e = err as Error & { name?: string };
      if (e?.name === "AbortError") {
        setError(language === "bg"
          ? "Заявката отне твърде много време. Render се „подгрява“ – опитайте отново след 1 минута."
          : language === "en"
          ? "Request took too long. Render is warming up – try again in 1 minute."
          : "Запрос занял слишком много времени. Render прогревается – попробуйте через 1 минуту.");
      } else {
        setError(e?.message || String(err));
      }
    } finally {
      setIsCreatingListing(false);
    }
  };

  // Функция за компресия на снимка - по-агресивна за Render.com (ограничена памет)
  const compressImage = (file: File, maxSizeMB: number = 0.8): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Максимална ширина/височина 1280px - по-малко = по-бързо качване
          const maxDimension = 1280;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension;
              width = maxDimension;
            } else {
              width = (width / height) * maxDimension;
              height = maxDimension;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          let quality = 0.85;
          const maxSizeBytes = maxSizeMB * 1024 * 1024;
          
          const tryCompress = () => {
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error('Failed to compress image'));
                  return;
                }
                
                if (blob.size <= maxSizeBytes || quality <= 0.1) {
                  const compressedFile = new File([blob], file.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                  });
                  console.log(`Image compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB -> ${(blob.size / 1024 / 1024).toFixed(2)}MB`);
                  resolve(compressedFile);
                } else {
                  quality -= 0.1;
                  tryCompress();
                }
              },
              'image/jpeg',
              quality
            );
          };
          
          tryCompress();
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  // handler за промяна на файла при създаване
  const handleNewItemFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const maxSize = 10 * 1024 * 1024; // 10MB входен лимит
      
      if (file.size > maxSize) {
        setError(`Снимката е твърде голяма! Максимален размер: 10MB. Вашата снимка: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        e.target.value = '';
        setNewItemFile(null);
        return;
      }
      
      // Компресирай снимката ако е над 500KB - по-бързо качване на Render
      if (file.size > 500 * 1024) {
        try {
          setMessage(language === "bg" ? "Компресиране на снимката..." : "Compressing image...");
          const compressedFile = await compressImage(file, 0.8);
          setNewItemFile(compressedFile);
          setMessage(null);
          setError(null);
        } catch (err) {
          console.error('Compression error:', err);
          setError('Грешка при компресиране на снимката. Моля, опитайте с по-малка снимка.');
          e.target.value = '';
          setNewItemFile(null);
        }
      } else {
        setNewItemFile(file);
        setError(null);
      }
    }
  };


  // избиране на продукт + зареждане на ревюта и съобщения
  const openItem = async (item: Item | number) => {
    try {
      const id = typeof item === 'number' ? item : item.id;
      const listItem = typeof item === 'object' ? item : null;
      
      let itemObj: Item | null = null;
      try {
        const res = await fetch(`${API_BASE}/items/${id}?t=${Date.now()}`);
        if (!res.ok) throw new Error("Failed to load item");
        const data = await res.json();
        if (data && (data.id != null || data.id === 0)) {
          itemObj = data;
        }
      } catch (e) {
        console.warn("Fetch item failed:", e);
      }
      
      if (!itemObj && listItem) {
        itemObj = { ...listItem };
      }
      if (!itemObj) {
        throw new Error("Invalid item data");
      }
      if (itemObj.id == null || itemObj.id === undefined) {
        itemObj = { ...itemObj, id: Number(id) } as Item;
      }
      
      // Ако няма imageUrl, опитай отделен endpoint
      if ((!itemObj.imageUrl || itemObj.imageUrl.length < 10) && itemObj.id) {
        try {
          const imgRes = await fetch(`${API_BASE}/items/${itemObj.id}/image?t=${Date.now()}`);
          if (imgRes.ok) {
            const imgData = await imgRes.json();
            if (imgData?.imageUrl) itemObj = { ...itemObj, imageUrl: imgData.imageUrl };
          }
        } catch {
          // Игнорирай – ще покажем placeholder
        }
      }
      
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
    if (!loggedInEmail) {
      console.warn("Cannot load sent messages: no logged in email");
      return;
    }
    try {
      console.log("Loading sent messages for:", loggedInEmail);
      const url = `${API_BASE}/items/messages/sent/${encodeURIComponent(loggedInEmail)}`;
      console.log("Fetching from URL:", url);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 сек – Render cold start
      
      const res = await fetch(url, {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      console.log("Sent messages response status:", res.status, res.statusText);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Failed to load sent messages:", res.status, errorText);
        // При 404 или празен списък, задаваме празен масив
        if (res.status === 404) {
          console.log("No sent messages found (404)");
          setSentMessages([]);
          return;
        }
        throw new Error(`Failed to load sent messages: ${res.status} ${errorText}`);
      }
      
      const data = await res.json();
      console.log("Loaded sent messages:", Array.isArray(data) ? data.length : "not an array", data);
      
      if (!Array.isArray(data)) {
        console.error("Sent messages response is not an array:", typeof data, data);
        setSentMessages([]);
        return;
      }
      
      setSentMessages(data);
    } catch (err: any) {
      console.error("Error loading sent messages:", err);
      if (err.name === 'AbortError') {
        console.warn("Sent messages request timed out");
        // Не изчистваме съобщенията при timeout - може да са временни проблеми
        return;
      }
      // При други грешки, задаваме празен масив само ако няма вече заредени съобщения
      if (sentMessages.length === 0) {
        setSentMessages([]);
      }
    }
  };

  // Зареждане на всички получени съобщения (като продавач)
  const loadReceivedMessages = async () => {
    if (!loggedInEmail) {
      console.warn("Cannot load received messages: no logged in email");
      return;
    }
    try {
      console.log("Loading received messages for:", loggedInEmail);
      const url = `${API_BASE}/items/messages/received/${encodeURIComponent(loggedInEmail)}`;
      console.log("Fetching from URL:", url);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 сек – Render cold start
      
      const res = await fetch(url, {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      console.log("Received messages response status:", res.status, res.statusText);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Failed to load received messages:", res.status, errorText);
        // При 404 или празен списък, задаваме празен масив
        if (res.status === 404) {
          console.log("No received messages found (404)");
          setReceivedMessages([]);
          return;
        }
        throw new Error(`Failed to load received messages: ${res.status} ${errorText}`);
      }
      
      const data = await res.json();
      console.log("Loaded received messages:", Array.isArray(data) ? data.length : "not an array", data);
      
      if (!Array.isArray(data)) {
        console.error("Received messages response is not an array:", typeof data, data);
        setReceivedMessages([]);
        return;
      }
      
      setReceivedMessages(data);
    } catch (err: any) {
      console.error("Error loading received messages:", err);
      if (err.name === 'AbortError') {
        console.warn("Received messages request timed out");
        // Не изчистваме съобщенията при timeout - може да са временни проблеми
        return;
      }
      // При други грешки, задаваме празен масив само ако няма вече заредени съобщения
      if (receivedMessages.length === 0) {
        setReceivedMessages([]);
      }
    }
  };

  // Зареждане на всички съобщения за страницата
  const loadAllMessages = async () => {
    await Promise.all([loadSentMessages(), loadReceivedMessages()]);
  };

  // WebSocket лайв чат – при ново съобщение/отговор зареждаме автоматично (работи с localhost и Render)
  useWebSocketMessages(loggedInEmail, loadAllMessages, view === "messages");

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
    if (!loggedInEmail) {
      setFavorites([]);
      setFavoriteItemIds(new Set());
      return;
    }
    try {
      // Добавяме timeout за да не замръзва
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 секунди timeout
      
      const res = await fetch(`${API_BASE}/favorites/${encodeURIComponent(loggedInEmail)}`, {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        // Ако е 404, значи няма любими - това е нормално за нови потребители
        if (res.status === 404) {
          console.log("No favorites found (404) - this is normal for new users");
          setFavorites([]);
          setFavoriteItemIds(new Set());
          return;
        }
        const errorText = await res.text();
        console.error("Failed to load favorites:", errorText);
        throw new Error(errorText || "Failed to load favorites");
      }
      const data = await res.json();
      console.log("Favorites loaded:", data);
      const favoritesArray = Array.isArray(data) ? data : [];
      setFavorites(favoritesArray);
      // Създаваме Set от ID-та на любимите обяви за бърза проверка
      const favoriteIds = new Set<number>(favoritesArray.map((f: Favorite) => f.item?.id).filter((id: any): id is number => id != null && typeof id === 'number'));
      setFavoriteItemIds(favoriteIds);
    } catch (err: any) {
      console.error("Error loading favorites:", err);
      
      // ВИНАГИ изчистваме любимите при грешка
      setFavorites([]);
      setFavoriteItemIds(new Set());
      
      // НИКОГА не показваме грешка за network errors или timeout - те са нормални
      const errorMessage = err instanceof Error ? err.message : String(err);
      const errorString = String(err).toLowerCase();
      const errorMsgLower = errorMessage ? errorMessage.toLowerCase() : '';
      
      // Проверка за network errors - "Failed to fetch" = мрежова грешка, НЕ показваме
      const isNetworkError = 
        err.name === 'AbortError' || 
        err.name === 'TypeError' ||
        err.message === 'Failed to fetch' ||
        (typeof err.message === 'string' && err.message.includes('Failed to fetch')) ||
        errorString.includes('failed to fetch') ||
        errorString.includes('networkerror') ||
        errorString.includes('fetch') ||
        errorString.includes('network') ||
        errorString.includes('cors') ||
        errorMsgLower.includes('failed to fetch') ||
        errorMsgLower.includes('networkerror') ||
        errorMsgLower.includes('fetch') ||
        errorMsgLower.includes('network') ||
        errorMsgLower.includes('cors') ||
        errorMsgLower.includes('connection') ||
        errorMsgLower.includes('timeout') ||
        errorMsgLower.includes('load failed');
      
      if (isNetworkError) {
        // Network error или timeout - НИКОГА не показваме грешка
        console.warn("Network error/timeout loading favorites - silently ignoring, user will see empty list");
        // НЕ показваме грешка изобщо - потребителят ще види празен списък или ще опита отново
        return;
      }
      
      // Само при реални backend грешки (не network errors) показваме съобщение
      // И то само ако сме на страницата за любими И грешката не е network error
      const currentView = view;
      if (currentView === "favorites" && !isNetworkError) {
        // Само ако е реална грешка от backend (не network error)
        setError(`Грешка при зареждане на любими: ${errorMessage}`);
      } else {
        // Ако не сме на страницата за любими или е network error, само логваме
        console.warn("Error loading favorites:", err);
      }
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
    if (isSendingQuestion) return;
    if (!selectedItem || !loggedInEmail) return;
    if (selectedItem.ownerEmail === loggedInEmail) {
      setError(t.cannotAskOwnListing);
      return;
    }
    if (!newQuestion || !newQuestion.trim()) {
      setError(language === "bg" ? "Моля, въведете съобщение" : language === "en" ? "Please enter a message" : "Пожалуйста, введите сообщение");
      return;
    }
    setError(null);
    setMessage(null);
    setIsSendingQuestion(true);
    
    console.log("Sending message:", { itemId: selectedItem.id, senderEmail: loggedInEmail, content: newQuestion });
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 сек – Render cold start
      
      const res = await fetch(`${API_BASE}/items/${selectedItem.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({
          senderEmail: loggedInEmail,
          content: newQuestion.trim(),
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      console.log("Message response status:", res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Message error response:", errorText);
        throw new Error(errorText || t.errorSendQuestion);
      }
      
      const savedMessage = await res.json();
      console.log("Message saved successfully:", savedMessage);
      
      setNewQuestion("");
      setMessage(t.successQuestionSent);
      
      // Презареди всички съобщения ПРЕДИ да изчистим selectedItem
      await loadAllMessages();
      
      // Изчисти selectedItem след успешно изпращане и зареждане
      setTimeout(() => {
        setSelectedItem(null);
      }, 500);
    } catch (err: any) {
      console.error("Error sending message:", err);
      const errMsg = err instanceof Error ? err.message : String(err);
      if (err.name === 'AbortError') {
        setError(language === "bg" 
          ? "Заявката отне твърде много време. Моля, опитайте отново." 
          : language === "en" 
          ? "Request took too long. Please try again." 
          : "Запрос занял слишком много времени. Пожалуйста, попробуйте снова.");
      } else if (errMsg?.includes('Failed to fetch') || errMsg?.includes('NetworkError')) {
        setError(language === "bg" 
          ? "Не може да се свърже със сървъра. Моля, проверете интернет връзката и опитайте отново." 
          : language === "en" 
          ? "Cannot connect to server. Please check your internet connection and try again." 
          : "Не удается подключиться к серверу. Пожалуйста, проверьте интернет-соединение и попробуйте снова.");
      } else {
        setError(errMsg || t.errorSendQuestion);
      }
    } finally {
      setIsSendingQuestion(false);
    }
  };

  // изпращане на отговор
  const handleSendAnswer = async (messageId: number) => {
    if (!newAnswer[messageId] || !newAnswer[messageId].trim() || !loggedInEmail) return;
    setError(null);
    setMessage(null);
    
    console.log("Sending answer for message ID:", messageId, "response:", newAnswer[messageId]);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 сек – Render cold start
      
      const res = await fetch(`${API_BASE}/items/messages/${messageId}/response`, {
        method: "PUT",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({
          response: newAnswer[messageId].trim(),
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      console.log("Answer response status:", res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Answer error response:", errorText);
        throw new Error(errorText || t.errorSendAnswer);
      }
      
      const updatedMessage = await res.json();
      console.log("Answer saved successfully:", updatedMessage);
      
      setNewAnswer((prev) => {
        const updated = { ...prev };
        delete updated[messageId];
        return updated;
      });
      setMessage(t.successAnswerSent);
      // Презареди всички съобщения
      await loadAllMessages();
    } catch (err: any) {
      console.error("Error sending answer:", err);
      if (err.name === 'AbortError') {
        setError(language === "bg" 
          ? "Заявката отне твърде много време. Моля, опитайте отново." 
          : language === "en" 
          ? "Request took too long. Please try again." 
          : "Запрос занял слишком много времени. Пожалуйста, попробуйте снова.");
      } else if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        setError(language === "bg" 
          ? "Не може да се свърже със сървъра. Моля, проверете интернет връзката и опитайте отново." 
          : language === "en" 
          ? "Cannot connect to server. Please check your internet connection and try again." 
          : "Не удается подключиться к серверу. Пожалуйста, проверьте интернет-соединение и попробуйте снова.");
      } else {
        setError(err.message || String(err) || t.errorSendAnswer);
      }
    }
  };

  // създаване на поръчка
  const handleCreateOrder = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !loggedInEmail) return;
    
    // Валидация на задължителните полета
    if (!customerName.trim() || !customerPhone.trim() || !customerEmail.trim()) {
      setError(language === "bg" 
        ? "Моля, попълнете всички задължителни полета (име, телефон, email)" 
        : language === "en" 
        ? "Please fill in all required fields (name, phone, email)"
        : "Пожалуйста, заполните все обязательные поля (имя, телефон, email)");
      return;
    }
    
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
          customerEmail: customerEmail.trim(),
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          itemId: selectedItem.id,
          paymentMethod: paymentMethod,
          deliveryMethod: deliveryMethod,
          deliveryAddress: deliveryAddress.trim(),
        }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || t.errorCreateOrder);
      }
      setMessage(t.successOrderCreated);
      setShowOrderForm(false);
      setPaymentMethod("");
      setDeliveryMethod("");
      setDeliveryAddress("");
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
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
      setMessage(t.successImageUploaded);
      setFile(null);
      loadItems();
      // Обнови selectedItem със снимката – иначе остава placeholder
      try {
        const imgRes = await fetch(`${API_BASE}/items/${selectedItem.id}/image?t=${Date.now()}`);
        if (imgRes.ok) {
          const imgData = await imgRes.json();
          if (imgData?.imageUrl) {
            setSelectedItem((prev) => prev ? { ...prev, imageUrl: imgData.imageUrl } : prev);
          }
        }
      } catch {
        // Игнорирай – снимката е качена, може да се види при следващо отваряне
      }
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
        handleLogout={handleLogout}
      />

      {/* НАЧАЛНА СТРАНИЦА */}
      {view === "home" && !loggedInEmail && (
        <LandingPage
          language={language}
          onBrowseListings={() => setView("all")}
          onLogin={() => setView("login")}
          onRegister={() => setView("register")}
        />
      )}

      {/* LOGIN СТРАНИЦА */}
      {view === "login" && !loggedInEmail && (
        <LoginPage
          email={loginEmail}
          setEmail={setLoginEmail}
          password={loginPassword}
          setPassword={setLoginPassword}
          language={language}
          handleLogin={handleLogin}
          onSwitchToRegister={() => {
            setView("register");
            setError(null);
          }}
          error={error}
          isLoggingIn={isLoggingIn}
        />
      )}

      {/* REGISTER СТРАНИЦА */}
      {view === "register" && !loggedInEmail && (
        <RegisterPage
          isRegistering={isRegistering}
          fullName={fullName}
          setFullName={setFullName}
          email={registerEmail}
          setEmail={setRegisterEmail}
          password={registerPassword}
          setPassword={setRegisterPassword}
          language={language}
          handleRegister={handleRegister}
          onSwitchToLogin={() => {
            setView("login");
            setError(null);
          }}
          error={error}
        />
      )}

      {(error || message) && (
        <div className="alerts-container">
          {error && (
            <div className="alert alert-error">
              <strong>{t.error}</strong> {error}
            </div>
          )}
          {message && (
            <div className="alert alert-success">
              {message}
            </div>
          )}
        </div>
      )}

      {/* ДЕТАЙЛЕН VIEW - показва се когато view === "detail" */}
      {view === "detail" && selectedItem && selectedItem.id != null && (
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
          customerName={customerName}
          customerPhone={customerPhone}
          customerEmail={customerEmail}
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
          onCustomerNameChange={setCustomerName}
          onCustomerPhoneChange={setCustomerPhone}
          onCustomerEmailChange={setCustomerEmail}
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
          isSendingQuestion={isSendingQuestion}
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

      {/* VIP ОБЯВИ СТРАНИЦА */}
      {view === "vip" && (
        <VipListingsPage
          items={items}
          loggedInEmail={loggedInEmail}
          selectedCategory={selectedCategory}
          language={language}
          onItemClick={openItem}
          onCategoryChange={setSelectedCategory}
        />
      )}

      {/* СПИСЪК С ОБЯВИ - "all" за всички, "mine" само за логнати */}
      {(view === "all" || (view === "mine" && loggedInEmail)) && (
        <section className="listings-section">
          <div className="listings-main">
            <div className="listings-header">
              <h2>{view === "all" ? t.allListings : t.myListings}</h2>
              {view === "mine" && loggedInEmail && (
                <button
                  className="btn-primary"
                  onClick={() => setShowCreateForm(!showCreateForm)}
                >
                  {showCreateForm ? t.cancel : t.createListing}
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
              contactPhonePrefilled={contactPhonePrefilled}
              paymentMethod={newItemPaymentMethod}
              isVip={newItemIsVip}
              language={language}
              file={newItemFile}
              isCreating={isCreatingListing}
              loggedInEmail={loggedInEmail}
              onTitleChange={setNewItemTitle}
              onDescriptionChange={setNewItemDescription}
              onPriceChange={setNewItemPrice}
              onCategoryChange={setNewItemCategory}
              onContactEmailChange={setNewItemContactEmail}
              onContactPhoneChange={setNewItemContactPhone}
              onPaymentMethodChange={setNewItemPaymentMethod}
              onVipChange={setNewItemIsVip}
              onFileChange={handleNewItemFileChange}
              onSubmit={handleCreateListing}
            />

            {/* Филтър по категория - скрит когато формата за създаване е отворена */}
            {!showCreateForm && (
              <div className="category-filter">
                <label htmlFor="main-category-filter">
                  <strong>{t.category}</strong>
                  <select
                    id="main-category-filter"
                    name="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
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

            {view === "mine" && !loggedInEmail && (
              <p className="info-text">
                {t.loginToSeeListings}
              </p>
            )}

            <ItemList
              items={items}
              view={view}
              loggedInEmail={loggedInEmail}
              selectedCategory={selectedCategory}
              language={language}
              onItemClick={openItem}
            />
          </div>
        </section>
      )}

      {/* FALLBACK - ако нищо не се показва */}
      {!loggedInEmail && view !== "login" && view !== "register" && view !== "detail" && view !== "favorites" && view !== "orders" && view !== "messages" && view !== "all" && view !== "mine" && view !== "vip" && view !== "home" && (
        <div style={{ padding: "40px", textAlign: "center", background: "rgba(255, 255, 255, 0.95)", margin: "40px auto", maxWidth: "600px", borderRadius: "12px" }}>
          <h2>{t.welcomeToWebShop}</h2>
          <p>{t.pleaseLoginOrRegister}</p>
          <button 
            className="btn-primary" 
            onClick={() => setView("login")}
            style={{ marginTop: "20px" }}
          >
            {t.authTitle}
          </button>
        </div>
      )}

      {/* VIP Payment Form Modal */}
      {showVipPayment && pendingVipItemId && (
        <VipPaymentForm
          itemId={pendingVipItemId}
          amount={2.0}
          language={language}
          onPaymentComplete={async (cardNumber, cardHolder, expiryDate, cvv) => {
            await handleVipPayment(cardNumber, cardHolder, expiryDate, cvv);
          }}
          onCancel={handleCancelVipPayment}
          error={error}
        />
      )}
    </div>
  );
}

export default App;

import { useCallback, useState, type FormEvent } from "react";
import { API_BASE, AUTH_TOKEN_KEY } from "../config";
import { translations, type Language } from "../translations";
import type { Item, Review, View } from "../types";

type T = (typeof translations)["bg"];

type Params = {
  language: Language;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setMessage: React.Dispatch<React.SetStateAction<string | null>>;
  setView: React.Dispatch<React.SetStateAction<View>>;
  loadItems: () => void;
  setFavorites: React.Dispatch<React.SetStateAction<import("../types").Favorite[]>>;
  setFavoriteItemIds: React.Dispatch<React.SetStateAction<Set<number>>>;
  setSelectedItem: React.Dispatch<React.SetStateAction<Item | null>>;
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
};

export function useShopAuth({
  language,
  setError,
  setMessage,
  setView,
  loadItems,
  setFavorites,
  setFavoriteItemIds,
  setSelectedItem,
  setReviews,
}: Params) {
  const t: T = translations[language] || translations["bg"];
  const AUTH_TIMEOUT_MS = 240000;

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [loggedInEmail, setLoggedInEmail] = useState<string | null>(() => localStorage.getItem("loggedInEmail"));

  const updateLoggedInEmail = useCallback((email: string | null) => {
    if (email) {
      localStorage.setItem("loggedInEmail", email);
    } else {
      localStorage.removeItem("loggedInEmail");
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
    setLoggedInEmail(email);
  }, []);

  const validatePassword = useCallback(
    (pwd: string): string | null => {
      if (pwd.length < 8) return t.passwordMinLength;
      if (!/[^a-zA-Z0-9]/.test(pwd)) return t.passwordSpecialChar;
      return null;
    },
    [t.passwordMinLength, t.passwordSpecialChar]
  );

  const warmAuthBackend = useCallback(async () => {
    const warm = async (url: string, timeoutMs: number) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      try {
        await fetch(url, { method: "GET", signal: controller.signal });
      } catch {
        // best-effort warm-up only
      } finally {
        clearTimeout(timeoutId);
      }
    };

    // auth + DB-related endpoint; изпълняват се паралелно за по-бърз cold-start warm-up.
    await Promise.allSettled([
      warm(`${API_BASE}/auth/health`, 25000),
      warm(`${API_BASE}/items/list`, 25000),
    ]);
  }, []);

  const postAuthWithRetry = useCallback(
    async (endpoint: string, payload: Record<string, string>) => {
      const makeRequest = async (timeoutMs: number) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        try {
          return await fetch(`${API_BASE}${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=UTF-8" },
            body: JSON.stringify(payload),
            signal: controller.signal,
          });
        } finally {
          clearTimeout(timeoutId);
        }
      };

      // Първо подгряваме backend-а (Render cold start + DB wake-up), после изпращаме auth заявката.
      await warmAuthBackend();

      try {
        return await makeRequest(AUTH_TIMEOUT_MS);
      } catch (err: unknown) {
        const e = err as { name?: string; message?: string };
        const transient =
          e.name === "AbortError" ||
          e.message?.includes("aborted") ||
          e.message?.includes("Failed to fetch") ||
          e.message?.includes("NetworkError");
        if (!transient) throw err;

        // Render/DB cold start: one warm-up + one retry
        await warmAuthBackend();
        return await makeRequest(AUTH_TIMEOUT_MS);
      }
    },
    [warmAuthBackend]
  );

  const parseJsonSafely = useCallback((raw: string): Record<string, unknown> | null => {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return null;
    }
  }, []);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (isRegistering) return;
    setError(null);
    setMessage(null);
    if (!registerEmail || !registerPassword || !fullName) {
      setError(
        language === "bg"
          ? "Моля, попълнете всички полета"
          : language === "en"
            ? "Please fill in all fields"
            : "Пожалуйста, заполните все поля"
      );
      return;
    }
    const passwordError = validatePassword(registerPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    setIsRegistering(true);
    try {
      const res = await postAuthWithRetry("/auth/register", {
        email: registerEmail,
        password: registerPassword,
        fullName,
      });
      const responseText = await res.text();
      const responseJson = parseJsonSafely(responseText);
      if (!res.ok || res.status !== 200) {
        const msgFromJson =
          typeof responseJson?.error === "string"
            ? responseJson.error
            : typeof responseJson?.message === "string"
              ? responseJson.message
              : null;
        throw new Error(msgFromJson || responseText || t.errorRegistration);
      }
      const authData = responseJson as { accessToken?: string; email?: string } | null;
      if (authData?.accessToken && authData?.email) {
        localStorage.setItem(AUTH_TOKEN_KEY, authData.accessToken);
        setMessage(t.successRegistration);
        const registeredEmail = authData.email;
        setRegisterEmail("");
        setRegisterPassword("");
        setFullName("");
        updateLoggedInEmail(registeredEmail);
        setView("all");
        setError(null);
        setTimeout(() => {
          loadItems();
          setFavorites([]);
        }, 300);
      } else if (responseText.trim().toUpperCase().includes("REGISTER_OK")) {
        // Backward compatibility: някои backend версии връщат text/plain REGISTER_OK.
        setMessage(t.successRegistration);
        setRegisterPassword("");
        setFullName("");
        setLoginEmail(registerEmail);
        setLoginPassword("");
        setView("login");
        setError(null);
      } else {
        throw new Error(t.errorRegistration);
      }
    } catch (err: unknown) {
      const er = err as { name?: string; message?: string };
      if (er.name === "AbortError" || er.message?.includes("aborted")) {
        setError(
          language === "bg"
            ? "Сървърът отговаря бавно (възможен cold start). Изчакайте около минута и опитайте отново."
            : language === "en"
              ? "Server is responding slowly (possible cold start). Wait about a minute and try again."
              : "Сервер отвечает медленно (возможен cold start). Подождите около минуты и попробуйте снова."
        );
      } else if (er.message?.includes("Failed to fetch") || er.message?.includes("NetworkError")) {
        setError(
          language === "bg"
            ? "Не може да се свърже със сървъра. Моля, проверете интернет връзката и опитайте отново."
            : language === "en"
              ? "Cannot connect to server. Please check your internet connection and try again."
              : "Не удается подключиться к серверу. Пожалуйста, проверьте интернет-соединение и попробуйте снова."
        );
      } else if (er.message?.includes("Email already in use") || er.message?.includes("already exists")) {
        setError(
          language === "bg"
            ? "Този email вече се използва. Моля, използвайте друг email."
            : language === "en"
              ? "This email is already in use. Please use a different email."
              : "Этот email уже используется. Пожалуйста, используйте другой email."
        );
      } else {
        setError(er.message || String(err) || t.errorRegistration);
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (isLoggingIn) return;
    setError(null);
    setMessage(null);
    if (!loginEmail || !loginPassword) {
      setError(
        language === "bg"
          ? "Моля, попълнете email и парола"
          : language === "en"
            ? "Please enter email and password"
            : "Пожалуйста, введите email и пароль"
      );
      return;
    }
    setIsLoggingIn(true);
    try {
      const res = await postAuthWithRetry("/auth/login", {
        email: loginEmail,
        password: loginPassword,
      });
      const responseText = await res.text();
      if (!res.ok || res.status !== 200) {
        try {
          const errorJson = JSON.parse(responseText);
          throw new Error(errorJson.error || errorJson.message || t.errorLogin);
        } catch {
          throw new Error(responseText || t.errorLogin);
        }
      }
      let loginData: { accessToken?: string; email?: string };
      try {
        loginData = JSON.parse(responseText);
      } catch {
        throw new Error(t.errorLogin);
      }
      if (loginData.accessToken) {
        localStorage.setItem(AUTH_TOKEN_KEY, loginData.accessToken);
        const loggedInUserEmail = loginData.email || loginEmail;
        setLoginEmail("");
        setLoginPassword("");
        updateLoggedInEmail(loggedInUserEmail);
        setMessage(t.successLogin);
        setView("all");
        setError(null);
        setFavorites([]);
        setFavoriteItemIds(new Set());
        setTimeout(() => loadItems(), 300);
      } else {
        throw new Error(t.errorLogin);
      }
    } catch (err: unknown) {
      const er = err as { name?: string; message?: string };
      if (er.name === "AbortError" || er.message?.includes("aborted")) {
        setError(
          language === "bg"
            ? "Сървърът отговаря бавно (възможен cold start). Изчакайте около минута и опитайте отново."
            : language === "en"
              ? "Server is responding slowly (possible cold start). Wait about a minute and try again."
              : "Сервер отвечает медленно (возможен cold start). Подождите около минуты и попробуйте снова."
        );
      } else if (er.message?.includes("Failed to fetch") || er.message?.includes("NetworkError")) {
        setError(
          language === "bg"
            ? "Не може да се свърже със сървъра. Моля, проверете интернет връзката и опитайте отново."
            : language === "en"
              ? "Cannot connect to server. Please check your internet connection and try again."
              : "Не удается подключиться к серверу. Пожалуйста, проверьте интернет-соединение и попробуйте снова."
        );
      } else {
        setError(er.message || String(err) || t.errorLogin);
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

  return {
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    registerEmail,
    setRegisterEmail,
    registerPassword,
    setRegisterPassword,
    fullName,
    setFullName,
    isRegistering,
    isLoggingIn,
    loggedInEmail,
    updateLoggedInEmail,
    validatePassword,
    handleRegister,
    handleLogin,
    handleLogout,
  };
}

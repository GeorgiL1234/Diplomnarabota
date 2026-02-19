// API Base URL – при deploy на Vercel винаги използвай Render backend
const RENDER_BACKEND = "https://webshop-e6dx.onrender.com";
const getApiBase = (): string => {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host.includes("vercel.app") || host.includes("webshop-app")) {
      return RENDER_BACKEND;
    }
  }
  return import.meta.env.VITE_API_BASE_URL || RENDER_BACKEND;
};
export const API_BASE = getApiBase();

// Helper функция за пътя на изображенията
export const getImageUrl = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("data:")) return imageUrl;
  if (imageUrl.startsWith("http")) return imageUrl;
  return `${API_BASE}${imageUrl}`;
};

/** За base64 използва raw endpoint (избягва проблеми с големи data URI). За URL – getImageUrl. */
export const getDisplayImageUrl = (
  imageUrl: string | null | undefined,
  itemId?: number
): string => {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("data:") && itemId != null) {
    return `${API_BASE}/items/${itemId}/image/raw?t=${Date.now()}`;
  }
  return getImageUrl(imageUrl);
};

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

/** Разделител за множество снимки */
export const IMAGE_DELIMITER = "|||";

/** Парсва imageUrl до масив от URL-и (поддръжка за множество снимки) */
export const parseImageUrls = (imageUrl: string | null | undefined): string[] => {
  if (!imageUrl || !imageUrl.trim()) return [];
  return imageUrl.split(IMAGE_DELIMITER).map((u) => u.trim()).filter(Boolean);
};

/** За base64 използва raw endpoint. За URL – getImageUrl. */
export const getDisplayImageUrl = (
  imageUrl: string | null | undefined,
  itemId?: number,
  index?: number
): string => {
  if (!imageUrl) return "";
  const urls = parseImageUrls(imageUrl);
  const single = urls.length ? urls[index ?? 0] : imageUrl;
  if (!single) return "";
  if (single.startsWith("data:") && itemId != null) {
    return `${API_BASE}/items/${itemId}/image/raw?index=${index ?? 0}&t=${Date.now()}`;
  }
  return getImageUrl(single);
};

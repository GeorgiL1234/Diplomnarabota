// API Base URL - използва environment variable или деплойнат URL
// За да промените URL-а, създайте .env файл с: VITE_API_BASE_URL=https://your-backend-url.com
// Или променете директно fallback URL-а по-долу
export const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://your-backend-url.com";

// Helper функция за пътя на изображенията
export const getImageUrl = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http")) return imageUrl;
  return `${API_BASE}${imageUrl}`;
};

// API Base URL - използва environment variable или fallback към деплойнатия backend
// За production, Vercel автоматично ще използва VITE_API_BASE_URL environment variable
export const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://webshop-e6dx.onrender.com";

// Helper функция за пътя на изображенията
export const getImageUrl = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http")) return imageUrl;
  return `${API_BASE}${imageUrl}`;
};

export type Item = {
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
  paymentMethod?: string | null;
};

export type Favorite = {
  id: number;
  userEmail: string;
  item: Item;
};

export type Review = {
  id: number;
  authorEmail: string;
  rating: number;
  comment: string;
};

export type Message = {
  id: number;
  senderEmail: string;
  content: string;
  response?: string | null;
  createdAt: string;
  item?: Item | null;
};

export type ItemOrder = {
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

export type View = "home" | "all" | "mine" | "login" | "register" | "detail" | "messages" | "orders" | "favorites" | "vip";

export type Language = "bg" | "en" | "ru";

export const CATEGORIES = [
  "Всички",
  "Електроника",
  "Книги",
  "Дрехи",
  "Спорт",
  "Дом и градина",
  "Автомобили",
  "Други",
] as const;

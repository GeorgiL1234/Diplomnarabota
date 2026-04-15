import { useCallback, useState } from "react";
import { API_BASE } from "../config";
import type { Item } from "../types";

export function useLoadItems(
  setSelectedItem: React.Dispatch<React.SetStateAction<Item | null>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) {
  const [items, setItems] = useState<Item[]>([]);

  const loadItems = useCallback(() => {
    const tryFetch = (url: string) =>
      fetch(url).then((res) => {
        if (!res.ok) throw { status: res.status };
        return res.json();
      });

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
            return { ...updated, imageUrl: updated.imageUrl || prev.imageUrl };
          }
          return prev;
        });
      })
      .catch((err) => setError(err?.message || String(err)));
  }, [setSelectedItem, setError]);

  return { items, setItems, loadItems };
}

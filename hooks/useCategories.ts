import { useEffect, useState } from "react";
import { useDispatchClient } from "components/DispatchProvider";
import type { Database } from "@kiyoko-org/dispatch-lib/database.types";

type Category = Database["public"]["Tables"]["categories"]["Row"];

type UseCategoriesReturn = {
  categories: Category[];
  loading: boolean;
  error: string | null;
  addCategory: (payload: Database["public"]["Tables"]["categories"]["Insert"]) => Promise<{ data: any[] | null; error: any }>;
  updateCategory: (id: number, payload: Partial<Database["public"]["Tables"]["categories"]["Update"]>) => Promise<{ data: any[] | null; error: any }>;
  deleteCategory: (id: number) => Promise<{ data: any[] | null; error: any }>;
};

let cachedCategories: Category[] | null = null;
let cachedPromise: Promise<void> | null = null;

export function useCategories(): UseCategoriesReturn {
  const { client, isInitialized, error: providerError } = useDispatchClient();
  const [categories, setCategories] = useState<Category[]>(cachedCategories ?? []);
  const [loading, setLoading] = useState<boolean>(cachedCategories === null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isInitialized || !client) {
      setLoading(true);
      return;
    }

    if (providerError) {
      setError(providerError);
      setLoading(false);
      return;
    }

    if (cachedCategories !== null) {
      setCategories(cachedCategories);
      setLoading(false);
      return;
    }

    if (!cachedPromise) {
      cachedPromise = (async () => {
        setLoading(true);
        setError(null);
        
        try {
          const { data, error: fetchError } = await client.getCategories();

          if (fetchError) {
            console.error("Error fetching categories:", fetchError);
            setError(fetchError.message || "Failed to fetch categories");
            setLoading(false);
            return;
          }

          if (data) {
            cachedCategories = data;
            setCategories(data);
          }
        } catch (err) {
          console.error("Unexpected error fetching categories:", err);
          setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
          setLoading(false);
        }
      })();
    } else {
      cachedPromise.then(() => {
        if (cachedCategories) setCategories(cachedCategories);
        setLoading(false);
      });
    }
  }, [client, isInitialized, providerError]);

  async function addCategory(payload: Database["public"]["Tables"]["categories"]["Insert"]) {
    if (!client) {
      return { data: null, error: "DispatchClient not initialized" };
    }

    const { data, error } = await client.addCategory(payload);
    if (error) {
      console.error("Error adding category:", error);
    }
    if (data) {
      const newCategories = [...categories, ...data];
      setCategories(newCategories);
      cachedCategories = newCategories;
    }
    return { data, error };
  }

  async function updateCategory(id: number, payload: Partial<Database["public"]["Tables"]["categories"]["Update"]>) {
    if (!client) {
      return { data: null, error: "DispatchClient not initialized" };
    }

    const { data, error } = await client.updateCategory(id.toString(), payload);
    if (error) {
      console.error("Error updating category:", error);
    }
    if (data && Array.isArray(data) && data.length > 0) {
      const newCategories = categories.map(c => (c.id === id ? (data[0] as typeof c) : c));
      setCategories(newCategories);
      cachedCategories = newCategories;
    }
    return { data, error };
  }

  async function deleteCategory(id: number) {
    if (!client) {
      return { data: null, error: "DispatchClient not initialized" };
    }

    const { data, error } = await client.deleteCategory(id.toString());
    if (error) {
      console.error("Error deleting category:", error);
    }
    if (data) {
      const newCategories = categories.filter(c => c.id !== id);
      setCategories(newCategories);
      cachedCategories = newCategories;
    }
    return { data, error };
  }

  return { 
    categories, 
    loading, 
    error: error || providerError, 
    addCategory, 
    updateCategory, 
    deleteCategory 
  };
}
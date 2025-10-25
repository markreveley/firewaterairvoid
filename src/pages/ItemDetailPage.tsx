import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import ItemDetail from "./ItemDetail";
import { useItems } from "@/hooks/useItems";
import { supabase } from "@/integrations/supabase/client";

export default function ItemDetailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addItem, updateItem, deleteItem, items, isLoading } = useItems();
  const [allTags, setAllTags] = useState<Array<{ id: string; name: string; parent_id?: string | null }>>([]);

  const itemId = searchParams.get("id");
  const existingItem = itemId ? items.find(item => item.id === itemId) : null;

  // Load all tags from database
  useEffect(() => {
    const loadTags = async () => {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error loading tags:", error);
      } else {
        setAllTags(data || []);
      }
    };

    loadTags();
  }, []);

  // Wait for items to load if we're editing an existing item
  if (isLoading && itemId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const handleAddItem = async (
    title: string,
    type: "fire" | "water" | "air" | "void" | "earth",
    tags: Array<{ id: string; name: string }>,
    deadline?: Date,
    notes?: string,
    status?: string,
    url?: string,
    parent_id?: string
  ) => {
    if (existingItem) {
      // Edit mode - update existing item
      await updateItem(existingItem.id, { 
        title,
        type, 
        tags, 
        deadline: deadline || null, 
        notes, 
        status,
        url,
        parent_id: parent_id || null,
      });
    } else {
      // Create mode - add new item
      await addItem(title, type, tags, deadline, notes, status, url, parent_id);
    }
    navigate(`/?type=${type}`);
  };

  return <ItemDetail onAddItem={handleAddItem} existingTags={allTags} existingItem={existingItem} allItems={items} onDeleteItem={deleteItem} />;
}

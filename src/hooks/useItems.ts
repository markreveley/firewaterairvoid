import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Tag {
  id: string;
  name: string;
}

interface Item {
  id: string;
  title: string;
  type: "fire" | "water" | "void";
  notes?: string;
  status?: string;
  tags: Tag[];
  createdAt: Date;
  deadline?: Date;
}

export function useItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadItems = async () => {
    try {
      const { data: itemsData, error: itemsError } = await supabase
        .from("items")
        .select("*")
        .order("created_at", { ascending: false });

      if (itemsError) throw itemsError;

      const { data: itemTagsData, error: itemTagsError } = await supabase
        .from("item_tags")
        .select("item_id, tag_id, tags(*)");

      if (itemTagsError) throw itemTagsError;

      const itemsWithTags: Item[] = itemsData.map((item) => {
        const itemTags = itemTagsData
          .filter((it: any) => it.item_id === item.id)
          .map((it: any) => ({
            id: it.tags.id,
            name: it.tags.name,
          }));

        return {
          id: item.id,
          title: item.title,
          type: item.type as "fire" | "water" | "void",
          notes: item.notes || undefined,
          status: item.status || undefined,
          tags: itemTags,
          createdAt: new Date(item.created_at),
          deadline: item.deadline ? new Date(item.deadline) : undefined,
        };
      });

      setItems(itemsWithTags);
    } catch (error) {
      console.error("Error loading items:", error);
      toast.error("Failed to load items");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const addItem = async (title: string, type: "fire" | "water" | "void", tags: Tag[], deadline?: Date, notes?: string, status?: string) => {
    try {
      const { data: newItem, error: itemError } = await supabase
        .from("items")
        .insert({ 
          title,
          type,
          notes: notes || null,
          status: status || null,
          deadline: deadline?.toISOString()
        })
        .select()
        .single();

      if (itemError) throw itemError;

      for (const tag of tags) {
        let tagId = tag.id;
        
        if (!tag.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
          const { data: existingTag } = await supabase
            .from("tags")
            .select("*")
            .eq("name", tag.name)
            .single();

          if (existingTag) {
            tagId = existingTag.id;
          } else {
            const { data: newTag, error: tagError } = await supabase
              .from("tags")
              .insert({
                name: tag.name,
              })
              .select()
              .single();

            if (tagError) throw tagError;
            tagId = newTag.id;
          }
        }

        const { error: linkError } = await supabase
          .from("item_tags")
          .insert({
            item_id: newItem.id,
            tag_id: tagId,
          });

        if (linkError) throw linkError;
      }

      await loadItems();
      toast.success("Item added");
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error("Failed to add item");
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      await loadItems();
      toast.success("Item deleted");
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    }
  };

  const updateItem = async (
    itemId: string,
    updates: {
      title?: string;
      deadline?: Date | null;
      tags?: Tag[];
      notes?: string;
      status?: string;
      type?: "fire" | "water" | "void";
    }
  ) => {
    try {
      // Update the item fields if provided
      const itemUpdates: any = {};
      if ("title" in updates) {
        itemUpdates.title = updates.title;
      }
      if ("deadline" in updates) {
        itemUpdates.deadline = updates.deadline?.toISOString() || null;
      }
      if ("notes" in updates) {
        itemUpdates.notes = updates.notes || null;
      }
      if ("status" in updates) {
        itemUpdates.status = updates.status || null;
      }
      if ("type" in updates) {
        itemUpdates.type = updates.type;
      }

      if (Object.keys(itemUpdates).length > 0) {
        const { error: itemError } = await supabase
          .from("items")
          .update(itemUpdates)
          .eq("id", itemId);

        if (itemError) throw itemError;
      }

      // Update tags if provided
      if (updates.tags !== undefined) {
        // Delete existing item_tags
        const { error: deleteError } = await supabase
          .from("item_tags")
          .delete()
          .eq("item_id", itemId);

        if (deleteError) throw deleteError;

        // Add new tags (create missing tags if needed)
        for (const tag of updates.tags) {
          let tagId = tag.id;

          // If tag id is not a UUID, look up by name or create it
          if (!tag.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            const { data: existingTag } = await supabase
              .from("tags")
              .select("*")
              .eq("name", tag.name)
              .maybeSingle();

            if (existingTag) {
              tagId = existingTag.id;
            } else {
              const { data: newTag, error: tagError } = await supabase
                .from("tags")
                .insert({ name: tag.name })
                .select()
                .single();

              if (tagError) throw tagError;
              tagId = newTag.id;
            }
          }

          const { error: linkError } = await supabase
            .from("item_tags")
            .insert({
              item_id: itemId,
              tag_id: tagId,
            });

          if (linkError) throw linkError;
        }
      }

      await loadItems();
      toast.success("Item updated");
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error("Failed to update item");
    }
  };

  return { items, isLoading, addItem, deleteItem, updateItem };
}

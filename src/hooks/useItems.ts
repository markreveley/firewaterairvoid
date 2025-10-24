import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Tag {
  id: string;
  name: string;
  type: "fire" | "water";
  deadline?: Date;
}

interface Item {
  id: string;
  content: string;
  tags: Tag[];
  createdAt: Date;
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
            type: it.tags.type as "fire" | "water",
            deadline: it.tags.deadline ? new Date(it.tags.deadline) : undefined,
          }));

        return {
          id: item.id,
          content: item.content,
          tags: itemTags,
          createdAt: new Date(item.created_at),
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

  const addItem = async (content: string, tags: Tag[]) => {
    try {
      const { data: newItem, error: itemError } = await supabase
        .from("items")
        .insert({ content })
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
                type: tag.type,
                deadline: tag.deadline?.toISOString(),
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

  return { items, isLoading, addItem };
}

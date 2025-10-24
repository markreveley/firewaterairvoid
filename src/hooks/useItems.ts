import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data: itemsData, error: itemsError } = await supabase
        .from("items")
        .select("*")
        .order("created_at", { ascending: false });

      if (itemsError) throw itemsError;

      const { data: tagsData, error: tagsError } = await supabase
        .from("tags")
        .select("*");

      if (tagsError) throw tagsError;

      const { data: itemTagsData, error: itemTagsError } = await supabase
        .from("item_tags")
        .select("*");

      if (itemTagsError) throw itemTagsError;

      const formattedItems: Item[] = (itemsData || []).map((item) => {
        const itemTagIds = (itemTagsData || [])
          .filter((it) => it.item_id === item.id)
          .map((it) => it.tag_id);

        const itemTags = (tagsData || [])
          .filter((tag) => itemTagIds.includes(tag.id))
          .map((tag) => ({
            id: tag.id,
            name: tag.name,
            type: tag.type as "fire" | "water",
            deadline: tag.deadline ? new Date(tag.deadline) : undefined,
          }));

        return {
          id: item.id,
          content: item.content,
          tags: itemTags,
          createdAt: new Date(item.created_at),
        };
      });

      setItems(formattedItems);
    } catch (error: any) {
      toast({
        title: "Error loading items",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (content: string, tags: Tag[]) => {
    try {
      const { data: itemData, error: itemError } = await supabase
        .from("items")
        .insert({ content })
        .select()
        .single();

      if (itemError) throw itemError;

      for (const tag of tags) {
        const { data: existingTag } = await supabase
          .from("tags")
          .select("id")
          .eq("name", tag.name)
          .eq("type", tag.type)
          .maybeSingle();

        let tagId = existingTag?.id;

        if (!tagId) {
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

        const { error: itemTagError } = await supabase
          .from("item_tags")
          .insert({
            item_id: itemData.id,
            tag_id: tagId,
          });

        if (itemTagError) throw itemTagError;
      }

      await fetchItems();
      
      toast({
        title: "Item added",
        description: "Your item has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error adding item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return { items, loading, addItem };
}

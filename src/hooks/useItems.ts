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
  type: "fire" | "water" | "air" | "void" | "earth";
  notes?: string;
  status?: string;
  url?: string;
  tags: Tag[];
  createdAt: Date;
  deadline?: Date;
  parent_id?: string;
  parent?: { id: string; title: string; type: string };
  children?: Array<{ id: string; title: string; type: string }>;
}

export function useItems(type?: "fire" | "water" | "air" | "void" | "earth", pageSize: number = 10) {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const loadItems = async (reset: boolean = false) => {
    try {
      const currentOffset = reset ? 0 : offset;

      let query = supabase
        .from("items")
        .select("*")
        .order("created_at", { ascending: false });

      // Only filter by type if type is provided
      if (type) {
        query = query.eq("type", type).range(currentOffset, currentOffset + pageSize - 1);
      }

      const { data: itemsData, error: itemsError } = await query;

      if (itemsError) throw itemsError;

      // Check if we have more items (only relevant when type is provided for pagination)
      setHasMore(type ? itemsData.length === pageSize : false);

      const { data: itemTagsData, error: itemTagsError } = await supabase
        .from("item_tags")
        .select("item_id, tag_id, tags(*)");

      if (itemTagsError) throw itemTagsError;

      // Fetch parent items that aren't in the current filtered list
      const parentIds = itemsData
        .map((item: any) => item.parent_id)
        .filter((id: any) => id && !itemsData.find((i: any) => i.id === id));

      let parentItems: any[] = [];
      if (parentIds.length > 0) {
        const { data: parentData, error: parentError } = await supabase
          .from("items")
          .select("id, title, type")
          .in("id", parentIds);

        if (!parentError && parentData) {
          parentItems = parentData;
        }
      }

      // Fetch child items (items that have these items as parent)
      const itemIds = itemsData.map((item: any) => item.id);
      let childItems: any[] = [];
      if (itemIds.length > 0) {
        const { data: childData, error: childError } = await supabase
          .from("items")
          .select("id, title, type, parent_id")
          .in("parent_id", itemIds);

        if (!childError && childData) {
          childItems = childData;
        }
      }

      const itemsWithTags: Item[] = itemsData.map((item) => {
        const itemTags = itemTagsData
          .filter((it: any) => it.item_id === item.id)
          .map((it: any) => ({
            id: it.tags.id,
            name: it.tags.name,
          }));

        // Find parent item (check both filtered items and separately fetched parents)
        const parentItem = item.parent_id
          ? itemsData.find((i: any) => i.id === item.parent_id) ||
            parentItems.find((i: any) => i.id === item.parent_id)
          : null;

        // Find children items (items that have this item as parent)
        const childrenItems = childItems
          .filter((i: any) => i.parent_id === item.id)
          .map((i: any) => ({
            id: i.id,
            title: i.title,
            type: i.type,
          }));

        return {
          id: item.id,
          title: item.title,
          type: item.type as "fire" | "water" | "air" | "void" | "earth",
          notes: item.notes || undefined,
          status: item.status || undefined,
          url: item.url || undefined,
          tags: itemTags,
          createdAt: new Date(item.created_at),
          deadline: item.deadline ? new Date(item.deadline) : undefined,
          parent_id: item.parent_id || undefined,
          parent: parentItem ? {
            id: parentItem.id,
            title: parentItem.title,
            type: parentItem.type,
          } : undefined,
          children: childrenItems.length > 0 ? childrenItems : undefined,
        };
      });

      if (reset || !type) {
        // Reset or loading all items (no pagination)
        setItems(itemsWithTags);
        setOffset(type ? pageSize : 0);
      } else {
        // Appending more items for pagination
        setItems((prev) => [...prev, ...itemsWithTags]);
        setOffset((prev) => prev + pageSize);
      }
    } catch (error) {
      console.error("Error loading items:", error);
      toast.error("Failed to load items");
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore || isLoading) return;
    setIsLoading(true);
    await loadItems(false);
  };

  useEffect(() => {
    setItems([]);
    setOffset(0);
    setHasMore(true);
    setIsLoading(true);
    loadItems(true);
  }, [type, pageSize]);

  const addItem = async (title: string, type: "fire" | "water" | "air" | "void" | "earth", tags: Tag[], deadline?: Date, notes?: string, status?: string, url?: string, parent_id?: string) => {
    try {
      const { data: newItem, error: itemError } = await supabase
        .from("items")
        .insert({ 
          title,
          type,
          notes: notes || null,
          status: status || null,
          url: url || null,
          deadline: deadline?.toISOString(),
          parent_id: parent_id || null,
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

      setItems([]);
      setOffset(0);
      setHasMore(true);
      await loadItems(true);
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

      setItems([]);
      setOffset(0);
      setHasMore(true);
      await loadItems(true);
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
      url?: string;
      type?: "fire" | "water" | "air" | "void" | "earth";
      parent_id?: string | null;
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
      if ("url" in updates) {
        itemUpdates.url = updates.url || null;
      }
      if ("type" in updates) {
        itemUpdates.type = updates.type;
      }
      if ("parent_id" in updates) {
        itemUpdates.parent_id = updates.parent_id || null;
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

      setItems([]);
      setOffset(0);
      setHasMore(true);
      await loadItems(true);
      toast.success("Item updated");
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error("Failed to update item");
    }
  };

  return { items, isLoading, hasMore, addItem, deleteItem, updateItem, loadMore };
}

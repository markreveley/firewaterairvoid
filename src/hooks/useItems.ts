import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tag, Item, ItemType } from "@/types";
import { supportsUrl, supportsStatus, supportsDeadline } from "@/utils/itemTypes";

export function useItems(type?: ItemType, pageSize: number = 10) {
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
        // Only fetch top-level items OR child items (not sub-items)
        // Sub-items (is_subitem=true) only appear in parent's Items tab
        .eq("is_subitem", false)
        // Sort by priority first (DESC), then deadline (ASC with nulls last), then created_at (DESC)
        .order("priority", { ascending: false })
        .order("deadline", { ascending: true, nullsFirst: false })
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

      // Fetch child items (hierarchical relationships) - NOT sub-items
      // Sub-items are fetched separately in ItemDetail
      const itemIds = itemsData.map((item: any) => item.id);
      let childItems: any[] = [];
      if (itemIds.length > 0) {
        const { data: childData, error: childError } = await supabase
          .from("items")
          .select("id, title, type, parent_id, completed, is_subitem")
          .in("parent_id", itemIds)
          .eq("is_subitem", false); // Only child items, not sub-items

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
            completed: i.completed || false,
          }));

        return {
          id: item.id,
          title: item.title,
          type: item.type as ItemType,
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
          priority: item.priority || 0,
          completed: item.completed || false,
          is_subitem: item.is_subitem || false,
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

  const addItem = async (title: string, type: ItemType, tags: Tag[], deadline?: Date, notes?: string, status?: string, url?: string, parent_id?: string, is_subitem?: boolean) => {
    try {
      const { data: newItem, error: itemError} = await supabase
        .from("items")
        .insert({
          title,
          type,
          notes: notes || null,
          status: status || null,
          url: url || null,
          deadline: deadline?.toISOString(),
          parent_id: parent_id || null,
          is_subitem: is_subitem || false,
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

      return newItem; // Return the created item
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error("Failed to add item");
      return null;
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      // Get the item data first
      const { data: itemData, error: fetchError } = await supabase
        .from("items")
        .select("*")
        .eq("id", itemId)
        .single();

      if (fetchError) throw fetchError;

      // Get the item's tags
      const { data: itemTagsData } = await supabase
        .from("item_tags")
        .select("item_id, tag_id")
        .eq("item_id", itemId);

      // Insert into trashed_items table
      const { error: trashError } = await supabase
        .from("trashed_items")
        .insert({
          original_id: itemData.id,
          title: itemData.title,
          type: itemData.type,
          notes: itemData.notes,
          status: itemData.status,
          url: itemData.url,
          deadline: itemData.deadline,
          parent_id: itemData.parent_id,
          created_at: itemData.created_at,
        });

      if (trashError) throw trashError;

      // Delete the item from items table (cascades to item_tags)
      const { error: deleteError } = await supabase
        .from("items")
        .delete()
        .eq("id", itemId);

      if (deleteError) throw deleteError;

      setItems([]);
      setOffset(0);
      setHasMore(true);
      await loadItems(true);
      toast.success("Item moved to trash");
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
      type?: ItemType;
      parent_id?: string | null;
      priority?: number;
      completed?: boolean;
    }
  ) => {
    try {
      // Get the current item to check if type is changing
      const currentItem = items.find(item => item.id === itemId);

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

        // Clear type-specific fields only if type is actually changing
        if (currentItem && currentItem.type !== updates.type) {
          const newType = updates.type;

          // Clear status and deadline if changing to non-Fire type
          if (!supportsStatus(newType)) {
            itemUpdates.status = null;
          }
          if (!supportsDeadline(newType)) {
            itemUpdates.deadline = null;
          }

          // Clear URL if changing to type that doesn't support it
          if (!supportsUrl(newType)) {
            itemUpdates.url = null;
          }
        }
      }
      if ("parent_id" in updates) {
        itemUpdates.parent_id = updates.parent_id || null;
      }
      if ("priority" in updates) {
        itemUpdates.priority = updates.priority;
      }
      if ("completed" in updates) {
        itemUpdates.completed = updates.completed;
      }

      if (Object.keys(itemUpdates).length > 0) {
        console.log("Updating item with:", itemUpdates);
        const { error: itemError } = await supabase
          .from("items")
          .update(itemUpdates)
          .eq("id", itemId);

        if (itemError) {
          console.error("Update error:", itemError);
          throw itemError;
        }
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

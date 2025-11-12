import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client-safe";
import { toast } from "sonner";
import type { Tag, Item, ItemType, RecurrenceType } from "@/types";
import { supportsUrl, supportsStatus, supportsDeadline } from "@/utils/itemTypes";

// Query key factory for items
const itemKeys = {
  all: ['items'] as const,
  lists: () => [...itemKeys.all, 'list'] as const,
  list: (type?: ItemType, pageSize?: number) => [...itemKeys.lists(), { type, pageSize }] as const,
};

// Fetch items from database
async function fetchItems(type?: ItemType, pageSize: number = 10, offset: number = 0) {
  let query = supabase
    .from("items")
    .select("*")
    .eq("is_subitem", false)
    .order("priority", { ascending: true })
    .order("deadline", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (type) {
    query = query.eq("type", type).range(offset, offset + pageSize - 1);
  }

  const { data: itemsData, error: itemsError } = await query;
  if (itemsError) throw itemsError;

  // Fetch all item tags
  const { data: itemTagsData, error: itemTagsError } = await supabase
    .from("item_tags")
    .select("item_id, tag_id, tags(*)");
  if (itemTagsError) throw itemTagsError;

  // Fetch parent items
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

  // Fetch child items
  const itemIds = itemsData.map((item: any) => item.id);
  let childItems: any[] = [];
  if (itemIds.length > 0) {
    const { data: childData, error: childError } = await supabase
      .from("items")
      .select("id, title, type, parent_id, completed, is_subitem")
      .in("parent_id", itemIds)
      .eq("is_subitem", false);

    if (!childError && childData) {
      childItems = childData;
    }
  }

  // Fetch sub-items (is_subitem = true)
  let subItemsData: any[] = [];
  if (itemIds.length > 0) {
    const { data: subData, error: subError } = await supabase
      .from("items")
      .select("id, title, type, parent_id, completed")
      .in("parent_id", itemIds)
      .eq("is_subitem", true);

    if (!subError && subData) {
      subItemsData = subData;
    }
  }

  // Transform to Item objects
  const itemsWithTags: Item[] = itemsData.map((item) => {
    const itemTags = itemTagsData
      .filter((it: any) => it.item_id === item.id)
      .map((it: any) => ({
        id: it.tags.id,
        name: it.tags.name,
        parent_id: it.tags.parent_id,
      }));

    const parentItem = item.parent_id
      ? itemsData.find((i: any) => i.id === item.parent_id) ||
        parentItems.find((i: any) => i.id === item.parent_id)
      : null;

    const childrenItems = childItems
      .filter((i: any) => i.parent_id === item.id)
      .map((i: any) => ({
        id: i.id,
        title: i.title,
        type: i.type,
        completed: i.completed || false,
      }));

    const itemSubItems = subItemsData
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
      subItems: itemSubItems.length > 0 ? itemSubItems : undefined,
      priority: item.priority || 0,
      completed: item.completed || false,
      is_subitem: item.is_subitem || false,
      recurrence_type: (item.recurrence_type as RecurrenceType) || 'none',
      recurrence_end_date: item.recurrence_end_date ? new Date(item.recurrence_end_date) : undefined,
    };
  });

  return {
    items: itemsWithTags,
    hasMore: type ? itemsData.length === pageSize : false,
  };
}

export function useItems(type?: ItemType, pageSize: number = 10) {
  const queryClient = useQueryClient();
  const [offset, setOffset] = useState(0);
  const [allItems, setAllItems] = useState<Item[]>([]);

  // Fetch items using useQuery
  const { data, isLoading, refetch } = useQuery({
    queryKey: itemKeys.list(type, pageSize),
    queryFn: () => fetchItems(type, pageSize, offset),
    // Query is always enabled - when type is undefined, fetches all items
  });

  // Track accumulated items for pagination
  const items = offset === 0 ? (data?.items || []) : allItems;
  const hasMore = data?.hasMore || false;

  // Load more items (pagination)
  const loadMore = async () => {
    if (!hasMore || isLoading) return;

    const newOffset = offset + pageSize;
    setOffset(newOffset);

    const result = await fetchItems(type, pageSize, newOffset);
    setAllItems(prev => [...prev, ...result.items]);
  };

  // Reset pagination when type changes
  if (offset > 0 && data?.items) {
    setOffset(0);
    setAllItems([]);
  }

  // Add item mutation
  const addItemMutation = useMutation({
    mutationFn: async ({
      title,
      type,
      tags,
      deadline,
      notes,
      status,
      url,
      parent_id,
      is_subitem,
      recurrence_type,
      recurrence_end_date,
      priority,
    }: {
      title: string;
      type: ItemType;
      tags: Tag[];
      deadline?: Date;
      notes?: string;
      status?: string;
      url?: string;
      parent_id?: string;
      is_subitem?: boolean;
      recurrence_type?: RecurrenceType;
      recurrence_end_date?: Date;
      priority?: number;
    }) => {
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
          is_subitem: is_subitem || false,
          recurrence_type: recurrence_type || 'none',
          recurrence_end_date: recurrence_end_date?.toISOString() || null,
          priority: priority || 3, // Default to TODO (3) if not specified
        })
        .select()
        .single();

      if (itemError) throw itemError;

      // Add tags and track the IDs
      const insertedTags: Tag[] = [];
      for (const tag of tags) {
        let tagId = tag.id;

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
            item_id: newItem.id,
            tag_id: tagId,
          });

        if (linkError) throw linkError;
        
        // Track the inserted tag with its actual ID
        insertedTags.push({ id: tagId, name: tag.name });
      }

      // Return the item with its tags attached for immediate use
      return {
        ...newItem,
        tags: insertedTags
      };
    },
    onSuccess: async () => {
      // Invalidate and wait for refetch to complete
      await queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
      toast.success("Item added");
      setOffset(0);
      setAllItems([]);
    },
    onError: (error) => {
      console.error("Error adding item:", error);
      toast.error("Failed to add item");
    },
  });

  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { data: itemData, error: fetchError } = await supabase
        .from("items")
        .select("*")
        .eq("id", itemId)
        .single();

      if (fetchError) throw fetchError;

      // Insert into trashed_items
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

      // Delete the item
      const { error: deleteError } = await supabase
        .from("items")
        .delete()
        .eq("id", itemId);

      if (deleteError) throw deleteError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
      toast.success("Item moved to trash");
      setOffset(0);
      setAllItems([]);
    },
    onError: (error) => {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    },
  });

  // Bulk delete items mutation
  const bulkDeleteItemsMutation = useMutation({
    mutationFn: async (itemIds: string[]) => {
      for (const itemId of itemIds) {
        const { data: itemData, error: fetchError } = await supabase
          .from("items")
          .select("*")
          .eq("id", itemId)
          .single();

        if (fetchError) throw fetchError;

        // Insert into trashed_items
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

        // Delete the item
        const { error: deleteError } = await supabase
          .from("items")
          .delete()
          .eq("id", itemId);

        if (deleteError) throw deleteError;
      }
    },
    onSuccess: (_, itemIds) => {
      queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
      toast.success(`${itemIds.length} ${itemIds.length === 1 ? 'item' : 'items'} moved to trash`);
      setOffset(0);
      setAllItems([]);
    },
    onError: (error) => {
      console.error("Error deleting items:", error);
      toast.error("Failed to delete items");
    },
  });

  // Update item mutation with optimistic updates
  const updateItemMutation = useMutation({
    mutationFn: async ({
      itemId,
      updates,
    }: {
      itemId: string;
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
        recurrence_type?: RecurrenceType;
        recurrence_end_date?: Date | null;
      };
    }) => {
      const currentItem = items.find(item => item.id === itemId);

      // Build item updates
      const itemUpdates: any = {};
      if ("title" in updates) itemUpdates.title = updates.title;
      if ("deadline" in updates) itemUpdates.deadline = updates.deadline?.toISOString() || null;
      if ("notes" in updates) itemUpdates.notes = updates.notes || null;
      if ("status" in updates) itemUpdates.status = updates.status || null;
      if ("url" in updates) itemUpdates.url = updates.url || null;
      if ("parent_id" in updates) itemUpdates.parent_id = updates.parent_id || null;
      if ("priority" in updates) itemUpdates.priority = updates.priority;
      if ("completed" in updates) itemUpdates.completed = updates.completed;
      if ("recurrence_type" in updates) itemUpdates.recurrence_type = updates.recurrence_type;
      if ("recurrence_end_date" in updates) itemUpdates.recurrence_end_date = updates.recurrence_end_date?.toISOString() || null;

      if ("type" in updates) {
        itemUpdates.type = updates.type;

        // Clear type-specific fields if type is changing
        if (currentItem && currentItem.type !== updates.type) {
          const newType = updates.type!;
          if (!supportsStatus(newType)) itemUpdates.status = null;
          if (!supportsDeadline(newType)) itemUpdates.deadline = null;
          if (!supportsUrl(newType)) itemUpdates.url = null;
        }
      }

      // Update item in database
      if (Object.keys(itemUpdates).length > 0) {
        const { error: itemError } = await supabase
          .from("items")
          .update(itemUpdates)
          .eq("id", itemId);

        if (itemError) throw itemError;
      }

      // Update tags if provided
      if (updates.tags !== undefined) {
        const { error: deleteError } = await supabase
          .from("item_tags")
          .delete()
          .eq("item_id", itemId);

        if (deleteError) throw deleteError;

        for (const tag of updates.tags) {
          let tagId = tag.id;

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

      // No return needed - mutation returns void
    },
    onMutate: async ({ itemId, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: itemKeys.lists() });

      // Snapshot previous value
      const previousData = queryClient.getQueryData(itemKeys.list(type, pageSize));

      // Optimistically update
      queryClient.setQueryData(itemKeys.list(type, pageSize), (old: any) => {
        if (!old) return old;

        return {
          ...old,
          items: old.items.map((item: Item) => {
            if (item.id !== itemId) return item;

            const updatedItem = { ...item };
            if ("title" in updates) updatedItem.title = updates.title!;
            if ("deadline" in updates) updatedItem.deadline = updates.deadline || undefined;
            if ("notes" in updates) updatedItem.notes = updates.notes;
            if ("status" in updates) updatedItem.status = updates.status;
            if ("url" in updates) updatedItem.url = updates.url;
            if ("type" in updates) updatedItem.type = updates.type!;
            if ("parent_id" in updates) updatedItem.parent_id = updates.parent_id || undefined;
            if ("priority" in updates) updatedItem.priority = updates.priority!;
            if ("completed" in updates) updatedItem.completed = updates.completed!;
            if ("tags" in updates) updatedItem.tags = updates.tags!;
            if ("recurrence_type" in updates) updatedItem.recurrence_type = updates.recurrence_type!;
            if ("recurrence_end_date" in updates) updatedItem.recurrence_end_date = updates.recurrence_end_date || undefined;

            return updatedItem;
          }),
        };
      });

      return { previousData };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(itemKeys.list(type, pageSize), context.previousData);
      }
      console.error("Error updating item:", error);
      toast.error("Failed to update item");
    },
    onSuccess: () => {
      toast.success("Item updated");
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
    },
  });

  return {
    items,
    isLoading,
    hasMore,
    isBulkDeleting: bulkDeleteItemsMutation.isPending,
    addItem: (
      title: string,
      type: ItemType,
      tags: Tag[],
      deadline?: Date,
      notes?: string,
      status?: string,
      url?: string,
      parent_id?: string,
      is_subitem?: boolean,
      recurrence_type?: RecurrenceType,
      recurrence_end_date?: Date,
      priority?: number
    ) => addItemMutation.mutateAsync({
      title,
      type,
      tags,
      deadline,
      notes,
      status,
      url,
      parent_id,
      is_subitem,
      recurrence_type,
      recurrence_end_date,
      priority,
    }),
    deleteItem: (itemId: string) => deleteItemMutation.mutateAsync(itemId),
    bulkDeleteItems: (itemIds: string[]) => bulkDeleteItemsMutation.mutateAsync(itemIds),
    updateItem: (itemId: string, updates: any) => updateItemMutation.mutateAsync({ itemId, updates }),
    loadMore,
  };
}

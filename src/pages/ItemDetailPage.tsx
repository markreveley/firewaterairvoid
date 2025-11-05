import { useNavigate, useSearchParams } from "react-router-dom";
import ItemDetail from "./ItemDetail";
import { useItems } from "@/hooks/useItems";
import { useTags } from "@/hooks/useTags";
import type { ItemType, Tag } from "@/types";

export default function ItemDetailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const itemId = searchParams.get("id");
  const typeParam = searchParams.get("type") as ItemType | null;

  // Use typeParam to fetch items of that type so we can find the existing item
  const { addItem, updateItem, deleteItem, items, isLoading } = useItems(typeParam || undefined);

  // Fetch all items for parent selection (fire items can have parents from earth, air, void, and fire)
  const { items: allItemsRaw } = useItems(undefined);

  // Filter out water items (calendar/event-based) from parent options
  const allItemsForParents = allItemsRaw.filter(item => item.type !== 'water');

  const { allTags } = useTags();

  const existingItem = itemId ? items.find(item => item.id === itemId) : null;

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
    type: ItemType,
    tags: Tag[],
    deadline?: Date,
    notes?: string,
    status?: string,
    url?: string,
    parent_id?: string,
    is_subitem?: boolean,
    recurrence_type?: any,
    recurrence_end_date?: Date,
    priority?: number
  ) => {
    // If parent_id is provided AND is_subitem is true, we're creating a sub-item via Items tab
    if (parent_id && is_subitem) {
      await addItem(title, type, tags, deadline, notes, status, url, parent_id, true);
      return;
    }

    // Otherwise, we're saving the current item (not a sub-item)
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
        parent_id: parent_id || null, // Use parent_id for hierarchical linking
        priority,
        recurrence_type,
        recurrence_end_date: recurrence_end_date || null,
      });
    } else {
      // Create mode - add new item (not a sub-item, even if it has a parent)
      const newItem = await addItem(title, type, tags, deadline, notes, status, url, parent_id, false, recurrence_type, recurrence_end_date, priority);

      // Navigate to edit view of the newly created item so Items tab becomes enabled
      if (newItem) {
        navigate(`/item/edit?id=${newItem.id}&type=${type}`);
      }
    }
  };

  return <ItemDetail onAddItem={handleAddItem} existingTags={allTags} existingItem={existingItem} allItems={allItemsForParents} onDeleteItem={deleteItem} onUpdateItem={updateItem} />;
}

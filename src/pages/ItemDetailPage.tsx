import { useNavigate, useSearchParams } from "react-router-dom";
import ItemDetail from "./ItemDetail";
import { useItems } from "@/hooks/useItems";

export default function ItemDetailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addItem, updateItem, items, isLoading } = useItems();
  
  const itemId = searchParams.get("id");
  const existingItem = itemId ? items.find(item => item.id === itemId) : null;

  // Wait for items to load if we're editing an existing item
  if (isLoading && itemId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const existingTags = Array.from(
    new Map(
      items.flatMap((item) => item.tags).map((tag) => [tag.id, tag])
    ).values()
  );

  const handleAddItem = async (
    title: string,
    type: "fire" | "water" | "void",
    tags: Array<{ id: string; name: string }>,
    deadline?: Date,
    notes?: string,
    status?: string
  ) => {
    if (existingItem) {
      // Edit mode - update existing item
      await updateItem(existingItem.id, { 
        title,
        type, 
        tags, 
        deadline: deadline || null, 
        notes, 
        status 
      });
    } else {
      // Create mode - add new item
      await addItem(title, type, tags, deadline, notes, status);
    }
    navigate(-1);
  };

  return <ItemDetail onAddItem={handleAddItem} existingTags={existingTags} existingItem={existingItem} />;
}

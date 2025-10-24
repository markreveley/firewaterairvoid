import { useNavigate } from "react-router-dom";
import ItemDetail from "./ItemDetail";
import { useItems } from "@/hooks/useItems";

export default function ItemDetailPage() {
  const navigate = useNavigate();
  const { addItem, items } = useItems();

  const existingTags = Array.from(
    new Map(
      items.flatMap((item) => item.tags).map((tag) => [tag.id, tag])
    ).values()
  );

  const handleAddItem = async (
    title: string,
    tags: Array<{ id: string; name: string; type: "fire" | "water" | "void" }>,
    deadline?: Date,
    notes?: string,
    status?: string
  ) => {
    await addItem(title, tags, deadline, notes, status);
    navigate("/");
  };

  return <ItemDetail onAddItem={handleAddItem} existingTags={existingTags} />;
}

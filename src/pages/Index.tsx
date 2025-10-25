import { useEffect, useState } from "react";
import { ItemList } from "@/components/ItemList";
import { FireWaterToggle } from "@/components/FireWaterToggle";
import { TagFilter } from "@/components/TagFilter";
import { StatusFilter } from "@/components/StatusFilter";
import { useItems } from "@/hooks/useItems";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Tag {
  id: string;
  name: string;
}

const Index = () => {
  const { items, isLoading, addItem, deleteItem, updateItem } = useItems();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialType = (searchParams.get("type") as "fire" | "water" | "air" | "void" | "earth") || "fire";
  const [activeType, setActiveType] = useState<"fire" | "water" | "air" | "void" | "earth">(initialType);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>();
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<"To Do" | "Completed">("To Do");

  const handleAddItem = async (title: string, type: "fire" | "water" | "air" | "void" | "earth", tags: Tag[], deadline?: Date, notes?: string, status?: string, url?: string) => {
    // Default status to "To Do" for fire items if not provided
    const finalStatus = type === "fire" && !status ? "To Do" : status;
    await addItem(title, type, tags, deadline, notes, finalStatus, url);
    // Switch to the type of the newly created item
    if (type !== activeType) {
      setActiveType(type);
    }
  };

  useEffect(() => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set("type", activeType);
      if (selectedTagFilter) p.set("tag", selectedTagFilter);
      else p.delete("tag");
      return p;
    });
  }, [activeType, selectedTagFilter, setSearchParams]);

  const allTags = items.reduce((acc, item) => {
    item.tags.forEach(tag => {
      if (!acc.find(t => t.id === tag.id)) {
        acc.push(tag);
      }
    });
    return acc;
  }, [] as Tag[]);
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-8 md:px-12 lg:px-16 py-12 space-y-8">
        <div className="py-4">
          <FireWaterToggle activeType={activeType} onToggle={setActiveType} />
        </div>

        {activeType === "fire" && (
          <div className="py-2">
            <StatusFilter 
              selectedStatus={selectedStatusFilter} 
              onSelectStatus={setSelectedStatusFilter} 
            />
          </div>
        )}

        <div className="flex justify-center py-4">
          <Button
            onClick={() => navigate(`/item/new?type=${activeType}`)}
            variant="white"
            size="lg"
            className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>

        <div className="py-2">
          <TagFilter 
            tags={allTags} 
            type={activeType} 
            selectedTag={selectedTagFilter} 
            onSelectTag={setSelectedTagFilter} 
          />
        </div>

        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : (
            <ItemList 
              items={items} 
              type={activeType} 
              selectedTagFilter={selectedTagFilter}
              selectedStatusFilter={activeType === "fire" ? selectedStatusFilter : undefined}
              onDeleteItem={deleteItem}
              onUpdateItem={updateItem}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;

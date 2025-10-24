import { useEffect, useState } from "react";
import { ItemInput } from "@/components/ItemInput";
import { ItemList } from "@/components/ItemList";
import { FireWaterToggle } from "@/components/FireWaterToggle";
import { TagFilter } from "@/components/TagFilter";
import { useItems } from "@/hooks/useItems";
import { useSearchParams } from "react-router-dom";

interface Tag {
  id: string;
  name: string;
}

const Index = () => {
  const { items, isLoading, addItem, deleteItem, updateItem } = useItems();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialType = (searchParams.get("type") as "fire" | "water" | "air" | "void") || "fire";
  const [activeType, setActiveType] = useState<"fire" | "water" | "air" | "void">(initialType);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>();

  const handleAddItem = async (title: string, type: "fire" | "water" | "air" | "void", tags: Tag[], deadline?: Date, notes?: string, status?: string, url?: string) => {
    await addItem(title, type, tags, deadline, notes, status, url);
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
      <div className="container mx-auto px-8 md:px-12 lg:px-16 py-12 space-y-12">
        <header className="text-center space-y-2">
          
          
        </header>

        <div className="py-8">
          <ItemInput onAddItem={handleAddItem} existingTags={allTags} currentType={activeType} />
        </div>

        <div className="py-4">
          <FireWaterToggle activeType={activeType} onToggle={setActiveType} />
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

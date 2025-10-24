import { useState } from "react";
import { ItemInput } from "@/components/ItemInput";
import { ItemList } from "@/components/ItemList";
import { FireWaterToggle } from "@/components/FireWaterToggle";
import { TagFilter } from "@/components/TagFilter";
import { useItems } from "@/hooks/useItems";
import { UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/firewatervoid-logo.png";

interface Tag {
  id: string;
  name: string;
}

const Index = () => {
  const { items, isLoading, addItem, deleteItem, updateItem } = useItems();
  const [activeType, setActiveType] = useState<"fire" | "water" | "void">("fire");
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>();

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
      <div className="container mx-auto px-4 py-12 space-y-12">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <img src={logo} alt="FireWaterVoid" className="h-12 w-12" />
            <h1 className="text-2xl font-semibold">firewatervoid</h1>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <UserCircle className="w-6 h-6" />
          </Button>
        </header>

        <div className="py-8">
          <ItemInput onAddItem={addItem} existingTags={allTags} />
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

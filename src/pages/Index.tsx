import { useState } from "react";
import { ItemInput } from "@/components/ItemInput";
import { ItemList } from "@/components/ItemList";
import { FireWaterToggle } from "@/components/FireWaterToggle";
import { TagFilter } from "@/components/TagFilter";
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
const Index = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [activeType, setActiveType] = useState<"fire" | "water">("fire");
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>();

  // Collect all unique tags from items
  const allTags = items.reduce((acc, item) => {
    item.tags.forEach(tag => {
      if (!acc.find(t => t.id === tag.id)) {
        acc.push(tag);
      }
    });
    return acc;
  }, [] as Tag[]);
  const handleAddItem = (content: string, tags: Tag[]) => {
    const newItem: Item = {
      id: Date.now().toString(),
      content,
      tags,
      createdAt: new Date()
    };
    setItems([newItem, ...items]);
  };
  return <div className="min-h-screen bg-gradient-to-br from-background via-zen-sand to-background">
      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Header */}
        <header className="text-center space-y-2">
          
          
        </header>

        {/* Input Section */}
        <div className="py-8">
          <ItemInput onAddItem={handleAddItem} existingTags={allTags} />
        </div>

        {/* Toggle Section */}
        <div className="py-4">
          <FireWaterToggle activeType={activeType} onToggle={setActiveType} />
        </div>

        {/* Tag Filter */}
        <div className="py-2">
          <TagFilter tags={allTags} type={activeType} selectedTag={selectedTagFilter} onSelectTag={setSelectedTagFilter} />
        </div>

        {/* Items Display */}
        <div className="max-w-4xl mx-auto">
          <ItemList items={items} type={activeType} selectedTagFilter={selectedTagFilter} />
        </div>
      </div>
    </div>;
};
export default Index;
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Flame, Droplet, ExternalLink } from "lucide-react";
import { format, isPast } from "date-fns";
import { cn } from "@/lib/utils";
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
interface ItemListProps {
  items: Item[];
  type: "fire" | "water";
  selectedTagFilter?: string;
}
export function ItemList({
  items,
  type,
  selectedTagFilter
}: ItemListProps) {
  const filteredItems = items.filter(item => {
    // Show items without tags OR items with matching type tags
    const hasTypeTag = item.tags.length === 0 || item.tags.some(tag => tag.type === type);
    if (!hasTypeTag) return false;
    if (selectedTagFilter) {
      return item.tags.some(tag => tag.id === selectedTagFilter);
    }
    return true;
  });
  const isUrl = (text: string) => {
    try {
      new URL(text);
      return true;
    } catch {
      return false;
    }
  };
  return <div className="space-y-3">
      {filteredItems.length === 0 ? <div className="text-center py-12 text-muted-foreground">
          
        </div> : filteredItems.map(item => {
      const fireTag = item.tags.find(t => t.type === "fire" && t.deadline);
      const isOverdue = fireTag?.deadline && isPast(fireTag.deadline);
      return <Card key={item.id} className={cn("p-4 transition-all duration-300 hover:shadow-lg", type === "fire" && "border-l-4 border-l-fire-primary", type === "water" && "border-l-4 border-l-water-primary", isOverdue && "bg-fire-light/50")}>
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-base flex-1">
                    {isUrl(item.content) ? <a href={item.content} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                        {item.content}
                        <ExternalLink className="w-4 h-4" />
                      </a> : item.content}
                  </p>
                  {fireTag?.deadline && <div className={cn("text-xs px-2 py-1 rounded-full flex items-center gap-1", isOverdue ? "bg-fire-dark text-white" : "bg-fire-light text-fire-dark")}>
                      <Flame className="w-3 h-3" />
                      {format(fireTag.deadline, "MMM d, yyyy")}
                    </div>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map(tag => <Badge key={tag.id} variant="outline" className={cn("text-xs", tag.type === "fire" ? "border-fire-secondary text-fire-dark" : "border-water-secondary text-water-dark")}>
                      {tag.type === "fire" ? <Flame className="w-3 h-3 mr-1" /> : <Droplet className="w-3 h-3 mr-1" />}
                      {tag.name}
                    </Badge>)}
                </div>
              </div>
            </Card>;
    })}
    </div>;
}
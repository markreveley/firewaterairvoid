import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Flame, Droplet, ExternalLink, X, CalendarIcon, Clock, Edit2, Trash2 } from "lucide-react";
import { format, isPast, set } from "date-fns";
import { cn } from "@/lib/utils";
interface Tag {
  id: string;
  name: string;
  type: "fire" | "water";
}

interface Item {
  id: string;
  content: string;
  tags: Tag[];
  createdAt: Date;
  deadline?: Date;
}

interface ItemListProps {
  items: Item[];
  type: "fire" | "water";
  selectedTagFilter?: string;
  onDeleteItem: (itemId: string) => void;
  onUpdateItem: (itemId: string, updates: { deadline?: Date | null; tags?: Tag[] }) => void;
}
export function ItemList({
  items,
  type,
  selectedTagFilter,
  onDeleteItem,
  onUpdateItem
}: ItemListProps) {
  const [editingDeadlineId, setEditingDeadlineId] = useState<string | null>(null);
  const [editDeadline, setEditDeadline] = useState<Date>();
  const [editTime, setEditTime] = useState<string>("09:00");

  // Generate time options in 15-minute intervals
  const timeOptions = Array.from({ length: 96 }, (_, i) => {
    const hours = Math.floor(i / 4);
    const minutes = (i % 4) * 15;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  });
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

  const startEditingDeadline = (item: Item) => {
    setEditingDeadlineId(item.id);
    setEditDeadline(item.deadline || new Date());
    if (item.deadline) {
      const hours = item.deadline.getHours().toString().padStart(2, '0');
      const minutes = item.deadline.getMinutes().toString().padStart(2, '0');
      setEditTime(`${hours}:${minutes}`);
    }
  };

  const saveDeadline = (itemId: string) => {
    if (editDeadline && editTime) {
      const [hours, minutes] = editTime.split(':').map(Number);
      const finalDeadline = set(editDeadline, { hours, minutes, seconds: 0, milliseconds: 0 });
      onUpdateItem(itemId, { deadline: finalDeadline });
    }
    setEditingDeadlineId(null);
  };

  const deleteDeadline = (item: Item) => {
    // Remove fire tags and deadline
    const waterTags = item.tags.filter(tag => tag.type === "water");
    onUpdateItem(item.id, { deadline: null, tags: waterTags });
  };
  return <div className="space-y-3">
      {filteredItems.length === 0 ? <div className="text-center py-12 text-muted-foreground">
          
        </div> : filteredItems.map(item => {
      const isOverdue = item.deadline && isPast(item.deadline);
      const hasFireTag = item.tags.some(tag => tag.type === "fire");
      const isEditingThisDeadline = editingDeadlineId === item.id;
      
      return <Card key={item.id} className={cn("p-4 transition-all duration-300 hover:shadow-lg", type === "fire" && "border-l-4 border-l-fire-primary", type === "water" && "border-l-4 border-l-water-primary", isOverdue && "bg-fire-light/50")}>
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-base flex-1">
                    {isUrl(item.content) ? <a href={item.content} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                        {item.content}
                        <ExternalLink className="w-4 h-4" />
                      </a> : item.content}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Delete item"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {hasFireTag && item.deadline && !isEditingThisDeadline && (
                  <div className="flex items-center gap-2">
                    <div className={cn("text-xs px-2 py-1 rounded-full flex items-center gap-1", isOverdue ? "bg-fire-dark text-white" : "bg-fire-light text-fire-dark")}>
                      <Flame className="w-3 h-3" />
                      {format(item.deadline, "MMM d, yyyy 'at' HH:mm")}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => startEditingDeadline(item)}
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      onClick={() => deleteDeadline(item)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}

                {hasFireTag && isEditingThisDeadline && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                        >
                          <CalendarIcon className="w-3 h-3 mr-1" />
                          {editDeadline ? format(editDeadline, "MMM d, yyyy") : "Pick date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={editDeadline}
                          onSelect={setEditDeadline}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Select value={editTime} onValueChange={setEditTime}>
                      <SelectTrigger className="w-24 h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {timeOptions.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant="default"
                      className="h-7"
                      onClick={() => saveDeadline(item.id)}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7"
                      onClick={() => setEditingDeadlineId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
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
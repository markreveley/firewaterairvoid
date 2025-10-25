import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Flame, Droplet, Circle, ExternalLink, X, CalendarIcon, Clock, Edit2, Trash2, MoreHorizontal, Wind, Check, ArrowUp, ArrowDown, Mountain } from "lucide-react";
import { format, isPast, set } from "date-fns";
import { cn } from "@/lib/utils";
interface Tag {
  id: string;
  name: string;
}

interface Item {
  id: string;
  title: string;
  type: "fire" | "water" | "air" | "void" | "earth";
  notes?: string;
  status?: string;
  url?: string;
  tags: Tag[];
  createdAt: Date;
  deadline?: Date;
  parent_id?: string;
  parent?: { id: string; title: string; type: string };
  children?: Array<{ id: string; title: string; type: string }>;
}

interface ItemListProps {
  items: Item[];
  type: "fire" | "water" | "air" | "void" | "earth";
  selectedTagFilter?: string;
  selectedStatusFilter?: "To Do" | "Completed";
  onDeleteItem: (itemId: string) => void;
  onUpdateItem: (itemId: string, updates: { deadline?: Date | null; tags?: Tag[]; notes?: string; status?: string; url?: string; type?: "fire" | "water" | "air" | "void" | "earth"; parent_id?: string | null }) => void;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "fire": return <Flame className="w-3 h-3" />;
    case "water": return <Droplet className="w-3 h-3" />;
    case "air": return <Wind className="w-3 h-3" />;
    case "earth": return <Mountain className="w-3 h-3" />;
    case "void": return <Circle className="w-3 h-3" />;
    default: return null;
  }
};
export function ItemList({
  items,
  type,
  selectedTagFilter,
  selectedStatusFilter,
  onDeleteItem,
  onUpdateItem
}: ItemListProps) {
  const navigate = useNavigate();
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
    // Fire view: only fire items
    // Water view: only water items
    // Void view: only void items
    if (item.type !== type) return false;
    
    // Filter by status for fire items
    if (type === "fire" && selectedStatusFilter) {
      if (item.status !== selectedStatusFilter) return false;
    }
    
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

  const saveDeadline = (itemId: string, currentType: "fire" | "water" | "air" | "void" | "earth") => {
    if (editDeadline && editTime) {
      const [hours, minutes] = editTime.split(':').map(Number);
      const finalDeadline = set(editDeadline, { hours, minutes, seconds: 0, milliseconds: 0 });
      // Automatically set type to "fire" when adding a deadline
      const updates: any = { deadline: finalDeadline };
      if (currentType !== "fire") {
        updates.type = "fire";
      }
      onUpdateItem(itemId, updates);
    }
    setEditingDeadlineId(null);
  };

  const deleteDeadline = (item: Item) => {
    // Remove deadline
    onUpdateItem(item.id, { deadline: null });
  };

  const truncateNotes = (notes: string | undefined) => {
    if (!notes) return null;
    const lines = notes.split('\n');
    const firstTwoLines = lines.slice(0, 2).join('\n');
    return firstTwoLines;
  };
  return <div className="space-y-3">
      {filteredItems.length === 0 ? <div className="text-center py-12 text-muted-foreground">
          
        </div> : filteredItems.map(item => {
      const isOverdue = item.deadline && isPast(item.deadline);
      const hasFireTag = item.type === "fire";
      const isEditingThisDeadline = editingDeadlineId === item.id;
      
      return <Card 
        key={item.id} 
        className={cn(
          "p-4 transition-all duration-300 hover:shadow-lg cursor-pointer", 
          type === "fire" && "border-l-4 border-l-fire-primary", 
          type === "water" && "border-l-4 border-l-water-primary", 
          type === "air" && "border-l-4 border-l-air-primary", 
          type === "earth" && "border-l-4 border-l-earth-primary", 
          type === "void" && "border-l-4 border-l-void-primary", 
          isOverdue && "bg-fire-light/50"
        )}
        onClick={() => navigate(`/item/edit?id=${item.id}&type=${type}`)}
      >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Checkbox for fire items */}
                    {item.type === "fire" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateItem(item.id, { 
                            status: item.status === "Completed" ? "To Do" : "Completed" 
                          });
                        }}
                        className={cn(
                          "mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0",
                          item.status === "Completed" 
                            ? "bg-fire-primary border-fire-primary" 
                            : "border-muted-foreground hover:border-fire-primary"
                        )}
                      >
                        {item.status === "Completed" && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </button>
                    )}
                    
                    <div className="flex-1">
                      {/* Parent link */}
                      {item.parent && (
                        <div 
                          className="flex items-center gap-1 text-xs text-muted-foreground mb-1 cursor-pointer hover:text-foreground transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/item/edit?id=${item.parent!.id}&type=${item.parent!.type}`);
                          }}
                        >
                          <ArrowUp className="w-3 h-3" />
                          {getTypeIcon(item.parent.type)}
                          <span className="truncate">{item.parent.title}</span>
                        </div>
                      )}
                      
                      <p className={cn(
                        "text-base font-medium mb-2",
                        item.type === "fire" && item.status === "Completed" && "line-through text-muted-foreground"
                      )}>
                        {(item.type === "void" || item.type === "air") && item.url ? (
                          <a 
                            href={item.url}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              window.open(`/redirect?to=${encodeURIComponent(item.url!)}`, '_blank', 'noopener,noreferrer');
                            }}
                            className="text-blue-600 underline hover:text-blue-700 cursor-pointer"
                          >
                            {item.title}
                          </a>
                        ) : isUrl(item.title) ? (
                          <a 
                            href={item.title}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              window.open(`/redirect?to=${encodeURIComponent(item.title)}`,'_blank','noopener,noreferrer');
                            }}
                            className="flex items-center gap-2 text-primary hover:underline cursor-pointer"
                          >
                            {item.title}
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        ) : (
                          item.title
                        )}
                      </p>
                    
                    {/* Notes preview - first two lines */}
                    {item.notes && (
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {truncateNotes(item.notes)}
                      </p>
                    )}

                    {/* Children (backlinks) */}
                    {item.children && item.children.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {item.children.map((child) => (
                          <div
                            key={child.id}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/50 text-xs text-muted-foreground cursor-pointer hover:bg-muted hover:text-foreground transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/item/edit?id=${child.id}&type=${child.type}`);
                            }}
                          >
                            <ArrowDown className="w-3 h-3" />
                            {getTypeIcon(child.type)}
                            <span className="truncate max-w-[150px]">{child.title}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/item/edit?id=${item.id}&type=${type}`);
                        }}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="View details"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteItem(item.id);
                        }}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Delete item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Created date */}
                    <div className="text-xs text-muted-foreground">
                      {format(item.createdAt, "MMM d, yyyy")}
                    </div>
                    
                    {item.deadline && !isEditingThisDeadline && (
                      <div className="flex items-center gap-2">
                        <div className={cn("text-xs px-2 py-1 rounded-full flex items-center gap-1 whitespace-nowrap", isOverdue ? "bg-fire-dark text-white" : "bg-fire-light text-fire-dark")}>
                          <Flame className="w-3 h-3" />
                          {format(item.deadline, "MMM d, yyyy 'at' HH:mm")}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditingDeadline(item);
                          }}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteDeadline(item);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )}

                    {isEditingThisDeadline && (
                      <div className="flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
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
                          onClick={(e) => {
                            e.stopPropagation();
                            saveDeadline(item.id, item.type);
                          }}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingDeadlineId(null);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map(tag => <Badge key={tag.id} variant="outline" className="text-xs">
                      {tag.name}
                    </Badge>)}
                </div>
              </div>
            </Card>;
    })}
    </div>;
}
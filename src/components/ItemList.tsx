import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, Droplet, Circle, ExternalLink, Wind, Check, ArrowUp, ArrowDown, Mountain } from "lucide-react";
import { format, isPast } from "date-fns";
import { cn } from "@/lib/utils";
import { PriorityFireIcon } from "@/components/PriorityFireIcon";
import { PRIORITY_LEVELS } from "@/constants/priority";
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
  children?: Array<{ id: string; title: string; type: string; completed?: boolean }>;
  priority: number;
  completed: boolean;
}

interface ItemListProps {
  items: Item[];
  type: "fire" | "water" | "air" | "void" | "earth";
  selectedProjectTag?: string;
  selectedProjectChildTag?: string;
  selectedCategoryTags?: string[];
  selectedCategoryChildTags?: string[];
  selectedStatusFilter?: "To Do" | "Completed";
  onDeleteItem: (itemId: string) => void;
  onUpdateItem: (itemId: string, updates: { deadline?: Date | null; tags?: Tag[]; notes?: string; status?: string; url?: string; type?: "fire" | "water" | "air" | "void" | "earth"; parent_id?: string | null; priority?: number; completed?: boolean }) => void;
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
  selectedProjectTag,
  selectedProjectChildTag,
  selectedCategoryTags = [],
  selectedCategoryChildTags = [],
  selectedStatusFilter,
  onDeleteItem,
  onUpdateItem
}: ItemListProps) {
  const navigate = useNavigate();
  const [expandedChildren, setExpandedChildren] = useState<Set<string>>(new Set());

  const toggleChildren = (itemId: string) => {
    setExpandedChildren(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const filteredItems = items.filter(item => {
    // Fire view: only fire items
    // Water view: only water items
    // Void view: only void items
    if (item.type !== type) return false;

    // Filter by status for fire items
    if (type === "fire" && selectedStatusFilter) {
      if (item.status !== selectedStatusFilter) return false;
    }
    
    // Filter by project tag (exclusive - only one parent, only one child)
    if (selectedProjectTag) {
      const hasProjectTag = item.tags.some(tag => tag.id === selectedProjectTag);
      if (!hasProjectTag) return false;
    }
    
    if (selectedProjectChildTag) {
      const hasProjectChildTag = item.tags.some(tag => tag.id === selectedProjectChildTag);
      if (!hasProjectChildTag) return false;
    }
    
    // Filter by category tags (cumulative - item must have ALL selected category tags)
    if (selectedCategoryTags.length > 0) {
      const hasAllCategoryTags = selectedCategoryTags.every(filterId => 
        item.tags.some(tag => tag.id === filterId)
      );
      if (!hasAllCategoryTags) return false;
    }
    
    // Filter by category child tags (cumulative - item must have ALL selected child tags)
    if (selectedCategoryChildTags.length > 0) {
      const hasAllCategoryChildTags = selectedCategoryChildTags.every(filterId =>
        item.tags.some(tag => tag.id === filterId)
      );
      if (!hasAllCategoryChildTags) return false;
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
                {/* Title row with tags on the right */}
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
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className={cn(
                          "text-base font-medium flex-1",
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
                        
                        {/* Fire icon and tags on the right of title */}
                        <div className="flex items-start gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Cycle through priority levels: 1 → 2 → 3 → 4 → 5 → 1
                              const nextPriority = item.priority >= 5 ? 1 : item.priority + 1;
                              onUpdateItem(item.id, {
                                priority: nextPriority
                              });
                            }}
                            className="p-1 rounded hover:bg-accent transition-colors shrink-0"
                            title="Change priority"
                          >
                            <PriorityFireIcon priority={item.priority} />
                          </button>
                          {/* Hide tags for water type */}
                          {item.type !== "water" && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 justify-end">
                              {item.tags.map(tag => <Badge key={tag.id} variant="outline" className="text-xs">
                                  {tag.name}
                                </Badge>)}
                            </div>
                          )}
                        </div>
                      </div>
                    
                    {/* Notes preview - limited to two lines */}
                    {item.notes && (
                      <p className="text-sm text-muted-foreground whitespace-pre-line line-clamp-2">
                        {truncateNotes(item.notes)}
                      </p>
                    )}
                    </div>
                  </div>
                </div>
                
                {/* Footer: Children and Deadline (left) and Parent (right) */}
                <div className="flex items-center justify-between pt-2">
                  {/* Bottom left: Children and Deadline for fire/water items */}
                  <div className="flex flex-col items-start gap-1 ml-8">
                    {/* Deadline for fire and water items */}
                    {(item.type === "fire" || item.type === "water") && item.deadline && (
                      <div className={cn(
                        "text-xs px-2 py-1 rounded-full flex items-center gap-1 whitespace-nowrap",
                        item.type === "fire" && (isOverdue ? "bg-fire-dark text-white" : "bg-fire-light text-fire-dark"),
                        item.type === "water" && "bg-water-light text-water-dark"
                      )}>
                        {item.type === "fire" ? <Flame className="w-3 h-3" /> : <Droplet className="w-3 h-3" />}
                        {item.deadline.getHours() === 0 && item.deadline.getMinutes() === 0
                          ? format(item.deadline, "MMM d, yyyy")
                          : format(item.deadline, "MMM d, yyyy 'at' HH:mm")}
                      </div>
                    )}
                    
                    {/* Children */}
                    {item.children && item.children.length > 0 && (
                      <div className="flex items-center gap-2">
                        <div
                          className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/item/edit?id=${item.children![0].id}&type=${item.children![0].type}`);
                          }}
                        >
                          <ArrowDown className="w-3 h-3" />
                          {getTypeIcon(item.children[0].type)}
                          <span className="truncate">{item.children[0].title}</span>
                        </div>
                        
                        {item.children.length > 1 && (
                          <div className="relative" onClick={(e) => e.stopPropagation()}>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 hover:bg-accent"
                              onClick={() => toggleChildren(item.id)}
                            >
                              ...
                            </Button>
                            {expandedChildren.has(item.id) && (
                              <div className="absolute left-0 top-full mt-1 bg-popover border rounded-md shadow-lg p-2 space-y-1 min-w-[200px] z-10">
                                {item.children.slice(1).map((child) => (
                                  <div
                                    key={child.id}
                                    className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors p-1 hover:bg-accent rounded"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/item/edit?id=${child.id}&type=${child.type}`);
                                    }}
                                  >
                                    <ArrowDown className="w-3 h-3" />
                                    {getTypeIcon(child.type)}
                                    <span className="truncate">{child.title}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Bottom right: Parent link only */}
                  <div className="flex flex-col items-end gap-1">
                    {item.parent && (
                      <div 
                        className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
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
                  </div>
                </div>
              </div>
            </Card>;
    })}
    </div>;
}
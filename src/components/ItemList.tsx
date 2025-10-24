import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Flame, Droplet, Circle, ExternalLink, X, CalendarIcon, Clock, Edit2, Trash2 } from "lucide-react";
import { format, isPast, set } from "date-fns";
import { cn } from "@/lib/utils";
interface Tag {
  id: string;
  name: string;
}

interface Item {
  id: string;
  title: string;
  type: "fire" | "water" | "void";
  notes?: string;
  status?: string;
  tags: Tag[];
  createdAt: Date;
  deadline?: Date;
}

interface ItemListProps {
  items: Item[];
  type: "fire" | "water" | "void";
  selectedTagFilter?: string;
  onDeleteItem: (itemId: string) => void;
  onUpdateItem: (itemId: string, updates: { deadline?: Date | null; tags?: Tag[]; notes?: string; status?: string; type?: "fire" | "water" | "void" }) => void;
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
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState<string>("");
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<string>("");

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

  const saveDeadline = (itemId: string, currentType: "fire" | "water" | "void") => {
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

  const startEditingNotes = (item: Item) => {
    setEditingNotesId(item.id);
    setEditNotes(item.notes || "");
  };

  const saveNotes = (itemId: string) => {
    onUpdateItem(itemId, { notes: editNotes });
    setEditingNotesId(null);
  };

  const startEditingStatus = (item: Item) => {
    setEditingStatusId(item.id);
    setEditStatus(item.status || "");
  };

  const saveStatus = (itemId: string) => {
    onUpdateItem(itemId, { status: editStatus });
    setEditingStatusId(null);
  };
  return <div className="space-y-3">
      {filteredItems.length === 0 ? <div className="text-center py-12 text-muted-foreground">
          
        </div> : filteredItems.map(item => {
      const isOverdue = item.deadline && isPast(item.deadline);
      const hasFireTag = item.type === "fire";
      const isEditingThisDeadline = editingDeadlineId === item.id;
      const isEditingThisNotes = editingNotesId === item.id;
      const isEditingThisStatus = editingStatusId === item.id;
      
      return <Card key={item.id} className={cn("p-4 transition-all duration-300 hover:shadow-lg", type === "fire" && "border-l-4 border-l-fire-primary", type === "water" && "border-l-4 border-l-water-primary", type === "void" && "border-l-4 border-l-void-primary", isOverdue && "bg-fire-light/50")}>
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-base font-medium mb-2">
                      {isUrl(item.title) ? <a href={item.title} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                          {item.title}
                          <ExternalLink className="w-4 h-4" />
                        </a> : item.title}
                    </p>
                    
                    {/* Notes section */}
                    <div className="mb-2">
                      {isEditingThisNotes ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            className="flex-1 px-2 py-1 text-sm border rounded"
                            placeholder="Add notes..."
                          />
                          <Button size="sm" variant="default" className="h-7" onClick={() => saveNotes(item.id)}>
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7" onClick={() => setEditingNotesId(null)}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 group">
                          {item.notes ? (
                            <>
                              <p className="text-sm text-muted-foreground">{item.notes}</p>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => startEditingNotes(item)}
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 text-xs text-muted-foreground"
                              onClick={() => startEditingNotes(item)}
                            >
                              + Add notes
                            </Button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Status section */}
                    <div>
                      {isEditingThisStatus ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
                            className="flex-1 px-2 py-1 text-sm border rounded"
                            placeholder="Add status..."
                          />
                          <Button size="sm" variant="default" className="h-7" onClick={() => saveStatus(item.id)}>
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7" onClick={() => setEditingStatusId(null)}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 group">
                          {item.status ? (
                            <>
                              <p className="text-sm text-muted-foreground italic">{item.status}</p>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => startEditingStatus(item)}
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 text-xs text-muted-foreground"
                              onClick={() => startEditingStatus(item)}
                            >
                              + Add status
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Delete item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
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
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )}

                    {isEditingThisDeadline && (
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
                          onClick={() => saveDeadline(item.id, item.type)}
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
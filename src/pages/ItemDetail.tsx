import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Flame, Droplet, Circle, Plus, X, Clock, ArrowLeft, Wind, Mountain, Edit2, Link2, Eye, FileText, ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { format, set } from "date-fns";
import { cn } from "@/lib/utils";

interface Tag {
  id: string;
  name: string;
  parent_id?: string | null;
}

interface Item {
  id: string;
  title: string;
  type: "fire" | "water" | "air" | "void" | "earth";
  tags: Tag[];
  deadline?: Date;
  notes?: string;
  status?: string;
  url?: string;
  parent_id?: string;
}

interface ItemDetailProps {
  onAddItem: (
    title: string,
    type: "fire" | "water" | "air" | "void" | "earth",
    tags: Tag[],
    deadline?: Date,
    notes?: string,
    status?: string,
    url?: string,
    parent_id?: string
  ) => Promise<void>;
  existingTags: Tag[];
  existingItem?: Item | null;
  allItems: Item[];
}

export default function ItemDetail({ onAddItem, existingTags, existingItem, allItems }: ItemDetailProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTitle = existingItem?.title || searchParams.get("title") || "";
  const typeParam = searchParams.get("type") as "fire" | "water" | "air" | "void" | "earth" | null;

  const [title, setTitle] = useState(initialTitle);
  const [notes, setNotes] = useState(existingItem?.notes || "");
  const [status, setStatus] = useState(existingItem?.status || "");
  const [url, setUrl] = useState(existingItem?.url || "");
  const [itemType, setItemType] = useState<"fire" | "water" | "air" | "void" | "earth">(existingItem?.type || typeParam || "fire");
  const [selectedTags, setSelectedTags] = useState<Tag[]>(existingItem?.tags || []);
  const [deadline, setDeadline] = useState<Date | undefined>(existingItem?.deadline);
  const [selectedTime, setSelectedTime] = useState<string>("09:00");
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [isEditingTag, setIsEditingTag] = useState(false);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editTagName, setEditTagName] = useState("");
  const [selectedParent, setSelectedParent] = useState<{ id: string; title: string } | null>(null);
  const [parentSearchOpen, setParentSearchOpen] = useState(false);
  const [isMarkdownPreview, setIsMarkdownPreview] = useState(false);

  const timeOptions = Array.from({ length: 96 }, (_, i) => {
    const hours = Math.floor(i / 4);
    const minutes = (i % 4) * 15;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  });

  // Initialize parent selection from existing item
  useState(() => {
    if (existingItem?.parent_id) {
      const parent = allItems.find(item => item.id === existingItem.parent_id);
      if (parent) {
        setSelectedParent({ id: parent.id, title: parent.title });
      }
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      let finalDeadline = deadline;
      if (deadline && selectedTime) {
        const [hours, minutes] = selectedTime.split(':').map(Number);
        finalDeadline = set(deadline, { hours, minutes, seconds: 0, milliseconds: 0 });
      }

      await onAddItem(
        title,
        itemType,
        selectedTags,
        itemType === "fire" ? finalDeadline : undefined,
        notes.trim() || undefined,
        itemType === "fire" ? (status.trim() || "To Do") : undefined,
        (itemType === "void" || itemType === "air" || itemType === "earth") ? (url.trim() || undefined) : undefined,
        selectedParent?.id
      );
      // navigation handled in parent
    }
  };

  const addNewTag = () => {
    if (newTagName.trim()) {
      const newTag: Tag = {
        id: "temp-" + Date.now().toString(),
        name: newTagName,
      };
      setSelectedTags([...selectedTags, newTag]);
      setNewTagName("");
      setIsAddingTag(false);
    }
  };

  const addExistingTag = (tag: Tag) => {
    if (!selectedTags.find((t) => t.id === tag.id)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const removeTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter((t) => t.id !== tagId));
  };

  const startEditingTag = (tag: Tag) => {
    setEditingTagId(tag.id);
    setEditTagName(tag.name);
    setIsEditingTag(true);
  };

  const saveEditedTag = () => {
    if (editTagName.trim() && editingTagId) {
      setSelectedTags(selectedTags.map(t =>
        t.id === editingTagId ? { ...t, name: editTagName.trim() } : t
      ));
      setIsEditingTag(false);
      setEditingTagId(null);
      setEditTagName("");
    }
  };

  // Fire-specific tags
  const fireTagNames = ['Tourlab', 'Dirtwire', 'Touring', 'Disorder', 'Merch', 'Emma', 'Shane', 'Odin', 'Home', 'Finances', 'Dev'];

  // Filter tags based on item type
  const baseFilteredTags = itemType === "fire"
    ? existingTags.filter(tag => fireTagNames.includes(tag.name))
    : existingTags.filter(tag => !fireTagNames.includes(tag.name));

  // Separate parent and child tags
  const parentTags = baseFilteredTags.filter(tag => !tag.parent_id);
  const childTags = baseFilteredTags.filter(tag => tag.parent_id);

  // Get IDs of selected tags
  const selectedTagIds = selectedTags.map(t => t.id);

  // Find child tags available based on selected parent tags
  const availableChildTags = childTags.filter(tag =>
    tag.parent_id && selectedTagIds.includes(tag.parent_id)
  );

  // Check if any selected tags have children available
  const hasChildTagsAvailable = availableChildTags.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-8 md:px-12 lg:px-16 py-12">
        <div className="flex items-center justify-between mb-6">
          <Button
            type="submit"
            variant="ghost"
            className="font-medium"
            form="item-form"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Save
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
        </div>

        <form id="item-form" onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
          <div className="space-y-4">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title..."
              className="text-lg py-6 px-6 rounded-2xl border-2"
              autoFocus={!initialTitle}
            />

            {/* Row 1: Type | Status (for Fire) OR Type | Parent Item (for non-Fire) */}
            <div className="flex gap-4 items-start">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select value={itemType} onValueChange={(value: "fire" | "water" | "air" | "void" | "earth") => setItemType(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fire">
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-fire-primary" />
                        Fire (Actions)
                      </div>
                    </SelectItem>
                    <SelectItem value="water">
                      <div className="flex items-center gap-2">
                        <Droplet className="w-4 h-4 text-water-primary" />
                        Water (Writing)
                      </div>
                    </SelectItem>
                    <SelectItem value="earth">
                      <div className="flex items-center gap-2">
                        <Mountain className="w-4 h-4 text-earth-primary" />
                        Earth (How to)
                      </div>
                    </SelectItem>
                    <SelectItem value="air">
                      <div className="flex items-center gap-2">
                        <Wind className="w-4 h-4 text-air-primary" />
                        Air (Analysis)
                      </div>
                    </SelectItem>
                    <SelectItem value="void">
                      <div className="flex items-center gap-2">
                        <Circle className="w-4 h-4 text-black dark:text-white" />
                        Void (Web URLs)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {itemType === "fire" ? (
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Input
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    placeholder="To Do / Completed..."
                    className="text-base py-4 px-6 rounded-xl"
                  />
                </div>
              ) : (
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Link2 className="w-4 h-4" />
                    Parent Item (optional)
                  </label>
                  <Popover open={parentSearchOpen} onOpenChange={setParentSearchOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        className="w-full justify-start text-left font-normal h-[52px]"
                      >
                        <Link2 className="w-4 h-4 mr-2 shrink-0" />
                        {selectedParent ? (
                          <span className="truncate">{selectedParent.title}</span>
                        ) : (
                          <span className="text-muted-foreground">Select parent item...</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search items..." />
                        <CommandList>
                          <CommandEmpty>No items found</CommandEmpty>
                          <CommandGroup>
                            {selectedParent && (
                              <CommandItem
                                onSelect={() => {
                                  setSelectedParent(null);
                                  setParentSearchOpen(false);
                                }}
                              >
                                <X className="w-4 h-4 mr-2" />
                                <span>No parent</span>
                              </CommandItem>
                            )}
                            {allItems
                              .filter(item => item.id !== existingItem?.id) // Can't be own parent
                              .map((item) => (
                                <CommandItem
                                  key={item.id}
                                  onSelect={() => {
                                    setSelectedParent({ id: item.id, title: item.title });
                                    setParentSearchOpen(false);
                                  }}
                                >
                                  {item.type === "fire" && <Flame className="w-4 h-4 mr-2 text-fire-primary" />}
                                  {item.type === "water" && <Droplet className="w-4 h-4 mr-2 text-water-primary" />}
                                  {item.type === "air" && <Wind className="w-4 h-4 mr-2 text-air-primary" />}
                                  {item.type === "earth" && <Mountain className="w-4 h-4 mr-2 text-earth-primary" />}
                                  {item.type === "void" && <Circle className="w-4 h-4 mr-2 text-void-primary" />}
                                  <span className="truncate">{item.title}</span>
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>

            {/* Row 2: Parent Item | Deadline (for Fire) */}
            {itemType === "fire" && (
              <div className="flex gap-4 items-start">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Link2 className="w-4 h-4" />
                    Parent Item (optional)
                  </label>
                  <Popover open={parentSearchOpen} onOpenChange={setParentSearchOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        className="w-full justify-start text-left font-normal h-[52px]"
                      >
                        <Link2 className="w-4 h-4 mr-2 shrink-0" />
                        {selectedParent ? (
                          <span className="truncate">{selectedParent.title}</span>
                        ) : (
                          <span className="text-muted-foreground">Select parent item...</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search items..." />
                        <CommandList>
                          <CommandEmpty>No items found</CommandEmpty>
                          <CommandGroup>
                            {selectedParent && (
                              <CommandItem
                                onSelect={() => {
                                  setSelectedParent(null);
                                  setParentSearchOpen(false);
                                }}
                              >
                                <X className="w-4 h-4 mr-2" />
                                <span>No parent</span>
                              </CommandItem>
                            )}
                            {allItems
                              .filter(item => item.id !== existingItem?.id) // Can't be own parent
                              .map((item) => (
                                <CommandItem
                                  key={item.id}
                                  onSelect={() => {
                                    setSelectedParent({ id: item.id, title: item.title });
                                    setParentSearchOpen(false);
                                  }}
                                >
                                  {item.type === "fire" && <Flame className="w-4 h-4 mr-2 text-fire-primary" />}
                                  {item.type === "water" && <Droplet className="w-4 h-4 mr-2 text-water-primary" />}
                                  {item.type === "air" && <Wind className="w-4 h-4 mr-2 text-air-primary" />}
                                  {item.type === "earth" && <Mountain className="w-4 h-4 mr-2 text-earth-primary" />}
                                  {item.type === "void" && <Circle className="w-4 h-4 mr-2 text-void-primary" />}
                                  <span className="truncate">{item.title}</span>
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Deadline</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-full justify-start h-[52px]",
                          deadline && "bg-fire-light text-fire-dark border-fire-secondary"
                        )}
                      >
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {deadline ? format(deadline, "MMM d, yyyy") : "Set Deadline"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={deadline}
                        onSelect={setDeadline}
                        initialFocus
                      />
                      {deadline && (
                        <div className="p-3 border-t">
                          <label className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Time
                          </label>
                          <Select value={selectedTime} onValueChange={setSelectedTime}>
                            <SelectTrigger className="w-full">
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
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}

            {(itemType === "void" || itemType === "air" || itemType === "earth") && (
              <div>
                <label className="text-sm font-medium mb-2 block">URL</label>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={itemType === "void" ? "Add URL..." : "Add URL (optional)..."}
                  className="text-base py-4 px-6 rounded-xl"
                  type="url"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">Tags</label>
              <div className="flex flex-wrap gap-2 items-center">
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag.id}
                    className="px-3 py-1 rounded-full flex items-center gap-1"
                  >
                    <span>{tag.name}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag.id)}
                      className="ml-1 hover:opacity-70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}

                {!isAddingTag && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-full border-dashed"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Tag
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search tags..." />
                        <CommandList>
                          {itemType !== "fire" && (
                            <CommandGroup>
                              <CommandItem onSelect={() => setIsAddingTag(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                <span>Create new tag</span>
                              </CommandItem>
                              <CommandItem onSelect={() => navigate("/tags")}>
                                <Edit2 className="w-4 h-4 mr-2" />
                                <span>Edit tags</span>
                              </CommandItem>
                            </CommandGroup>
                          )}
                          <CommandEmpty>No tags found</CommandEmpty>
                          <CommandGroup heading={itemType === "fire" ? "Fire Tags" : "Tags"}>
                            {parentTags.map((tag) => (
                              <CommandItem key={tag.id} onSelect={() => addExistingTag(tag)}>
                                <span>{tag.name}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                          {hasChildTagsAvailable && (
                            <CommandGroup heading="Child Tags">
                              {availableChildTags.map((tag) => (
                                <CommandItem key={tag.id} onSelect={() => addExistingTag(tag)}>
                                  <ChevronRight className="w-4 h-4 mr-2" />
                                  <span>{tag.name}</span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}

                {isAddingTag && (
                  <div className="flex items-center gap-2 p-2 border rounded-lg bg-card">
                    <Input
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      placeholder="Tag name"
                      className="flex-1"
                      autoFocus
                    />
                    <Button type="button" size="sm" onClick={addNewTag}>
                      <Plus className="w-3 h-3" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setIsAddingTag(false);
                        setNewTagName("");
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}

                {isEditingTag && !editingTagId && (
                  <Popover open={isEditingTag} onOpenChange={setIsEditingTag}>
                    <PopoverContent className="w-80 p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search tags to edit..." />
                        <CommandList>
                          <CommandEmpty>No tags found</CommandEmpty>
                          <CommandGroup heading="Select Tag to Edit">
                            {parentTags.map((tag) => (
                              <CommandItem key={tag.id} onSelect={() => startEditingTag(tag)}>
                                <span>{tag.name}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}

                {isEditingTag && editingTagId && (
                  <div className="flex items-center gap-2 p-2 border rounded-lg bg-card">
                    <Input
                      value={editTagName}
                      onChange={(e) => setEditTagName(e.target.value)}
                      placeholder="Edit tag name"
                      className="flex-1"
                      autoFocus
                    />
                    <Button type="button" size="sm" onClick={saveEditedTag}>
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setIsEditingTag(false);
                        setEditingTagId(null);
                        setEditTagName("");
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Notes</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMarkdownPreview(!isMarkdownPreview)}
                  className="gap-2"
                >
                  {isMarkdownPreview ? (
                    <>
                      <FileText className="w-4 h-4" />
                      Edit
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      Preview
                    </>
                  )}
                </Button>
              </div>
              {isMarkdownPreview ? (
                <div className="min-h-[300px] text-base py-4 px-6 rounded-xl border bg-background prose prose-sm max-w-none dark:prose-invert">
                  {notes ? (
                    <ReactMarkdown>{notes}</ReactMarkdown>
                  ) : (
                    <p className="text-muted-foreground italic">No notes to preview</p>
                  )}
                </div>
              ) : (
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes..."
                  className="min-h-[300px] text-base py-4 px-6 rounded-xl resize-none"
                />
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

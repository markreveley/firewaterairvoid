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
import { CalendarIcon, Flame, Droplet, Circle, Plus, X, Clock, ArrowLeft, Wind, Mountain } from "lucide-react";
import { format, set } from "date-fns";
import { cn } from "@/lib/utils";

interface Tag {
  id: string;
  name: string;
}

interface ItemDetailProps {
  onAddItem: (title: string, type: "fire" | "water" | "air" | "void" | "earth", tags: Tag[], deadline?: Date, notes?: string, status?: string, url?: string) => void;
  existingTags: Tag[];
  existingItem?: {
    id: string;
    title: string;
    type: "fire" | "water" | "air" | "void" | "earth";
    tags: Tag[];
    deadline?: Date;
    notes?: string;
    status?: string;
    url?: string;
  } | null;
}

export default function ItemDetail({ onAddItem, existingTags, existingItem }: ItemDetailProps) {
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

  const timeOptions = Array.from({ length: 96 }, (_, i) => {
    const hours = Math.floor(i / 4);
    const minutes = (i % 4) * 15;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
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
        itemType === "void" ? (url.trim() || undefined) : undefined
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

            <div>
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
                  <SelectItem value="earth">
                    <div className="flex items-center gap-2">
                      <Mountain className="w-4 h-4 text-earth-primary" />
                      Earth (How to)
                    </div>
                  </SelectItem>
                  <SelectItem value="water">
                    <div className="flex items-center gap-2">
                      <Droplet className="w-4 h-4 text-water-primary" />
                      Water (Writing)
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

            {itemType === "fire" && (
              <Input
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                placeholder="Add status (optional)..."
                className="text-base py-4 px-6 rounded-xl"
              />
            )}

            {itemType === "void" && (
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Add URL..."
                className="text-base py-4 px-6 rounded-xl"
                type="url"
              />
            )}

            {itemType === "fire" && (
              <div>
                <label className="text-sm font-medium mb-2 block">Deadline</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start",
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
                          <CommandGroup>
                            <CommandItem onSelect={() => setIsAddingTag(true)}>
                              <Plus className="w-4 h-4 mr-2" />
                              <span>Create new tag</span>
                            </CommandItem>
                          </CommandGroup>
                          <CommandEmpty>No tags found</CommandEmpty>
                          <CommandGroup heading="Existing Tags">
                            {existingTags.map((tag) => (
                              <CommandItem key={tag.id} onSelect={() => addExistingTag(tag)}>
                                <span>{tag.name}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
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
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Notes</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes..."
                className="min-h-[300px] text-base py-4 px-6 rounded-xl resize-none"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

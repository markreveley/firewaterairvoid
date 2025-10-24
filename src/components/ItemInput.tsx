import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Flame, Droplet, Circle, Plus, X, Clock } from "lucide-react";
import { format, set } from "date-fns";
import { cn } from "@/lib/utils";
// Force rebuild

interface Tag {
  id: string;
  name: string;
  type: "fire" | "water" | "void";
}

interface ItemInputProps {
  onAddItem: (title: string, tags: Tag[], deadline?: Date, notes?: string, status?: string) => void;
  existingTags: Tag[];
}

export function ItemInput({ onAddItem, existingTags }: ItemInputProps) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [deadline, setDeadline] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("09:00");
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagType, setNewTagType] = useState<"fire" | "water" | "void">("void");

  // Generate time options in 15-minute intervals
  const timeOptions = Array.from({ length: 96 }, (_, i) => {
    const hours = Math.floor(i / 4);
    const minutes = (i % 4) * 15;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      let tagsToAdd = [...selectedTags];
      
      // If deadline is set, ensure there's a fire tag
      if (deadline) {
        const hasFireTag = tagsToAdd.some(tag => tag.type === "fire");
        if (!hasFireTag) {
          tagsToAdd.push({
            id: "temp-fire-" + Date.now(),
            name: "Urgent",
            type: "fire" as const
          });
        }
      }

      let finalDeadline = deadline;
      if (deadline && selectedTime) {
        const [hours, minutes] = selectedTime.split(':').map(Number);
        finalDeadline = set(deadline, { hours, minutes, seconds: 0, milliseconds: 0 });
      }
      await onAddItem(
        title, 
        tagsToAdd, 
        finalDeadline,
        notes.trim() || undefined,
        status.trim() || undefined
      );
      setTitle("");
      setNotes("");
      setStatus("");
      setSelectedTags([]);
      setDeadline(undefined);
      setSelectedTime("09:00");
    }
  };

  const addNewTag = () => {
    if (newTagName.trim()) {
      const newTag: Tag = {
        id: Date.now().toString(),
        name: newTagName,
        type: newTagType,
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
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto space-y-4">
      <div className="space-y-3">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a title..."
          className="text-lg py-6 px-6 rounded-2xl border-2 transition-all duration-300 focus:scale-[1.02]"
        />
        <Input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes (optional)..."
          className="text-base py-4 px-6 rounded-xl"
        />
        <Input
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          placeholder="Add status (optional)..."
          className="text-base py-4 px-6 rounded-xl"
        />
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {selectedTags.map((tag) => (
          <Badge
            key={tag.id}
            className={cn(
              "px-3 py-1 rounded-full flex items-center gap-1",
              tag.type === "fire"
                ? "bg-fire-light text-fire-dark border-fire-secondary"
                : tag.type === "water"
                ? "bg-water-light text-water-dark border-water-secondary"
                : "bg-void-light text-void-dark border-void-secondary"
            )}
          >
            {tag.type === "fire" ? <Flame className="w-3 h-3" /> : tag.type === "water" ? <Droplet className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
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

        {/* Deadline Input */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={cn(
                "rounded-full",
                deadline && "bg-fire-light text-fire-dark border-fire-secondary"
              )}
            >
              <CalendarIcon className="w-3 h-3 mr-1" />
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
                  <CommandEmpty>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => {
                        setIsAddingTag(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create new tag
                    </Button>
                  </CommandEmpty>
                  <CommandGroup heading="Fire Tags">
                    {existingTags
                      .filter((t) => t.type === "fire")
                      .map((tag) => (
                        <CommandItem key={tag.id} onSelect={() => addExistingTag(tag)}>
                          <Flame className="w-4 h-4 mr-2 text-fire-primary" />
                          <span>{tag.name}</span>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                  <CommandGroup heading="Water Tags">
                    {existingTags
                      .filter((t) => t.type === "water")
                      .map((tag) => (
                        <CommandItem key={tag.id} onSelect={() => addExistingTag(tag)}>
                          <Droplet className="w-4 h-4 mr-2 text-water-primary" />
                          <span>{tag.name}</span>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                  <CommandGroup heading="Void Tags">
                    {existingTags
                      .filter((t) => t.type === "void")
                      .map((tag) => (
                        <CommandItem key={tag.id} onSelect={() => addExistingTag(tag)}>
                          <Circle className="w-4 h-4 mr-2 text-void-primary" />
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
              className="w-32"
              autoFocus
            />
            <div className="flex gap-1">
              <Button
                type="button"
                size="sm"
                variant={newTagType === "fire" ? "default" : "outline"}
                onClick={() => setNewTagType("fire")}
                className={cn(
                  newTagType === "fire" && "bg-fire-primary hover:bg-fire-dark"
                )}
              >
                <Flame className="w-3 h-3" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant={newTagType === "water" ? "default" : "outline"}
                onClick={() => setNewTagType("water")}
                className={cn(
                  newTagType === "water" && "bg-water-primary hover:bg-water-dark"
                )}
              >
                <Droplet className="w-3 h-3" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant={newTagType === "void" ? "default" : "outline"}
                onClick={() => setNewTagType("void")}
                className={cn(
                  newTagType === "void" && "bg-void-primary hover:bg-void-dark"
                )}
              >
                <Circle className="w-3 h-3" />
              </Button>
            </div>
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

      <Button
        type="submit"
        className="w-full rounded-xl py-6 text-base transition-all duration-300 hover:scale-[1.02]"
      >
        Add Item
      </Button>
    </form>
  );
}

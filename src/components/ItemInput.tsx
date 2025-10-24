import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
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
      await onAddItem(title, tagsToAdd, finalDeadline, undefined, undefined);
      setTitle("");
      setSelectedTags([]);
      setDeadline(undefined);
      setSelectedTime("09:00");
    }
  };

  const handleMoreDetails = () => {
    navigate(`/item/new?title=${encodeURIComponent(title)}`);
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
    <form onSubmit={handleSubmit} className="w-full max-w-5xl mx-auto">
      <div className="flex items-center gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter an item..."
          className="flex-1 text-lg py-6 px-6 rounded-2xl border-2"
        />

        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className={cn(
                "rounded-full shrink-0",
                deadline && "bg-fire-light text-fire-dark border-fire-secondary"
              )}
            >
              <CalendarIcon className="w-4 h-4" />
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

        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full shrink-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <Command>
              <CommandInput placeholder="Search tags..." />
              <CommandList>
                <CommandEmpty>No tags found.</CommandEmpty>
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

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="rounded-full shrink-0"
          onClick={handleMoreDetails}
        >
          <Plus className="w-4 h-4" />
        </Button>

        <Button
          type="submit"
          className="rounded-xl px-8 py-6 text-base shrink-0"
        >
          Add Item
        </Button>
      </div>
    </form>
  );
}

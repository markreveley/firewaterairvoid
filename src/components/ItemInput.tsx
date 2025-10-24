import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Flame, Droplet, Circle, Plus, X, Clock, MoreHorizontal } from "lucide-react";
import { format, set } from "date-fns";
import { cn } from "@/lib/utils";

interface Tag {
  id: string;
  name: string;
}

interface ItemInputProps {
  onAddItem: (title: string, type: "fire" | "water" | "void", tags: Tag[], deadline?: Date, notes?: string, status?: string) => void;
  existingTags: Tag[];
}

export function ItemInput({ onAddItem, existingTags }: ItemInputProps) {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [selectedType, setSelectedType] = useState<"fire" | "water" | "void">("void");
  const [deadline, setDeadline] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("09:00");

  // Generate time options in 15-minute intervals
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
      await onAddItem(title, selectedType, selectedTags, finalDeadline, undefined, undefined);
      setTitle("");
      setSelectedTags([]);
      setSelectedType("void");
      setDeadline(undefined);
      setSelectedTime("09:00");
    }
  };

  const handleMoreDetails = () => {
    navigate(`/item/new?title=${encodeURIComponent(title)}`);
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
    <form onSubmit={handleSubmit} className="w-full max-w-5xl mx-auto space-y-3">
      <div className="flex items-center gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter an item..."
          className="flex-1 text-lg py-6 px-6 rounded-2xl border-2"
        />

        <Button
          type="submit"
          variant="white"
          className="rounded-xl px-8 py-6 text-base shrink-0"
        >
          Add Item
        </Button>
      </div>

      <div className="flex items-center gap-2 px-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className={cn(
                "rounded-full shrink-0",
                selectedType === "fire" && "bg-fire-light text-fire-dark border-fire-secondary",
                selectedType === "water" && "bg-water-light text-water-dark border-water-secondary",
                selectedType === "void" && "bg-void-light text-void-dark border-void-secondary"
              )}
            >
              {selectedType === "fire" && <Flame className="w-4 h-4" />}
              {selectedType === "water" && <Droplet className="w-4 h-4" />}
              {selectedType === "void" && <Circle className="w-4 h-4" />}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="start">
            <div className="space-y-1">
              <Button
                type="button"
                variant={selectedType === "fire" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setSelectedType("fire")}
              >
                <Flame className="w-4 h-4 mr-2" />
                Fire
              </Button>
              <Button
                type="button"
                variant={selectedType === "water" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setSelectedType("water")}
              >
                <Droplet className="w-4 h-4 mr-2" />
                Water
              </Button>
              <Button
                type="button"
                variant={selectedType === "void" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setSelectedType("void")}
              >
                <Circle className="w-4 h-4 mr-2" />
                Void
              </Button>
            </div>
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
                <CommandGroup heading="Tags">
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

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="rounded-full shrink-0"
          onClick={handleMoreDetails}
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>

      {selectedType === "fire" && (
        <div className="flex items-start gap-2 px-2">
          <div className="flex-1 max-w-md">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !deadline && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deadline ? format(deadline, "PPP 'at' HH:mm") : <span>Set deadline</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={setDeadline}
                  initialFocus
                  className="pointer-events-auto"
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
    </form>
  );
}

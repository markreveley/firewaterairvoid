import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { CalendarIcon, Flame, Droplet, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Tag {
  id: string;
  name: string;
  type: "fire" | "water";
  deadline?: Date;
}

interface ItemInputProps {
  onAddItem: (content: string, tags: Tag[]) => void;
  existingTags: Tag[];
}

export function ItemInput({ onAddItem, existingTags }: ItemInputProps) {
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagType, setNewTagType] = useState<"fire" | "water">("water");
  const [newTagDeadline, setNewTagDeadline] = useState<Date>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onAddItem(content, selectedTags);
      setContent("");
      setSelectedTags([]);
    }
  };

  const addNewTag = () => {
    if (newTagName.trim()) {
      const newTag: Tag = {
        id: Date.now().toString(),
        name: newTagName,
        type: newTagType,
        deadline: newTagType === "fire" ? newTagDeadline : undefined,
      };
      setSelectedTags([...selectedTags, newTag]);
      setNewTagName("");
      setNewTagDeadline(undefined);
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
      <div className="relative">
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter anything - a todo, idea, url, or resource..."
          className="text-lg py-6 px-6 rounded-2xl border-2 transition-all duration-300 focus:scale-[1.02]"
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
                : "bg-water-light text-water-dark border-water-secondary"
            )}
          >
            {tag.type === "fire" ? <Flame className="w-3 h-3" /> : <Droplet className="w-3 h-3" />}
            <span>{tag.name}</span>
            {tag.deadline && (
              <span className="text-xs opacity-75">({format(tag.deadline, "MMM d")})</span>
            )}
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
                          {tag.deadline && (
                            <span className="ml-auto text-xs text-muted-foreground">
                              {format(tag.deadline, "MMM d")}
                            </span>
                          )}
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
            </div>
            {newTagType === "fire" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <CalendarIcon className="w-3 h-3 mr-1" />
                    {newTagDeadline ? format(newTagDeadline, "MMM d") : "Deadline"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newTagDeadline}
                    onSelect={setNewTagDeadline}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
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
                setNewTagDeadline(undefined);
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

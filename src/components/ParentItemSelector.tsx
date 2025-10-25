import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Link2, X, Flame, Droplet, Wind, Mountain, Circle } from "lucide-react";
import type { Item } from "@/types";

interface ParentItemSelectorProps {
  selectedParent: { id: string; title: string } | null;
  onSelectParent: (parent: { id: string; title: string } | null) => void;
  allItems: Item[];
  currentItemId?: string;
  className?: string;
}

export function ParentItemSelector({
  selectedParent,
  onSelectParent,
  allItems,
  currentItemId,
  className
}: ParentItemSelectorProps) {
  const [parentSearchOpen, setParentSearchOpen] = useState(false);

  return (
    <div className={className}>
      <label className="text-sm font-medium mb-2 flex items-center gap-2">
        <Link2 className="w-4 h-4" />
        Parent Item (optional)
      </label>
      <div className="flex gap-2">
        {selectedParent && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-[52px] w-[52px] shrink-0"
            onClick={() => onSelectParent(null)}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
        <Popover open={parentSearchOpen} onOpenChange={setParentSearchOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              className="flex-1 justify-start text-left font-normal h-[52px]"
            >
              <Link2 className="w-4 h-4 mr-2 shrink-0" />
              {selectedParent ? (
                <span className="truncate">
                  {selectedParent.title.length > 30
                    ? selectedParent.title.substring(0, 30) + "..."
                    : selectedParent.title}
                </span>
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
                        onSelectParent(null);
                        setParentSearchOpen(false);
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      <span>No parent</span>
                    </CommandItem>
                  )}
                  {allItems
                    .filter(item => item.id !== currentItemId) // Can't be own parent
                    .map((item) => (
                      <CommandItem
                        key={item.id}
                        onSelect={() => {
                          onSelectParent({ id: item.id, title: item.title });
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
    </div>
  );
}

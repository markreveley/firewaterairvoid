import { useEffect, useState } from "react";
import { ItemList } from "@/components/ItemList";
import { OverviewList } from "@/components/OverviewList";
import { FireWaterToggle } from "@/components/FireWaterToggle";
import { TagFilter } from "@/components/TagFilter";
import { StatusFilter } from "@/components/StatusFilter";
import { useItems } from "@/hooks/useItems";
import { useTags } from "@/hooks/useTags";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Plus, Search, User } from "lucide-react";
import fireWaterLogo from "@/assets/firewater_logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ItemType, Tag } from "@/types";
import { getTagsForItemType } from "@/utils/tagFilters";
import { FIRE_TAG_NAMES } from "@/constants/tags";

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialType = (searchParams.get("type") as ItemType) || "fire";
  const [activeType, setActiveType] = useState<ItemType>(initialType);
  const [viewMode, setViewMode] = useState<"card" | "overview">("card");
  const [searchQuery, setSearchQuery] = useState("");
  const pageSize = viewMode === "overview" ? 200 : 10;
  const { items, isLoading, hasMore, addItem, deleteItem, updateItem, loadMore } = useItems(activeType, pageSize);
  const [selectedTagFilters, setSelectedTagFilters] = useState<string[]>([]);
  const [selectedChildTagFilters, setSelectedChildTagFilters] = useState<string[]>([]);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<"To Do" | "Completed">("To Do");
  const { allTags } = useTags();

  const handleAddItem = async (title: string, type: ItemType, tags: Tag[], deadline?: Date, notes?: string, status?: string, url?: string) => {
    // Default status to "To Do" for fire items if not provided
    const finalStatus = type === "fire" && !status ? "To Do" : status;
    await addItem(title, type, tags, deadline, notes, finalStatus, url);
    // Switch to the type of the newly created item
    if (type !== activeType) {
      setActiveType(type);
    }
  };

  useEffect(() => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set("type", activeType);
      if (selectedTagFilters.length > 0) p.set("tags", selectedTagFilters.join(","));
      else p.delete("tags");
      if (selectedChildTagFilters.length > 0) p.set("childTags", selectedChildTagFilters.join(","));
      else p.delete("childTags");
      return p;
    });
  }, [activeType, selectedTagFilters, selectedChildTagFilters, setSearchParams]);

  // Clear tag filters when switching types if selected tags don't exist in new type
  useEffect(() => {
    if (selectedTagFilters.length > 0 && allTags.length > 0) {
      const { projectTags, categoryTags } = getTagsForItemType(allTags, activeType);
      const currentFilteredTags = [...projectTags, ...categoryTags];
      const validTagIds = currentFilteredTags.map(tag => tag.id);

      const validSelectedTags = selectedTagFilters.filter(id => validTagIds.includes(id));
      if (validSelectedTags.length !== selectedTagFilters.length) {
        setSelectedTagFilters(validSelectedTags);
        setSelectedChildTagFilters([]);
      }
    }
  }, [activeType, allTags, selectedTagFilters]);

  // Get filtered tags for current type
  const { projectTags, categoryTags } = getTagsForItemType(allTags, activeType);
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-8 md:px-12 lg:px-16 py-4 flex items-center justify-between">
          <img src={fireWaterLogo} alt="Fire Water" className="h-12 w-auto" />
          <FireWaterToggle activeType={activeType} onToggle={setActiveType} />
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-8 md:px-12 lg:px-16 pt-4 pb-12 space-y-8">
        <div className="py-2">
          <TagFilter
            projectTags={projectTags}
            categoryTags={categoryTags}
            allTags={allTags}
            type={activeType}
            selectedTags={selectedTagFilters}
            selectedChildTags={selectedChildTagFilters}
            onSelectTags={setSelectedTagFilters}
            onSelectChildTags={setSelectedChildTagFilters}
          />
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* New Item Button and View Mode Toggle */}
          <div className="flex items-center justify-between gap-4">
            {/* New Item Button - Left */}
            <Button
              onClick={() => navigate(`/item/new?type=${activeType}`)}
              variant="white"
              size="sm"
              className="rounded-full w-9 h-9 p-0"
            >
              <Plus className="w-5 h-5" />
            </Button>

            <div className="flex items-center gap-4">
              {viewMode === "overview" && (
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              )}

              {activeType === "fire" && (
                <StatusFilter
                  selectedStatus={selectedStatusFilter}
                  onSelectStatus={setSelectedStatusFilter}
                />
              )}

              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "card" | "overview")}>
                <TabsList>
                  <TabsTrigger value="card">Card</TabsTrigger>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {isLoading && items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : (
            <>
              {viewMode === "card" ? (
                <>
                  <ItemList
                    items={items}
                    type={activeType}
                    selectedTagFilters={selectedTagFilters}
                    selectedChildTagFilters={selectedChildTagFilters}
                    selectedStatusFilter={activeType === "fire" ? selectedStatusFilter : undefined}
                    onDeleteItem={deleteItem}
                    onUpdateItem={updateItem}
                  />

                  {items.length > 0 && (
                    <div className="text-center py-4 space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Showing {items.length} {items.length === 1 ? 'item' : 'items'}
                      </p>

                      {hasMore && (
                        <Button
                          onClick={loadMore}
                          disabled={isLoading}
                          variant="outline"
                          className="min-w-[200px]"
                        >
                          {isLoading ? 'Loading...' : 'Load More'}
                        </Button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <OverviewList items={items} searchQuery={searchQuery} />

                  {items.length > 0 && !searchQuery && (
                    <div className="text-center py-4 space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Showing {items.length} {items.length === 1 ? 'item' : 'items'}
                      </p>

                      {hasMore && (
                        <Button
                          onClick={loadMore}
                          disabled={isLoading}
                          variant="outline"
                          className="min-w-[200px]"
                        >
                          {isLoading ? 'Loading...' : 'Load More'}
                        </Button>
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;

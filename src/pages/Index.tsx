import { useEffect, useState } from "react";
import { ItemList } from "@/components/ItemList";
import { OverviewList } from "@/components/OverviewList";
import { WaterCalendar } from "@/components/WaterCalendar";
import { FireWaterToggle } from "@/components/FireWaterToggle";
import { TagFilter } from "@/components/TagFilter";
import { StatusFilter } from "@/components/StatusFilter";
import { ThemeToggle } from "@/components/theme-toggle";
import { useItems } from "@/hooks/useItems";
import { useTags } from "@/hooks/useTags";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Plus, Search, User, Loader2, Edit2 } from "lucide-react";
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
  const initialView = (searchParams.get("view") as "card" | "calendar" | "overview") || (initialType === "water" ? "calendar" : "card");
  const [activeType, setActiveType] = useState<ItemType>(initialType);
  const [viewMode, setViewMode] = useState<"card" | "calendar" | "overview">(initialView);
  const [searchQuery, setSearchQuery] = useState("");
  const pageSize = viewMode === "overview" ? 200 : 50;
  const { items, isLoading, hasMore, isBulkDeleting, addItem, deleteItem, bulkDeleteItems, updateItem, loadMore } = useItems(activeType, pageSize);
  // Also fetch fire items for water calendar view to show todos
  const { items: fireItems } = useItems(activeType === "water" && viewMode === "calendar" ? "fire" : undefined, 200);
  const [selectedProjectTag, setSelectedProjectTag] = useState<string>();
  const [selectedProjectChildTag, setSelectedProjectChildTag] = useState<string>();
  const [selectedCategoryTags, setSelectedCategoryTags] = useState<string[]>([]);
  const [selectedCategoryChildTags, setSelectedCategoryChildTags] = useState<string[]>([]);
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
      p.set("view", viewMode);
      if (selectedProjectTag) p.set("projectTag", selectedProjectTag);
      else p.delete("projectTag");
      if (selectedProjectChildTag) p.set("projectChildTag", selectedProjectChildTag);
      else p.delete("projectChildTag");
      if (selectedCategoryTags.length > 0) p.set("categoryTags", selectedCategoryTags.join(","));
      else p.delete("categoryTags");
      if (selectedCategoryChildTags.length > 0) p.set("categoryChildTags", selectedCategoryChildTags.join(","));
      else p.delete("categoryChildTags");
      return p;
    });
  }, [activeType, viewMode, selectedProjectTag, selectedProjectChildTag, selectedCategoryTags, selectedCategoryChildTags, setSearchParams]);

  // Water always shows calendar view; other types show card/overview
  useEffect(() => {
    if (activeType === "water" && viewMode !== "calendar") {
      setViewMode("calendar");
    } else if (viewMode === "calendar" && activeType !== "water") {
      setViewMode("card");
    }
  }, [activeType, viewMode]);

  // Clear tag filters when switching types if selected tags don't exist in new type
  useEffect(() => {
    if (allTags.length > 0) {
      const tagsForType = getTagsForItemType(allTags, activeType);

      // Check if currently selected tags exist in the new type
      const validTagIds = tagsForType.map(tag => tag.id);
      if (selectedProjectTag && !validTagIds.includes(selectedProjectTag)) {
        setSelectedProjectTag(undefined);
        setSelectedProjectChildTag(undefined);
      }

      // Check category tags
      const validSelectedCategoryTags = selectedCategoryTags.filter(id => validTagIds.includes(id));
      if (validSelectedCategoryTags.length !== selectedCategoryTags.length) {
        setSelectedCategoryTags(validSelectedCategoryTags);
        setSelectedCategoryChildTags([]);
      }
    }
  }, [activeType, allTags, selectedProjectTag, selectedCategoryTags]);

  // Get filtered tags for current type
  // Fire uses the "project tag" selection model (single selection)
  // Earth/Air/Void use the "category tag" selection model (multiple selection)
  const tagsForCurrentType = getTagsForItemType(allTags, activeType);
  const projectTags = activeType === "fire" ? tagsForCurrentType : [];
  const categoryTags = activeType !== "fire" && activeType !== "water" ? tagsForCurrentType : [];
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-8 md:px-12 lg:px-16 py-4 flex items-center justify-between">
          <img src={fireWaterLogo} alt="Fire Water" className="h-12 w-auto dark:invert" />
          <FireWaterToggle activeType={activeType} onToggle={setActiveType} />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className={viewMode === "calendar" ? "" : "container mx-auto px-8 md:px-12 lg:px-16 pt-4 pb-12 space-y-8"}>
        {/* Hide tag filter for water type */}
        {activeType !== "water" && (
          <div className="py-2 flex items-center gap-4">
            <TagFilter
              projectTags={projectTags}
              categoryTags={categoryTags}
              allTags={allTags}
              type={activeType}
              selectedProjectTag={selectedProjectTag}
              selectedProjectChildTag={selectedProjectChildTag}
              selectedCategoryTags={selectedCategoryTags}
              selectedCategoryChildTags={selectedCategoryChildTags}
              onSelectProjectTag={setSelectedProjectTag}
              onSelectProjectChildTag={setSelectedProjectChildTag}
              onSelectCategoryTags={setSelectedCategoryTags}
              onSelectCategoryChildTags={setSelectedCategoryChildTags}
            />
            
            {/* Inline Tag Edit Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/tags/${activeType}`)}
              className="flex-shrink-0"
              title={`Edit ${activeType} tags`}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          </div>
        )}

        <div className={viewMode === "calendar" ? "" : "max-w-4xl mx-auto space-y-6"}>
          {/* New Item Button and View Mode Toggle */}
          {activeType !== "water" && (
            <div className="flex items-center justify-between gap-4">
              {/* New Item Button - Left */}
              <Button
                onClick={() => {
                  // Collect selected tag IDs to pass to new item form
                  const tagIds: string[] = [];
                  if (activeType === "fire") {
                    // For fire items, pass project tags
                    if (selectedProjectTag) tagIds.push(selectedProjectTag);
                    if (selectedProjectChildTag) tagIds.push(selectedProjectChildTag);
                  } else {
                    // For earth/air/void items, pass category tags
                    tagIds.push(...selectedCategoryTags, ...selectedCategoryChildTags);
                  }

                  // Build URL with tag IDs if any are selected
                  const url = tagIds.length > 0
                    ? `/item/new?type=${activeType}&tagIds=${tagIds.join(',')}`
                    : `/item/new?type=${activeType}`;
                  navigate(url);
                }}
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

                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "card" | "calendar" | "overview")}>
                  <TabsList>
                    <TabsTrigger value="card">Card</TabsTrigger>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          )}

          {isLoading && items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : (
            <>
              {viewMode === "card" ? (
                <>
                  <ItemList
                    items={items}
                    type={activeType}
                    allTags={allTags}
                    selectedProjectTag={selectedProjectTag}
                    selectedProjectChildTag={selectedProjectChildTag}
                    selectedCategoryTags={selectedCategoryTags}
                    selectedCategoryChildTags={selectedCategoryChildTags}
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

                      {/* Clear Completed Button for Fire items */}
                      {activeType === "fire" && selectedStatusFilter === "Completed" && (() => {
                        const completedItems = items.filter(item => item.type === "fire" && item.status === "Completed");
                        return completedItems.length > 0 && (
                          <Button
                            onClick={async () => {
                              if (window.confirm(`Are you sure you want to delete ${completedItems.length} completed ${completedItems.length === 1 ? 'item' : 'items'}? This will move them to trash.`)) {
                                const itemIds = completedItems.map(item => item.id);
                                await bulkDeleteItems(itemIds);
                              }
                            }}
                            disabled={isBulkDeleting}
                            variant="destructive"
                            className="min-w-[200px]"
                          >
                            {isBulkDeleting ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              `Clear Completed (${completedItems.length})`
                            )}
                          </Button>
                        );
                      })()}
                    </div>
                  )}
                </>
              ) : viewMode === "calendar" && activeType === "water" ? (
                <WaterCalendar items={items} fireItems={fireItems} />
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

import { useEffect, useState } from "react";
import { ItemList } from "@/components/ItemList";
import { OverviewList } from "@/components/OverviewList";
import { FireWaterToggle } from "@/components/FireWaterToggle";
import { TagFilter } from "@/components/TagFilter";
import { StatusFilter } from "@/components/StatusFilter";
import { useItems } from "@/hooks/useItems";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Plus, Search, User } from "lucide-react";
import fireWaterLogo from "@/assets/firewater_logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

interface Tag {
  id: string;
  name: string;
}

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialType = (searchParams.get("type") as "fire" | "water" | "air" | "void" | "earth") || "fire";
  const [activeType, setActiveType] = useState<"fire" | "water" | "air" | "void" | "earth">(initialType);
  const [viewMode, setViewMode] = useState<"card" | "overview">("card");
  const [searchQuery, setSearchQuery] = useState("");
  const pageSize = viewMode === "overview" ? 200 : 10;
  const { items, isLoading, hasMore, addItem, deleteItem, updateItem, loadMore } = useItems(activeType, pageSize);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>();
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<"To Do" | "Completed">("To Do");
  const [allTags, setAllTags] = useState<Tag[]>([]);

  // Fire-specific tag names
  const fireTagNames = ['Tourlab', 'Dirtwire', 'Touring', 'Disorder', 'Merch', 'Emma', 'Shane', 'Odin', 'Home', 'Finances', 'Dev'];

  const handleAddItem = async (title: string, type: "fire" | "water" | "air" | "void" | "earth", tags: Tag[], deadline?: Date, notes?: string, status?: string, url?: string) => {
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
      if (selectedTagFilter) p.set("tag", selectedTagFilter);
      else p.delete("tag");
      return p;
    });
  }, [activeType, selectedTagFilter, setSearchParams]);

  // Clear tag filter when switching types if selected tag doesn't exist in new type
  useEffect(() => {
    if (selectedTagFilter && allTags.length > 0) {
      const currentFilteredTags = activeType === "fire"
        ? allTags.filter(tag => fireTagNames.includes(tag.name))
        : allTags.filter(tag => !fireTagNames.includes(tag.name));
      const isTagInFilteredList = currentFilteredTags.some(tag => tag.id === selectedTagFilter);
      if (!isTagInFilteredList) {
        setSelectedTagFilter(undefined);
      }
    }
  }, [activeType, allTags, selectedTagFilter]);

  // Load all tags from database
  useEffect(() => {
    const loadTags = async () => {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error loading tags:", error);
      } else {
        setAllTags(data || []);
      }
    };

    loadTags();
  }, []);

  // Filter tags based on active type
  const filteredTagsForType = activeType === "fire"
    ? allTags.filter(tag => fireTagNames.includes(tag.name))
    : allTags.filter(tag => !fireTagNames.includes(tag.name));
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

      <div className="container mx-auto px-8 md:px-12 lg:px-16 py-12 space-y-8">
        <div className="py-2">
          <TagFilter
            tags={filteredTagsForType}
            type={activeType}
            selectedTag={selectedTagFilter}
            onSelectTag={setSelectedTagFilter}
          />
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* View Mode Toggle and New Item Button */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "card" | "overview")}>
                <TabsList>
                  <TabsTrigger value="card">Card</TabsTrigger>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                </TabsList>
              </Tabs>

              {activeType === "fire" && (
                <StatusFilter
                  selectedStatus={selectedStatusFilter}
                  onSelectStatus={setSelectedStatusFilter}
                />
              )}
            </div>

            {/* New Item Button - Center */}
            <Button
              onClick={() => navigate(`/item/new?type=${activeType}`)}
              variant="white"
              size="lg"
              className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-6 h-6" />
            </Button>

            {viewMode === "overview" ? (
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            ) : (
              <div className="flex-1 max-w-md" />
            )}
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
                    selectedTagFilter={selectedTagFilter}
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

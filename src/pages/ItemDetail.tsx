import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Flame, Droplet, Circle, Plus, X, Clock, ArrowLeft, Wind, Mountain, Edit2, Eye, FileText, ChevronRight, Trash2 } from "lucide-react";
import { ParentItemSelector } from "@/components/ParentItemSelector";
import ReactMarkdown from "react-markdown";
import { format, set } from "date-fns";
import { cn } from "@/lib/utils";
import type { Tag, Item, ItemType } from "@/types";
import { supportsUrl, supportsDeadline, supportsStatus } from "@/utils/itemTypes";
import { filterTagsForItemType, getProjectAndCategoryTags } from "@/utils/tagFilters";
import { generateTimeOptions } from "@/utils/time";
import { FIRE_TAG_NAMES } from "@/constants/tags";

interface ItemDetailProps {
  onAddItem: (
    title: string,
    type: ItemType,
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
  onDeleteItem?: (itemId: string) => Promise<void>;
}

export default function ItemDetail({ onAddItem, existingTags, existingItem, allItems, onDeleteItem }: ItemDetailProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTitle = existingItem?.title || searchParams.get("title") || "";
  const typeParam = searchParams.get("type") as ItemType | null;

  const [title, setTitle] = useState(initialTitle);
  const [notes, setNotes] = useState(existingItem?.notes || "");
  const [status, setStatus] = useState(existingItem?.status || "");
  const [url, setUrl] = useState(existingItem?.url || "");
  const [itemType, setItemType] = useState<ItemType>(existingItem?.type || typeParam || "fire");
  const [selectedTags, setSelectedTags] = useState<Tag[]>(existingItem?.tags || []);
  const [deadline, setDeadline] = useState<Date | undefined>(existingItem?.deadline);
  const [selectedTime, setSelectedTime] = useState<string>(
    existingItem?.deadline ? format(existingItem.deadline, "HH:mm") : "00:00"
  );
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [isEditingTag, setIsEditingTag] = useState(false);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editTagName, setEditTagName] = useState("");
  const [selectedParent, setSelectedParent] = useState<{ id: string; title: string } | null>(null);
  const [isMarkdownPreview, setIsMarkdownPreview] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Track initial values for change detection
  const initialValues = {
    title: initialTitle,
    notes: existingItem?.notes || "",
    status: existingItem?.status || "",
    url: existingItem?.url || "",
    itemType: existingItem?.type || typeParam || "fire",
    selectedTags: existingItem?.tags || [],
    deadline: existingItem?.deadline,
    parentId: existingItem?.parent_id,
  };

  // Check if form has changed
  useEffect(() => {
    const hasChanged = 
      title !== initialValues.title ||
      notes !== initialValues.notes ||
      status !== initialValues.status ||
      url !== initialValues.url ||
      itemType !== initialValues.itemType ||
      JSON.stringify(selectedTags.map(t => t.id).sort()) !== JSON.stringify(initialValues.selectedTags.map(t => t.id).sort()) ||
      deadline?.getTime() !== initialValues.deadline?.getTime() ||
      selectedParent?.id !== initialValues.parentId;

    setHasUnsavedChanges(hasChanged);
  }, [title, notes, status, url, itemType, selectedTags, deadline, selectedParent]);

  const timeOptions = generateTimeOptions();

  // Initialize parent selection from existing item - FIX: Changed from useState to useEffect
  useEffect(() => {
    if (existingItem?.parent_id) {
      const parent = allItems.find(item => item.id === existingItem.parent_id);
      if (parent) {
        setSelectedParent({ id: parent.id, title: parent.title });
      }
    }
  }, [existingItem?.parent_id, allItems]);

  const handleSubmit = async (e?: React.FormEvent, shouldNavigate: boolean = false) => {
    if (e) e.preventDefault();
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
        supportsDeadline(itemType) ? finalDeadline : undefined,
        notes.trim() || undefined,
        supportsStatus(itemType) ? (status.trim() || "To Do") : undefined,
        supportsUrl(itemType) ? (url.trim() || undefined) : undefined,
        selectedParent?.id
      );
      setHasUnsavedChanges(false);
      
      if (shouldNavigate) {
        navigate(`/?type=${itemType}`);
      }
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

  const addProjectTag = (tag: Tag) => {
    // Remove all existing project tags and add the new one
    const nonProjectTags = selectedTags.filter(t => !FIRE_TAG_NAMES.includes(t.name as any));
    setSelectedTags([...nonProjectTags, tag]);
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

  // Filter tags based on item type
  const baseFilteredTags = filterTagsForItemType(existingTags, itemType);

  // For water items, get separate project and category tags
  const { projectTags: waterProjectTags, categoryTags: waterCategoryTags } = getProjectAndCategoryTags(existingTags, itemType);

  // Separate parent and child tags
  const parentTags = baseFilteredTags.filter(tag => !tag.parent_id);
  const childTags = baseFilteredTags.filter(tag => tag.parent_id);

  // Get IDs of selected tags
  const selectedTagIds = selectedTags.map(t => t.id);

  // Find which selected tags have children
  const selectedTagsWithChildren = selectedTags.filter(tag => 
    existingTags.some(t => t.parent_id === tag.id)
  );

  // Get child tags for each selected parent
  const getChildTagsForParent = (parentId: string) => {
    return existingTags.filter(tag => tag.parent_id === parentId);
  };

  // Check if a project tag is already selected
  const hasProjectTag = selectedTags.some(tag => FIRE_TAG_NAMES.includes(tag.name as any));

  // Full-page markdown preview
  if (isMarkdownPreview) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-8 md:px-12 lg:px-16 py-12">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsMarkdownPreview(false)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Edit
          </Button>
          <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
            {notes ? (
              <ReactMarkdown>{notes}</ReactMarkdown>
            ) : (
              <p className="text-muted-foreground italic">No notes to preview</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-8 md:px-12 lg:px-16 py-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              className="font-medium"
              onClick={async () => {
                if (hasUnsavedChanges) {
                  await handleSubmit(undefined, true);
                } else {
                  navigate(`/?type=${itemType}`);
                }
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {hasUnsavedChanges ? "Save" : "Back"}
            </Button>

            {hasUnsavedChanges && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate(`/?type=${itemType}`)}
              >
                Cancel
              </Button>
            )}
          </div>

          {existingItem?.createdAt && (
            <div className="text-sm text-muted-foreground">
              Created: {format(existingItem.createdAt, "MMM d, yyyy")}
            </div>
          )}
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
                <Select value={itemType} onValueChange={(value: ItemType) => setItemType(value)}>
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

              {supportsStatus(itemType) ? (
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={status || "To Do"} onValueChange={setStatus}>
                    <SelectTrigger className="w-full h-[52px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="To Do">To Do</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <ParentItemSelector
                  selectedParent={selectedParent}
                  onSelectParent={setSelectedParent}
                  allItems={allItems}
                  currentItemId={existingItem?.id}
                  className="flex-1"
                />
              )}
            </div>

            {/* Row 2: Parent Item | Deadline (for Fire) */}
            {supportsDeadline(itemType) && (
              <div className="flex gap-4 items-start">
                <ParentItemSelector
                  selectedParent={selectedParent}
                  onSelectParent={setSelectedParent}
                  allItems={allItems}
                  currentItemId={existingItem?.id}
                  className="flex-1"
                />

                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Deadline</label>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "flex-1 justify-start h-[52px]",
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
                    </PopoverContent>
                    </Popover>

                    <Select value={selectedTime} onValueChange={setSelectedTime}>
                      <SelectTrigger className="w-32 h-[52px]">
                        <Clock className="w-4 h-4 mr-2" />
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

                    {deadline && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-[52px] w-[52px] shrink-0"
                        onClick={() => setDeadline(undefined)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {supportsUrl(itemType) && (
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
              
              {/* For water items, show separate project and category tag sections */}
              {itemType === "water" ? (
                <div className="space-y-4">
                  {/* Project Tags Section */}
                  <div>
                    <label className="text-xs font-medium mb-2 block text-muted-foreground">Project Tags</label>
                    <div className="flex gap-2 items-center mb-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-full border-dashed"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            {hasProjectTag ? "Change Project Tag" : "Add Project Tag"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search project tags..." />
                            <CommandList>
                              <CommandEmpty>No project tags found</CommandEmpty>
                              <CommandGroup>
                                <CommandItem onSelect={() => navigate("/tags")}>
                                  <Edit2 className="w-4 h-4 mr-2" />
                                  <span>Edit tags</span>
                                </CommandItem>
                              </CommandGroup>
                               <CommandGroup heading="Project Tags">
                                {waterProjectTags.map((tag) => (
                                  <CommandItem key={tag.id} onSelect={() => addProjectTag(tag)}>
                                    <span>{tag.name}</span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      
                      {/* Add Sub Tag buttons for project tags with children */}
                      {selectedTags
                        .filter(tag => FIRE_TAG_NAMES.includes(tag.name as any))
                        .filter(tag => existingTags.some(t => t.parent_id === tag.id))
                        .map((tag) => (
                          <Popover key={tag.id}>
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-full border-dashed"
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add Sub Tag
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-0" align="start">
                              <Command>
                                <CommandInput placeholder="Search sub tags..." />
                                <CommandList>
                                  <CommandEmpty>No sub tags found</CommandEmpty>
                                  <CommandGroup>
                                    <CommandItem onSelect={() => navigate("/tags")}>
                                      <Edit2 className="w-4 h-4 mr-2" />
                                      <span>Edit tags</span>
                                    </CommandItem>
                                  </CommandGroup>
                                  <CommandGroup heading={`${tag.name} Sub Tags`}>
                                    {getChildTagsForParent(tag.id).map((childTag) => (
                                      <CommandItem key={childTag.id} onSelect={() => addExistingTag(childTag)}>
                                        <ChevronRight className="w-4 h-4 mr-2" />
                                        <span>{childTag.name}</span>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                      {selectedTags
                        .filter(tag => FIRE_TAG_NAMES.includes(tag.name as any))
                        .map((tag) => {
                          return (
                            <div key={tag.id} className="flex items-center gap-2">
                              <Badge className={cn(
                                "px-3 py-1 rounded-full flex items-center gap-1",
                                "bg-fire-light text-fire-dark border-fire-secondary"
                              )}>
                                <span>{tag.name}</span>
                                <button
                                  type="button"
                                  onClick={() => removeTag(tag.id)}
                                  className="ml-1 hover:opacity-70"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Category Tags Section */}
                  <div>
                    <label className="text-xs font-medium mb-2 block text-muted-foreground">Category Tags</label>
                    <div className="flex gap-2 items-center mb-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-full border-dashed"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Category Tag
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search category tags..." />
                            <CommandList>
                              <CommandEmpty>No category tags found</CommandEmpty>
                              <CommandGroup>
                                <CommandItem onSelect={() => navigate("/tags")}>
                                  <Edit2 className="w-4 h-4 mr-2" />
                                  <span>Edit tags</span>
                                </CommandItem>
                              </CommandGroup>
                              <CommandGroup heading="Category Tags">
                                {waterCategoryTags.map((tag) => (
                                  <CommandItem key={tag.id} onSelect={() => addExistingTag(tag)}>
                                    <span>{tag.name}</span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      
                      {/* Add Sub Tag buttons for category tags with children */}
                      {selectedTags
                        .filter(tag => !FIRE_TAG_NAMES.includes(tag.name as any))
                        .filter(tag => existingTags.some(t => t.parent_id === tag.id))
                        .map((tag) => (
                          <Popover key={tag.id}>
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-full border-dashed"
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add Sub Tag
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-0" align="start">
                              <Command>
                                <CommandInput placeholder="Search sub tags..." />
                                <CommandList>
                                  <CommandEmpty>No sub tags found</CommandEmpty>
                                  <CommandGroup>
                                    <CommandItem onSelect={() => navigate("/tags")}>
                                      <Edit2 className="w-4 h-4 mr-2" />
                                      <span>Edit tags</span>
                                    </CommandItem>
                                  </CommandGroup>
                                  <CommandGroup heading={`${tag.name} Sub Tags`}>
                                    {getChildTagsForParent(tag.id).map((childTag) => (
                                      <CommandItem key={childTag.id} onSelect={() => addExistingTag(childTag)}>
                                        <ChevronRight className="w-4 h-4 mr-2" />
                                        <span>{childTag.name}</span>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                      {selectedTags.filter(tag => !FIRE_TAG_NAMES.includes(tag.name as any)).map((tag) => {
                        return (
                          <div key={tag.id} className="flex items-center gap-2">
                            <Badge className={cn(
                              "px-3 py-1 rounded-full flex items-center gap-1",
                              "bg-water-light text-water-dark border-water-secondary"
                            )}>
                              <span>{tag.name}</span>
                              <button
                                type="button"
                                onClick={() => removeTag(tag.id)}
                                className="ml-1 hover:opacity-70"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              ) : (
                /* For non-water items, show single tag section */
                <div className="space-y-2">
                  <div className="flex gap-2 items-center">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-full border-dashed"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          {itemType === "fire" && hasProjectTag ? "Change Project Tag" : itemType === "fire" ? "Add Project Tag" : "Add Category Tag"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search tags..." />
                          <CommandList>
                            <CommandEmpty>No tags found</CommandEmpty>
                            <CommandGroup>
                              <CommandItem onSelect={() => navigate("/tags")}>
                                <Edit2 className="w-4 h-4 mr-2" />
                                <span>Edit tags</span>
                              </CommandItem>
                            </CommandGroup>
                            <CommandGroup heading={itemType === "fire" ? "Fire Tags" : "Tags"}>
                              {parentTags.map((tag) => (
                                <CommandItem key={tag.id} onSelect={() => (itemType === "fire" ? addProjectTag(tag) : addExistingTag(tag))}>
                                  <span>{tag.name}</span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    
                    {/* Add Sub Tag buttons for tags with children */}
                    {selectedTags
                      .filter(tag => existingTags.some(t => t.parent_id === tag.id))
                      .map((tag) => (
                        <Popover key={tag.id}>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="rounded-full border-dashed"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add Sub Tag
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Search sub tags..." />
                              <CommandList>
                                <CommandEmpty>No sub tags found</CommandEmpty>
                                <CommandGroup>
                                  <CommandItem onSelect={() => navigate("/tags")}>
                                    <Edit2 className="w-4 h-4 mr-2" />
                                    <span>Edit tags</span>
                                  </CommandItem>
                                </CommandGroup>
                                <CommandGroup heading={`${tag.name} Sub Tags`}>
                                  {getChildTagsForParent(tag.id).map((childTag) => (
                                    <CommandItem key={childTag.id} onSelect={() => addExistingTag(childTag)}>
                                      <ChevronRight className="w-4 h-4 mr-2" />
                                      <span>{childTag.name}</span>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      ))}
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                      {selectedTags.map((tag) => {
                        const isProjectTag = FIRE_TAG_NAMES.includes(tag.name as any);
                        return (
                          <div key={tag.id} className="flex items-center gap-2">
                            <Badge className={cn(
                              "px-3 py-1 rounded-full flex items-center gap-1",
                              itemType === "fire" && "bg-fire-light text-fire-dark border-fire-secondary",
                              itemType === "earth" && "bg-earth-light text-earth-dark border-earth-secondary",
                              itemType === "air" && "bg-air-light text-air-dark border-air-secondary",
                              itemType === "void" && "bg-muted text-foreground"
                            )}>
                              <span>{tag.name}</span>
                              <button
                                type="button"
                                onClick={() => removeTag(tag.id)}
                                className="ml-1 hover:opacity-70"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
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
                  <Eye className="w-4 h-4" />
                  Preview
                </Button>
              </div>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes..."
                className="min-h-[300px] text-base py-4 px-6 rounded-xl resize-none"
              />
            </div>
          </div>
        </form>
        
        {/* Bottom action buttons */}
        <div className="max-w-4xl mx-auto mt-6 flex justify-between items-center">
          {existingItem && onDeleteItem ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={async () => {
                if (confirm("Are you sure you want to move this item to trash?")) {
                  await onDeleteItem(existingItem.id);
                  navigate(-1);
                }
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          ) : (
            <div />
          )}
          <Button
            type="button"
            onClick={() => handleSubmit(undefined, false)}
            disabled={!hasUnsavedChanges}
            className={cn(
              !hasUnsavedChanges && "bg-muted text-muted-foreground hover:bg-muted"
            )}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

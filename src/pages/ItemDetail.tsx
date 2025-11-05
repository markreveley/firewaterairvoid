import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CalendarIcon,
  Flame,
  Droplet,
  Circle,
  Plus,
  X,
  Clock,
  ArrowLeft,
  Wind,
  Mountain,
  Edit2,
  Eye,
  FileText,
  ChevronRight,
  Trash2,
  Link as LinkIcon,
} from "lucide-react";
import { ParentItemSelector } from "@/components/ParentItemSelector";
import ReactMarkdown from "react-markdown";
import { format, set } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client-safe";
import type { Tag, Item, ItemType, RecurrenceType } from "@/types";
import {
  supportsUrl,
  supportsDeadline,
  supportsStatus,
} from "@/utils/itemTypes";
import {
  filterTagsForItemType,
  getProjectAndCategoryTags,
} from "@/utils/tagFilters";
import { generateTimeOptions } from "@/utils/time";
import { FIRE_TAG_NAMES } from "@/constants/tags";
import { PRIORITY_LEVELS, PRIORITY_CONFIG, PriorityLevel } from "@/constants/priority";
import { PriorityFireIcon } from "@/components/PriorityFireIcon";

interface ItemDetailProps {
  onAddItem: (
    title: string,
    type: ItemType,
    tags: Tag[],
    deadline?: Date,
    notes?: string,
    status?: string,
    url?: string,
    parent_id?: string,
    is_subitem?: boolean,
    recurrence_type?: RecurrenceType,
    recurrence_end_date?: Date,
    priority?: number,
  ) => Promise<void>;
  existingTags: Tag[];
  existingItem?: Item | null;
  allItems: Item[];
  onDeleteItem?: (itemId: string) => Promise<void>;
  onUpdateItem?: (
    itemId: string,
    updates: {
      title?: string;
      deadline?: Date | null;
      tags?: Tag[];
      notes?: string;
      status?: string;
      url?: string;
      type?: ItemType;
      parent_id?: string | null;
      priority?: number;
      completed?: boolean;
      recurrence_type?: RecurrenceType;
      recurrence_end_date?: Date | null;
    },
  ) => Promise<void>;
}

export default function ItemDetail({
  onAddItem,
  existingTags,
  existingItem,
  allItems,
  onDeleteItem,
  onUpdateItem,
}: ItemDetailProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTitle = existingItem?.title || searchParams.get("title") || "";
  const typeParam = searchParams.get("type") as ItemType | null;
  const deadlineParam = searchParams.get("deadline");
  const tagIdsParam = searchParams.get("tagIds");

  // Parse deadline from URL param if present
  const initialDeadline = existingItem?.deadline ||
    (deadlineParam ? new Date(deadlineParam) : undefined);

  const [title, setTitle] = useState(initialTitle);
  const [notes, setNotes] = useState(existingItem?.notes || "");
  const [status, setStatus] = useState(existingItem?.status || "");
  const [url, setUrl] = useState(existingItem?.url || "");
  const [itemType, setItemType] = useState<ItemType>(
    existingItem?.type || typeParam || "fire",
  );
  const [selectedTags, setSelectedTags] = useState<Tag[]>(
    existingItem?.tags || [],
  );
  const [deadline, setDeadline] = useState<Date | undefined>(
    initialDeadline,
  );
  const [selectedTime, setSelectedTime] = useState<string>(
    initialDeadline ? format(initialDeadline, "HH:mm") : "00:00",
  );
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>(
    existingItem?.recurrence_type || "none",
  );
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | undefined>(
    existingItem?.recurrence_end_date,
  );
  const [priority, setPriority] = useState<number>(
    existingItem?.priority || PRIORITY_LEVELS.TODO,
  );
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [isEditingTag, setIsEditingTag] = useState(false);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editTagName, setEditTagName] = useState("");
  const [isMainTagPopoverOpen, setIsMainTagPopoverOpen] = useState(false);
  const [openChildTagPopoverId, setOpenChildTagPopoverId] = useState<string | null>(null);
  const [selectedParent, setSelectedParent] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [isMarkdownPreview, setIsMarkdownPreview] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [notesItemsTab, setNotesItemsTab] = useState<"notes" | "items">(
    "notes",
  );
  const [newSubItemTitle, setNewSubItemTitle] = useState("");
  const [newSubItemUrl, setNewSubItemUrl] = useState("");
  const [newSubItemType, setNewSubItemType] = useState<"task" | "url" | "note">(
    "task",
  );
  const [subItems, setSubItems] = useState<
    Array<{ id: string; title: string; type: string; completed?: boolean }>
  >([]);

  // Auto-populate tags from URL params when creating a new item
  useEffect(() => {
    // Only run for new items (not editing existing ones)
    if (!existingItem && tagIdsParam && existingTags.length > 0) {
      const tagIds = tagIdsParam.split(',');
      const tagsToSelect = tagIds
        .map(id => existingTags.find(t => t.id === id))
        .filter((t): t is Tag => t !== undefined);

      if (tagsToSelect.length > 0) {
        setSelectedTags(tagsToSelect);
      }
    }
  }, [tagIdsParam, existingTags, existingItem]);

  // Compute initial tags for change detection (includes URL params)
  const getInitialTags = () => {
    if (existingItem?.tags) {
      return existingItem.tags;
    }
    if (tagIdsParam && existingTags.length > 0) {
      const tagIds = tagIdsParam.split(',');
      return tagIds
        .map(id => existingTags.find(t => t.id === id))
        .filter((t): t is Tag => t !== undefined);
    }
    return [];
  };

  // Track initial values for change detection
  const initialValues = {
    title: initialTitle,
    notes: existingItem?.notes || "",
    status: existingItem?.status || "",
    url: existingItem?.url || "",
    itemType: existingItem?.type || typeParam || "fire",
    selectedTags: getInitialTags(),
    deadline: initialDeadline,
    parentId: existingItem?.parent_id,
    selectedTime: initialDeadline
      ? format(initialDeadline, "HH:mm")
      : "00:00",
    recurrenceType: existingItem?.recurrence_type || "none",
    recurrenceEndDate: existingItem?.recurrence_end_date,
    priority: existingItem?.priority || PRIORITY_LEVELS.TODO,
  };

  // Check if form has changed
  useEffect(() => {
    const hasChanged =
      title !== initialValues.title ||
      notes !== initialValues.notes ||
      status !== initialValues.status ||
      url !== initialValues.url ||
      itemType !== initialValues.itemType ||
      JSON.stringify(selectedTags.map((t) => t.id).sort()) !==
        JSON.stringify(initialValues.selectedTags.map((t) => t.id).sort()) ||
      deadline?.getTime() !== initialValues.deadline?.getTime() ||
      selectedTime !== initialValues.selectedTime ||
      selectedParent?.id !== initialValues.parentId ||
      recurrenceType !== initialValues.recurrenceType ||
      recurrenceEndDate?.getTime() !== initialValues.recurrenceEndDate?.getTime() ||
      priority !== initialValues.priority;

    setHasUnsavedChanges(hasChanged);
  }, [
    title,
    notes,
    status,
    url,
    itemType,
    selectedTags,
    deadline,
    selectedTime,
    selectedParent,
    recurrenceType,
    recurrenceEndDate,
    priority,
  ]);

  const timeOptions = generateTimeOptions();

  // Initialize parent selection from existing item - FIX: Changed from useState to useEffect
  useEffect(() => {
    if (existingItem?.parent_id) {
      const parent = allItems.find(
        (item) => item.id === existingItem.parent_id,
      );
      if (parent) {
        setSelectedParent({ id: parent.id, title: parent.title });
      }
    }
  }, [existingItem?.parent_id, allItems]);

  // Fetch sub-items (is_subitem=true) for this item
  useEffect(() => {
    const fetchSubItems = async () => {
      if (!existingItem?.id) {
        setSubItems([]);
        return;
      }

      const { data, error } = await supabase
        .from("items")
        .select("id, title, type, completed")
        .eq("parent_id", existingItem.id)
        .eq("is_subitem", true);

      if (!error && data) {
        setSubItems(data);
      }
    };

    fetchSubItems();
  }, [existingItem?.id]);

  // Auto-select Items tab if this item has sub-items
  useEffect(() => {
    if (subItems.length > 0) {
      setNotesItemsTab("items");
    }
  }, [subItems.length]); // Run when sub-items count changes

  // Handle adding a sub-item
  const handleAddSubItem = async () => {
    if (!newSubItemTitle.trim()) {
      return;
    }

    // This should never happen now since Items tab is disabled for new items
    if (!existingItem) {
      toast.error("Please save this item first");
      return;
    }

    try {
      // Determine type and other properties based on sub-item type
      let subItemType: ItemType = "fire"; // default for tasks
      let subItemUrl: string | undefined = undefined;

      if (newSubItemType === "url") {
        subItemType = "void";
        subItemUrl = newSubItemUrl.trim() || undefined;
        if (!subItemUrl) {
          toast.error("Please enter a URL");
          return;
        }
      } else if (newSubItemType === "note") {
        subItemType = "water"; // notes as water items
      }

      await onAddItem(
        newSubItemTitle.trim(),
        subItemType,
        [], // no tags for sub-items by default
        undefined, // no deadline
        undefined, // no notes
        newSubItemType === "task" ? "To Do" : undefined, // status only for tasks
        subItemUrl,
        existingItem.id, // parent_id is the current item
        true, // is_subitem = true for items created via Items tab
      );

      // Clear inputs
      setNewSubItemTitle("");
      setNewSubItemUrl("");

      // Refetch sub-items to update the list
      if (existingItem?.id) {
        const { data } = await supabase
          .from("items")
          .select("id, title, type, completed")
          .eq("parent_id", existingItem.id)
          .eq("is_subitem", true);

        if (data) {
          setSubItems(data);
        }
      }

      toast.success("Sub-item added!");
    } catch (error) {
      console.error("Error adding sub-item:", error);
      toast.error("Failed to add sub-item");
    }
  };

  const handleSubmit = async (
    e?: React.FormEvent,
    shouldNavigate: boolean = false,
  ) => {
    if (e) e.preventDefault();
    if (title.trim()) {
      let finalDeadline = deadline;
      if (deadline && selectedTime) {
        const [hours, minutes] = selectedTime.split(":").map(Number);
        finalDeadline = set(deadline, {
          hours,
          minutes,
          seconds: 0,
          milliseconds: 0,
        });
      }

      await onAddItem(
        title,
        itemType,
        selectedTags,
        supportsDeadline(itemType) ? finalDeadline : undefined,
        notes.trim() || undefined,
        supportsStatus(itemType) ? status.trim() || "To Do" : undefined,
        supportsUrl(itemType) ? url.trim() || undefined : undefined,
        selectedParent?.id, // Pass parent_id for hierarchical linking
        false, // is_subitem = false for main items (parent-child relationships)
        recurrenceType,
        recurrenceEndDate,
        priority,
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
    // For category tags (earth/air/void), use exclusive selection like fire
    // When selecting a root tag, clear all tags and start fresh
    // When selecting a child tag of an existing root, keep only that root and the new child
    const existingTagData = existingTags.find(et => et.id === tag.id);

    if (!existingTagData?.parent_id) {
      // Adding a root tag - clear everything and just add this tag
      setSelectedTags([tag]);
    } else {
      // Adding a child tag - keep only root tags and the new child
      const rootTags = selectedTags.filter((t) => {
        const tData = existingTags.find(et => et.id === t.id);
        return !tData?.parent_id;
      });
      setSelectedTags([...rootTags, tag]);
    }
    setIsMainTagPopoverOpen(false);
  };

  const addChildTag = (tag: Tag) => {
    // Helper function to check if tagA is an ancestor of tagB
    const isAncestor = (tagAId: string, tagBId: string): boolean => {
      let currentId = tagBId;
      while (currentId) {
        const currentTag = existingTags.find(t => t.id === currentId);
        if (!currentTag?.parent_id) break;
        if (currentTag.parent_id === tagAId) return true;
        currentId = currentTag.parent_id;
      }
      return false;
    };

    // Keep tags that are either:
    // 1. Root tags (no parent_id)
    // 2. Ancestor tags of the new tag (in the parent chain)
    const tagsToKeep = selectedTags.filter((t) => {
      const existingTagData = existingTags.find(et => et.id === t.id);
      // Keep root tags
      if (!existingTagData?.parent_id) return true;
      // Keep if it's an ancestor of the new tag
      return isAncestor(t.id, tag.id);
    });

    setSelectedTags([...tagsToKeep, tag]);
    setOpenChildTagPopoverId(null);
  };

  const addProjectTag = (tag: Tag) => {
    // Remove all existing project tags and add the new one
    const nonProjectTags = selectedTags.filter(
      (t) => !FIRE_TAG_NAMES.includes(t.name as any),
    );
    setSelectedTags([...nonProjectTags, tag]);
    setIsMainTagPopoverOpen(false);
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
      setSelectedTags(
        selectedTags.map((t) =>
          t.id === editingTagId ? { ...t, name: editTagName.trim() } : t,
        ),
      );
      setIsEditingTag(false);
      setEditingTagId(null);
      setEditTagName("");
    }
  };

  // Filter tags based on item type
  const baseFilteredTags = filterTagsForItemType(existingTags, itemType);

  // For water items, get separate project and category tags
  const { projectTags: waterProjectTags, categoryTags: waterCategoryTags } =
    getProjectAndCategoryTags(existingTags, itemType);

  // Separate parent and child tags
  const parentTags = baseFilteredTags.filter((tag) => !tag.parent_id);
  const childTags = baseFilteredTags.filter((tag) => tag.parent_id);

  // Get IDs of selected tags
  const selectedTagIds = selectedTags.map((t) => t.id);

  // Find which selected tags have children
  const selectedTagsWithChildren = selectedTags.filter((tag) =>
    existingTags.some((t) => t.parent_id === tag.id),
  );

  // Get child tags for each selected parent
  const getChildTagsForParent = (parentId: string) => {
    return existingTags.filter((tag) => tag.parent_id === parentId);
  };

  // Check if a project tag is already selected
  const hasProjectTag = selectedTags.some((tag) =>
    FIRE_TAG_NAMES.includes(tag.name as any),
  );

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
              <p className="text-muted-foreground italic">
                No notes to preview
              </p>
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

        <form
          id="item-form"
          onSubmit={handleSubmit}
          className="space-y-6 max-w-4xl mx-auto"
        >
          <div className="space-y-4">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title..."
              className="text-lg py-6 px-6 rounded-2xl border-2"
              autoFocus={!initialTitle}
            />

            {/* Row 1: Type | Status & Priority (for Fire) OR Type | Parent Item (for non-Fire) */}
            <div className="flex gap-4 items-start">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select
                  value={itemType}
                  onValueChange={(value: ItemType) => setItemType(value)}
                >
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
                        Water (Calendar)
                      </div>
                    </SelectItem>
                    <SelectItem value="earth">
                      <div className="flex items-center gap-2">
                        <Mountain className="w-4 h-4 text-earth-primary" />
                        Earth (Companies)
                      </div>
                    </SelectItem>
                    <SelectItem value="air">
                      <div className="flex items-center gap-2">
                        <Wind className="w-4 h-4 text-air-primary" />
                        Air (Knowledge)
                      </div>
                    </SelectItem>
                    <SelectItem value="void">
                      <div className="flex items-center gap-2">
                        <Circle className="w-4 h-4 text-black dark:text-white" />
                        Me (Stuff)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {supportsStatus(itemType) ? (
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">
                    Status
                  </label>
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

              {/* Priority selector - only for fire items */}
              {itemType === "fire" && (
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">
                    Priority
                  </label>
                  <Select
                    value={priority.toString()}
                    onValueChange={(value) => setPriority(parseInt(value))}
                  >
                    <SelectTrigger className="w-full h-[52px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRIORITY_CONFIG).map(([level, config]) => (
                        <SelectItem key={level} value={level}>
                          <div className="flex items-center gap-2">
                            <PriorityFireIcon priority={parseInt(level)} />
                            <span>{config.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Row 2: Parent Item | Deadline (for Fire & Water) */}
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
                  <label className="text-sm font-medium mb-2 block">
                    Deadline
                  </label>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "flex-1 justify-start h-[52px]",
                            deadline &&
                              "bg-fire-light text-fire-dark border-fire-secondary",
                          )}
                        >
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {deadline
                            ? format(deadline, "MMM d, yyyy")
                            : "Set Deadline"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={deadline}
                          onSelect={setDeadline}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>

                    <Select
                      value={selectedTime}
                      onValueChange={setSelectedTime}
                    >
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

            {/* Row 3: Recurrence (for Water items with deadlines) */}
            {itemType === "water" && deadline && (
              <div className="flex gap-4 items-start">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">
                    Repeat
                  </label>
                  <Select
                    value={recurrenceType}
                    onValueChange={(value: RecurrenceType) => setRecurrenceType(value)}
                  >
                    <SelectTrigger className="w-full h-[52px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Does not repeat</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {recurrenceType !== "none" && (
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">
                      End Date (optional)
                    </label>
                    <div className="flex gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className={cn(
                              "flex-1 justify-start h-[52px]",
                              recurrenceEndDate &&
                                "bg-water-light text-water-dark border-water-secondary",
                            )}
                          >
                            <CalendarIcon className="w-4 h-4 mr-2" />
                            {recurrenceEndDate
                              ? format(recurrenceEndDate, "MMM d, yyyy")
                              : "Never ends"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={recurrenceEndDate}
                            onSelect={setRecurrenceEndDate}
                            disabled={(date) => deadline ? date < deadline : false}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>

                      {recurrenceEndDate && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-[52px] w-[52px] shrink-0"
                          onClick={() => setRecurrenceEndDate(undefined)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {supportsUrl(itemType) && (
              <div>
                <label className="text-sm font-medium mb-2 block">URL</label>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={
                    itemType === "void" ? "Add URL..." : "Add URL (optional)..."
                  }
                  className="text-base py-4 px-6 rounded-xl"
                  type="url"
                />
              </div>
            )}

            {/* Hide tags for water type */}
            {itemType !== "water" && (
              <div>
                <label className="text-sm font-medium mb-2 block">Tags</label>

                {/* For non-water items, show single tag section */}
                <div className="space-y-2">
                  <div className="flex gap-2 items-center">
                    <Popover open={isMainTagPopoverOpen} onOpenChange={setIsMainTagPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-full border-dashed"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          {itemType === "fire" && hasProjectTag
                            ? "Change Project Tag"
                            : itemType === "fire"
                              ? "Add Project Tag"
                              : "Add Category Tag"}
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
                            <CommandGroup
                              heading={
                                itemType === "fire" ? "Fire Tags" : "Tags"
                              }
                            >
                              {parentTags.map((tag) => (
                                <CommandItem
                                  key={tag.id}
                                  onSelect={() =>
                                    itemType === "fire"
                                      ? addProjectTag(tag)
                                      : addExistingTag(tag)
                                  }
                                >
                                  <span>{tag.name}</span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    {/* Add Child Tag buttons for tags with children */}
                    {selectedTags
                      .filter((tag) =>
                        existingTags.some((t) => t.parent_id === tag.id),
                      )
                      .map((tag) => (
                        <Popover
                          key={tag.id}
                          open={openChildTagPopoverId === tag.id}
                          onOpenChange={(open) => setOpenChildTagPopoverId(open ? tag.id : null)}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="rounded-full border-dashed"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add Child Tag
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Search child tags..." />
                              <CommandList>
                                <CommandEmpty>No child tags found</CommandEmpty>
                                <CommandGroup>
                                  <CommandItem
                                    onSelect={() => navigate("/tags")}
                                  >
                                    <Edit2 className="w-4 h-4 mr-2" />
                                    <span>Edit tags</span>
                                  </CommandItem>
                                </CommandGroup>
                                <CommandGroup
                                  heading={`${tag.name} Child Tags`}
                                >
                                  {getChildTagsForParent(tag.id).map(
                                    (childTag) => (
                                      <CommandItem
                                        key={childTag.id}
                                        onSelect={() =>
                                          addChildTag(childTag)
                                        }
                                      >
                                        <ChevronRight className="w-4 h-4 mr-2" />
                                        <span>{childTag.name}</span>
                                      </CommandItem>
                                    ),
                                  )}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      ))}
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    {selectedTags.map((tag) => {
                      const isProjectTag = FIRE_TAG_NAMES.includes(
                        tag.name as any,
                      );
                      return (
                        <div key={tag.id} className="flex items-center gap-2">
                          <Badge
                            className={cn(
                              "px-3 py-1 rounded-full flex items-center gap-1 text-white",
                              itemType === "fire" &&
                                "bg-fire-light border-fire-secondary",
                              itemType === "earth" &&
                                "bg-earth-light border-earth-secondary",
                              itemType === "air" &&
                                "bg-air-light border-air-secondary",
                              itemType === "void" && "bg-muted",
                            )}
                          >
                            <span>{tag.name}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                removeTag(tag.id);
                              }}
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
            )}

            <Tabs
              value={notesItemsTab}
              onValueChange={(v) => setNotesItemsTab(v as "notes" | "items")}
              className="w-full"
            >
              <div className="flex items-center justify-between mb-2">
                <TabsList>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                  <TabsTrigger value="items" disabled={!existingItem}>
                    Items
                    {!existingItem && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        (Save first)
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>
                {notesItemsTab === "notes" && (
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
                )}
              </div>

              <TabsContent value="notes" className="mt-0">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes..."
                  className="min-h-[300px] text-base py-4 px-6 rounded-xl resize-none"
                />
              </TabsContent>

              <TabsContent value="items" className="mt-0">
                <div className="border rounded-xl p-4 min-h-[300px] space-y-4">
                  {/* Add new sub-item */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Select
                        value={newSubItemType}
                        onValueChange={(v) =>
                          setNewSubItemType(v as "task" | "url" | "note")
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="task">Task</SelectItem>
                          <SelectItem value="url">URL</SelectItem>
                          <SelectItem value="note">Note</SelectItem>
                        </SelectContent>
                      </Select>

                      {newSubItemType === "task" && (
                        <div className="flex items-center gap-2 flex-1">
                          <Checkbox disabled className="shrink-0" />
                          <Input
                            value={newSubItemTitle}
                            onChange={(e) => setNewSubItemTitle(e.target.value)}
                            placeholder="Add task..."
                            className="flex-1"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleAddSubItem();
                              }
                            }}
                          />
                        </div>
                      )}

                      {newSubItemType === "url" && (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            value={newSubItemTitle}
                            onChange={(e) => setNewSubItemTitle(e.target.value)}
                            placeholder="Title..."
                            className="flex-1"
                          />
                          <Input
                            value={newSubItemUrl}
                            onChange={(e) => setNewSubItemUrl(e.target.value)}
                            placeholder="URL..."
                            className="flex-1"
                            type="url"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleAddSubItem();
                              }
                            }}
                          />
                        </div>
                      )}

                      {newSubItemType === "note" && (
                        <Input
                          value={newSubItemTitle}
                          onChange={(e) => setNewSubItemTitle(e.target.value)}
                          placeholder="Add note..."
                          className="flex-1"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleAddSubItem();
                            }
                          }}
                        />
                      )}

                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAddSubItem}
                        disabled={
                          !newSubItemTitle.trim() ||
                          (newSubItemType === "url" && !newSubItemUrl.trim())
                        }
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* List existing sub-items */}
                  <div className="space-y-2">
                    {subItems.length > 0 ? (
                      subItems.map((child) => (
                        <div
                          key={child.id}
                          className="flex items-center gap-2 p-2 hover:bg-accent rounded-md cursor-pointer"
                          onClick={() =>
                            navigate(
                              `/item/edit?id=${child.id}&type=${child.type}`,
                            )
                          }
                        >
                          {child.type === "fire" && onUpdateItem && (
                            <Checkbox
                              checked={child.completed}
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateItem(child.id, {
                                  completed: !child.completed,
                                });
                              }}
                            />
                          )}
                          <span
                            className={cn(
                              "flex-1",
                              child.completed &&
                                "line-through text-muted-foreground",
                            )}
                          >
                            {child.title}
                          </span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No sub-items yet
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
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
                if (
                  confirm("Are you sure you want to move this item to trash?")
                ) {
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
              !hasUnsavedChanges &&
                "bg-muted text-muted-foreground hover:bg-muted",
            )}
          >
            Save
          </Button>
        </div>

        {/* Item ID display */}
        {existingItem && (
          <div className="max-w-4xl mx-auto mt-4 text-center">
            <p className="text-xs text-muted-foreground font-mono">
              ID: {existingItem.id}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

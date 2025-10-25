import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Edit2, Trash2, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FIRE_TAG_NAMES } from "@/constants/tags";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Tag {
  id: string;
  name: string;
  parent_id?: string | null;
  children?: Tag[];
}

export default function CategoryTagsManagement() {
  const navigate = useNavigate();
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTagName, setNewTagName] = useState("");
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [editTagName, setEditTagName] = useState("");
  const [editTagParent, setEditTagParent] = useState<Tag | null>(null);
  const [deletingTag, setDeletingTag] = useState<Tag | null>(null);
  const [parentTagForNew, setParentTagForNew] = useState<Tag | null>(null);
  const [allFlatTags, setAllFlatTags] = useState<Tag[]>([]);

  const loadTags = async () => {
    try {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .eq("type", "category")
        .order("name", { ascending: true });

      if (error) throw error;

      const categoryTags = data || [];

      // Store flat list for parent selection
      setAllFlatTags(categoryTags);

      // Organize tags into parent-child structure
      const tagMap = new Map<string, Tag>();
      const rootTags: Tag[] = [];

      // First pass: create tag objects
      categoryTags.forEach((tag) => {
        tagMap.set(tag.id, { ...tag, children: [] });
      });

      // Second pass: organize into hierarchy
      tagMap.forEach((tag) => {
        if (tag.parent_id) {
          const parent = tagMap.get(tag.parent_id);
          if (parent) {
            parent.children!.push(tag);
          } else {
            rootTags.push(tag);
          }
        } else {
          rootTags.push(tag);
        }
      });

      setTags(rootTags);
    } catch (error) {
      console.error("Error loading tags:", error);
      toast.error("Failed to load tags");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTags();
  }, []);

  const createTag = async () => {
    if (!newTagName.trim()) return;

    try {
      const { error } = await supabase.from("tags").insert({
        name: newTagName.trim(),
        parent_id: parentTagForNew?.id || null,
        type: "category",
      });

      if (error) {
        if (error.code === "23505") {
          toast.error(
            parentTagForNew
              ? `A tag named "${newTagName}" already exists under "${parentTagForNew.name}"`
              : `A root tag named "${newTagName}" already exists`
          );
        } else {
          throw error;
        }
        return;
      }

      toast.success(`Tag "${newTagName}" created`);
      setNewTagName("");
      setParentTagForNew(null);
      loadTags();
    } catch (error) {
      console.error("Error creating tag:", error);
      toast.error("Failed to create tag");
    }
  };

  const updateTag = async () => {
    if (!editingTag || !editTagName.trim()) return;

    try {
      const { error } = await supabase
        .from("tags")
        .update({ 
          name: editTagName.trim(),
          parent_id: editTagParent?.id || null 
        })
        .eq("id", editingTag.id);

      if (error) throw error;

      toast.success("Tag updated");
      setEditingTag(null);
      setEditTagName("");
      setEditTagParent(null);
      loadTags();
    } catch (error) {
      console.error("Error updating tag:", error);
      toast.error("Failed to update tag");
    }
  };

  const deleteTag = async () => {
    if (!deletingTag) return;

    try {
      const { error } = await supabase
        .from("tags")
        .delete()
        .eq("id", deletingTag.id);

      if (error) throw error;

      toast.success("Tag deleted");
      setDeletingTag(null);
      loadTags();
    } catch (error) {
      console.error("Error deleting tag:", error);
      toast.error("Failed to delete tag");
    }
  };

  const renderTag = (tag: Tag, level: number = 0) => (
    <div key={tag.id} className="space-y-2">
      <div
        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
        style={{ marginLeft: `${level * 24}px` }}
      >
        <div className="flex items-center gap-2">
          {level > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          <Badge variant="outline">{tag.name}</Badge>
          {tag.children && tag.children.length > 0 && (
            <span className="text-xs text-muted-foreground">
              ({tag.children.length} subtag{tag.children.length > 1 ? "s" : ""})
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setParentTagForNew(tag);
              setNewTagName("");
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Subtag
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditingTag(tag);
              setEditTagName(tag.name);
              const currentParent = allFlatTags.find(t => t.id === tag.parent_id);
              setEditTagParent(currentParent || null);
            }}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeletingTag(tag)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {tag.children?.map((child) => renderTag(child, level + 1))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-8 md:px-12 lg:px-16 py-12">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Manage Category Tags</h1>
          <Button variant="outline" onClick={() => navigate("/tags/projects")}>
            Project Tags
          </Button>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Create New Tag */}
          <div className="p-6 rounded-lg border bg-card space-y-4">
            <h2 className="text-lg font-semibold">
              {parentTagForNew ? `Create Subtag for "${parentTagForNew.name}"` : "Create New Category Tag"}
            </h2>
            {parentTagForNew && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Parent:</span>
                <Badge variant="outline">{parentTagForNew.name}</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setParentTagForNew(null)}
                >
                  Clear
                </Button>
              </div>
            )}
            <div className="flex gap-2">
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Tag name..."
                onKeyDown={(e) => e.key === "Enter" && createTag()}
              />
              <Button onClick={createTag} disabled={!newTagName.trim()}>
                <Plus className="w-4 h-4 mr-2" />
                Create
              </Button>
            </div>
          </div>

          {/* Tags List */}
          <div className="space-y-2">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading tags...</div>
            ) : tags.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No category tags yet</div>
            ) : (
              tags.map((tag) => renderTag(tag))
            )}
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editingTag} onOpenChange={() => {
          setEditingTag(null);
          setEditTagParent(null);
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Tag</DialogTitle>
              <DialogDescription>Change the name and parent of this tag</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Tag Name</label>
                <Input
                  value={editTagName}
                  onChange={(e) => setEditTagName(e.target.value)}
                  placeholder="Tag name..."
                  onKeyDown={(e) => e.key === "Enter" && updateTag()}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Parent Tag (optional)</label>
                <div className="flex gap-2">
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={editTagParent?.id || ""}
                    onChange={(e) => {
                      const selectedTag = allFlatTags.find(t => t.id === e.target.value);
                      setEditTagParent(selectedTag || null);
                    }}
                  >
                    <option value="">No parent (root tag)</option>
                    {allFlatTags
                      .filter(t => t.id !== editingTag?.id)
                      .map(tag => (
                        <option key={tag.id} value={tag.id}>{tag.name}</option>
                      ))}
                  </select>
                  {editTagParent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditTagParent(null)}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setEditingTag(null);
                setEditTagParent(null);
              }}>
                Cancel
              </Button>
              <Button onClick={updateTag} disabled={!editTagName.trim()}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deletingTag} onOpenChange={() => setDeletingTag(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Tag</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{deletingTag?.name}"?
                {deletingTag?.children && deletingTag.children.length > 0 && (
                  <span className="block mt-2 text-destructive">
                    This will also delete {deletingTag.children.length} subtag
                    {deletingTag.children.length > 1 ? "s" : ""}.
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeletingTag(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={deleteTag}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

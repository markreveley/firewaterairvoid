import { useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Edit2, Trash2, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client-safe";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ItemType } from "@/types";

interface Tag {
  id: string;
  name: string;
  parent_id?: string | null;
  children?: Tag[];
}

interface TagsManagementPageProps {
  itemType: ItemType;
  icon: ReactNode;
  displayName: string;
  primaryColor: string;
  secondaryColor: string;
  lightColor: string;
  otherTypes: Array<{ type: ItemType; label: string }>;
}

export function TagsManagementPage({
  itemType,
  icon,
  displayName,
  primaryColor,
  secondaryColor,
  lightColor,
  otherTypes,
}: TagsManagementPageProps) {
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
        .eq("type", itemType)
        .order("name", { ascending: true });

      if (error) throw error;

      const typeTags = data || [];
      setAllFlatTags(typeTags);

      // Organize tags into parent-child structure
      const tagMap = new Map<string, Tag>();
      const rootTags: Tag[] = [];

      typeTags.forEach((tag) => {
        tagMap.set(tag.id, { ...tag, children: [] });
      });

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
  }, [itemType]);

  const createTag = async () => {
    if (!newTagName.trim()) return;

    try {
      const { error } = await supabase.from("tags").insert({
        name: newTagName.trim(),
        parent_id: parentTagForNew?.id || null,
        type: itemType,
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

      toast.success("Tag created");
      setNewTagName("");
      setParentTagForNew(null);
      loadTags();
    } catch (error) {
      console.error("Error creating tag:", error);
      toast.error("Failed to create tag");
    }
  };

  const startEditTag = (tag: Tag) => {
    setEditingTag(tag);
    setEditTagName(tag.name);
    const parent = allFlatTags.find((t) => t.id === tag.parent_id);
    setEditTagParent(parent || null);
  };

  const saveTagEdit = async () => {
    if (!editingTag || !editTagName.trim()) return;

    try {
      const { error } = await supabase
        .from("tags")
        .update({
          name: editTagName.trim(),
          parent_id: editTagParent?.id || null,
        })
        .eq("id", editingTag.id);

      if (error) {
        if (error.code === "23505") {
          toast.error(
            editTagParent
              ? `A tag named "${editTagName}" already exists under "${editTagParent.name}"`
              : `A root tag named "${editTagName}" already exists`
          );
        } else {
          throw error;
        }
        return;
      }

      toast.success("Tag updated");
      setEditingTag(null);
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
      const { error } = await supabase.from("tags").delete().eq("id", deletingTag.id);

      if (error) throw error;

      toast.success("Tag deleted");
      setDeletingTag(null);
      loadTags();
    } catch (error) {
      console.error("Error deleting tag:", error);
      toast.error("Failed to delete tag");
    }
  };

  const renderTag = (tag: Tag, level: number = 0): ReactNode => (
    <div key={tag.id} className="space-y-1">
      <div
        className="group flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
        style={{ marginLeft: `${level * 24}px` }}
      >
        <div className="flex items-center gap-3 flex-1">
          {level > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          <Badge className={`${lightColor} text-white`} style={{ borderColor: secondaryColor }}>
            {tag.name}
          </Badge>
          {tag.children && tag.children.length > 0 && (
            <span className="text-xs text-muted-foreground">
              ({tag.children.length} {tag.children.length === 1 ? "child" : "children"})
            </span>
          )}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setParentTagForNew(tag)}
            title="Add child tag"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => startEditTag(tag)}
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
          <Button variant="ghost" onClick={() => navigate(`/?type=${itemType}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <span className={primaryColor}>{icon}</span>
            <h1 className="text-2xl font-bold">Manage {displayName} Tags</h1>
          </div>
          <div className="flex gap-2">
            {otherTypes.map((other) => (
              <Button
                key={other.type}
                variant="outline"
                size="sm"
                onClick={() => navigate(`/tags/${other.type}`)}
              >
                {other.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Create New Tag */}
          <div
            className="p-6 rounded-lg border bg-card space-y-4"
            style={{ borderColor: `${secondaryColor}33` }}
          >
            <h2 className="text-lg font-semibold">
              {parentTagForNew ? `Create Child Tag for "${parentTagForNew.name}"` : `Create New ${displayName} Tag`}
            </h2>
            {parentTagForNew && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Parent:</span>
                <Badge className={`${lightColor} text-white`} style={{ borderColor: secondaryColor }}>
                  {parentTagForNew.name}
                </Badge>
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
                style={{ borderColor: `${secondaryColor}33` }}
                className="focus:border-current"
              />
              <Button
                onClick={createTag}
                disabled={!newTagName.trim()}
                className={`${primaryColor} text-white`}
                style={{ backgroundColor: primaryColor.includes('text-') ? undefined : primaryColor }}
              >
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
              <div className="text-center py-12 text-muted-foreground">No {itemType} tags yet</div>
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
              <DialogTitle>Edit {displayName} Tag</DialogTitle>
              <DialogDescription>Change the name and parent of this tag</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tag Name</label>
                <Input
                  value={editTagName}
                  onChange={(e) => setEditTagName(e.target.value)}
                  placeholder="Tag name..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Parent Tag (optional)</label>
                <select
                  className="w-full p-2 rounded-md border bg-background"
                  value={editTagParent?.id || ""}
                  onChange={(e) => {
                    const parent = allFlatTags.find((t) => t.id === e.target.value);
                    setEditTagParent(parent || null);
                  }}
                >
                  <option value="">No parent (root tag)</option>
                  {allFlatTags
                    .filter((t) => t.id !== editingTag?.id)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingTag(null)}>
                Cancel
              </Button>
              <Button onClick={saveTagEdit}>Save</Button>
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
                    This tag has {deletingTag.children.length} child tag(s) which will also be deleted.
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

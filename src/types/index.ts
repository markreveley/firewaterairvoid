export type ItemType = "fire" | "water" | "air" | "void" | "earth";
export type RecurrenceType = "none" | "weekly" | "yearly";

export interface Tag {
  id: string;
  name: string;
  parent_id?: string | null;
  type?: 'project' | 'category';
}

export interface Item {
  id: string;
  title: string;
  type: ItemType;
  notes?: string;
  status?: string;
  url?: string;
  tags: Tag[];
  createdAt: Date;
  deadline?: Date;
  parent_id?: string;
  parent?: { id: string; title: string; type: string };
  children?: Array<{ id: string; title: string; type: string; completed?: boolean }>;
  subItems?: Array<{ id: string; title: string; type: string; completed?: boolean }>;
  priority: number;
  completed: boolean;
  is_subitem: boolean; // true = sub-item (Items tab only), false = child item (hierarchical with arrows)
  recurrence_type: RecurrenceType;
  recurrence_end_date?: Date;
}

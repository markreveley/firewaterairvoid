export type ItemType = "fire" | "water" | "air" | "void" | "earth";

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
  is_subitem?: boolean;
  parent?: { id: string; title: string; type: string };
  children?: Array<{ id: string; title: string; type: string; completed?: boolean }>;
  priority: number;
  completed: boolean;
}

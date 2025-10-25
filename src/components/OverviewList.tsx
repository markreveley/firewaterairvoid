import { useNavigate } from "react-router-dom";

interface Tag {
  id: string;
  name: string;
}

interface Item {
  id: string;
  title: string;
  type: "fire" | "water" | "air" | "void" | "earth";
  notes?: string;
  status?: string;
  url?: string;
  tags: Tag[];
  createdAt: Date;
  deadline?: Date;
  parent_id?: string;
  parent?: { id: string; title: string; type: string };
  children?: Array<{ id: string; title: string; type: string }>;
}

interface OverviewListProps {
  items: Item[];
  searchQuery: string;
}

export function OverviewList({ items, searchQuery }: OverviewListProps) {
  const navigate = useNavigate();

  // Filter items based on search query
  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-0">
      {filteredItems.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">
          {searchQuery ? "No items found" : "No items yet"}
        </p>
      ) : (
        <ul className="space-y-0">
          {filteredItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => navigate(`/item/edit?id=${item.id}`)}
                className="w-full text-left px-4 py-1 hover:bg-accent rounded-md transition-colors text-sm"
              >
                {item.title}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

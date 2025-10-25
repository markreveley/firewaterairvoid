import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

const ITEMS_PER_PAGE = 100;

export function OverviewList({ items, searchQuery }: OverviewListProps) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  // Filter items based on search query
  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      {filteredItems.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">
          {searchQuery ? "No items found" : "No items yet"}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-x-8 gap-y-0">
            {paginatedItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(`/item/edit?id=${item.id}`)}
                className="w-full text-left px-4 py-1 hover:bg-accent rounded-md transition-colors text-sm"
              >
                {item.title}
              </button>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

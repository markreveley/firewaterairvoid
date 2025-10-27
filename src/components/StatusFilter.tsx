import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StatusFilterProps {
  selectedStatus: "All" | "To Do" | "Completed";
  onSelectStatus: (status: "All" | "To Do" | "Completed") => void;
}

export function StatusFilter({ selectedStatus, onSelectStatus }: StatusFilterProps) {
  return (
    <div className="flex justify-center">
      <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            selectedStatus === "All" && "bg-background text-foreground shadow"
          )}
          onClick={() => onSelectStatus("All")}
        >
          All
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            selectedStatus === "To Do" && "bg-background text-foreground shadow"
          )}
          onClick={() => onSelectStatus("To Do")}
        >
          To Do
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            selectedStatus === "Completed" && "bg-background text-foreground shadow"
          )}
          onClick={() => onSelectStatus("Completed")}
        >
          Completed
        </Button>
      </div>
    </div>
  );
}

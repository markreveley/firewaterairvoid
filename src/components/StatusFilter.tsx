import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StatusFilterProps {
  selectedStatus: "To Do" | "Completed";
  onSelectStatus: (status: "To Do" | "Completed") => void;
}

export function StatusFilter({ selectedStatus, onSelectStatus }: StatusFilterProps) {
  return (
    <div className="flex justify-center">
      <div className="inline-flex items-center rounded-full bg-muted p-1 gap-1">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "rounded-full px-6 transition-all",
            selectedStatus === "To Do" && "bg-background shadow-sm"
          )}
          onClick={() => onSelectStatus("To Do")}
        >
          To Do
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "rounded-full px-6 transition-all",
            selectedStatus === "Completed" && "bg-background shadow-sm"
          )}
          onClick={() => onSelectStatus("Completed")}
        >
          Completed
        </Button>
      </div>
    </div>
  );
}

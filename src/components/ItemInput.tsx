import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";

interface ItemInputProps {
  currentType: "fire" | "water" | "air" | "void" | "earth";
}

export function ItemInput({ currentType }: ItemInputProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/item/new?type=${currentType}`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <Input
        onClick={handleClick}
        placeholder="Enter an item..."
        className="flex-1 text-lg py-6 px-6 rounded-2xl border-2 cursor-pointer"
        readOnly
      />
    </div>
  );
}

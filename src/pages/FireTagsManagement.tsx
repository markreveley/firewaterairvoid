import { Flame } from "lucide-react";
import { TagsManagementPage } from "@/components/TagsManagementPage";

export default function FireTagsManagement() {
  return (
    <TagsManagementPage
      itemType="fire"
      icon={<Flame className="w-6 h-6" />}
      displayName="Fire"
      primaryColor="text-fire-primary"
      secondaryColor="#ef4444"
      lightColor="bg-fire-light"
      otherTypes={[
        { type: "earth", label: "Earth" },
        { type: "air", label: "Air" },
        { type: "void", label: "Void" },
      ]}
    />
  );
}

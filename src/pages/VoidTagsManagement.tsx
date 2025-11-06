import { Circle } from "lucide-react";
import { TagsManagementPage } from "@/components/TagsManagementPage";

export default function VoidTagsManagement() {
  return (
    <TagsManagementPage
      itemType="void"
      icon={<Circle className="w-6 h-6" />}
      displayName="Void"
      primaryColor="text-void-primary"
      secondaryColor="#6b7280"
      lightColor="bg-void-light"
      otherTypes={[
        { type: "fire", label: "Fire" },
        { type: "earth", label: "Earth" },
        { type: "air", label: "Air" },
      ]}
    />
  );
}

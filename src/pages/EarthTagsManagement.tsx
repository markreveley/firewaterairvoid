import { Mountain } from "lucide-react";
import { TagsManagementPage } from "@/components/TagsManagementPage";

export default function EarthTagsManagement() {
  return (
    <TagsManagementPage
      itemType="earth"
      icon={<Mountain className="w-6 h-6" />}
      displayName="Earth"
      primaryColor="text-earth-primary"
      secondaryColor="#a16207"
      lightColor="bg-earth-light"
      otherTypes={[
        { type: "fire", label: "Fire" },
        { type: "air", label: "Air" },
        { type: "void", label: "Void" },
      ]}
    />
  );
}

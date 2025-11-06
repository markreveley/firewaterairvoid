import { Wind } from "lucide-react";
import { TagsManagementPage } from "@/components/TagsManagementPage";

export default function AirTagsManagement() {
  return (
    <TagsManagementPage
      itemType="air"
      icon={<Wind className="w-6 h-6" />}
      displayName="Air"
      primaryColor="text-air-primary"
      secondaryColor="#0284c7"
      lightColor="bg-air-light"
      otherTypes={[
        { type: "fire", label: "Fire" },
        { type: "earth", label: "Earth" },
        { type: "void", label: "Void" },
      ]}
    />
  );
}

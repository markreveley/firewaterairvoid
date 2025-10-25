import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tag } from "@/types";

/**
 * Custom hook to load and manage tags from the database
 */
export function useTags() {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTags = async () => {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error loading tags:", error);
      } else {
        setAllTags(data || []);
      }
      setIsLoading(false);
    };

    loadTags();
  }, []);

  return { allTags, isLoading };
}

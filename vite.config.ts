import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },
  // Ensure env vars are available even if .env isn't present locally
  define: {
    'import.meta.env.VITE_SUPABASE_PROJECT_ID': JSON.stringify(
      process.env.VITE_SUPABASE_PROJECT_ID || process.env.SUPABASE_PROJECT_ID || 'chdnmfujjdbtxfoogymc'
    ),
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(
      process.env.VITE_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      ((process.env.VITE_SUPABASE_PROJECT_ID || process.env.SUPABASE_PROJECT_ID)
        ? `https://${(process.env.VITE_SUPABASE_PROJECT_ID || process.env.SUPABASE_PROJECT_ID)}.supabase.co`
        : 'https://chdnmfujjdbtxfoogymc.supabase.co')
    ),
    'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoZG5tZnVqamRidHhmb29neW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMTk0ODMsImV4cCI6MjA3Njg5NTQ4M30.qUKLzEoVPn5gLuljQuAEcDjr6l0_ZU3TWwJz-JEiym0'
    ),
  },
}));

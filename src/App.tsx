import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ItemDetailPage from "./pages/ItemDetailPage";
import FireTagsManagement from "./pages/FireTagsManagement";
import EarthTagsManagement from "./pages/EarthTagsManagement";
import AirTagsManagement from "./pages/AirTagsManagement";
import VoidTagsManagement from "./pages/VoidTagsManagement";
import NotFound from "./pages/NotFound";
import Redirect from "./pages/Redirect";
import TagsRedirect from "./pages/TagsRedirect";

// Create a client with sensible defaults for caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data stays fresh for 5 minutes
      gcTime: 1000 * 60 * 10, // Cache kept for 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false, // Don't refetch on window focus by default
      retry: 1, // Only retry failed requests once
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/item/new" element={<ItemDetailPage />} />
            <Route path="/item/edit" element={<ItemDetailPage />} />
            <Route path="/tags" element={<TagsRedirect />} />
            <Route path="/tags/fire" element={<FireTagsManagement />} />
            <Route path="/tags/earth" element={<EarthTagsManagement />} />
            <Route path="/tags/air" element={<AirTagsManagement />} />
            <Route path="/tags/void" element={<VoidTagsManagement />} />
            <Route path="/redirect" element={<Redirect />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

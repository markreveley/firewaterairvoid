import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ItemDetailPage from "./pages/ItemDetailPage";
import TagsManagement from "./pages/TagsManagement";
import NotFound from "./pages/NotFound";
import Redirect from "./pages/Redirect";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/item/new" element={<ItemDetailPage />} />
        <Route path="/item/edit" element={<ItemDetailPage />} />
        <Route path="/tags" element={<TagsManagement />} />
        <Route path="/redirect" element={<Redirect />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;

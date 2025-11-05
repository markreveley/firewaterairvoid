# Tag Refactoring Progress Tracker

## Overview
Refactoring tag system so each type (Fire, Earth, Air, Void) has completely independent tags and child tags. Water type will have no tags.

## Phases

### Phase 1: Database Migration & Schema Changes ✅ COMPLETED
- [x] Rename existing project tags to fire tags
- [x] Duplicate category tags for Earth, Air, and Void (preserving hierarchy)
- [x] Remove old category tags
- [x] Clear all water item tags
- [x] Update type constraint
- **Result:** Fire: 34 tags, Earth: 11 tags, Air: 11 tags, Void: 11 tags. Hierarchy preserved.

### Phase 2: Update Type Definitions & Utilities ✅ COMPLETED
- [x] Update src/types/index.ts documentation
- [x] Rewrite src/utils/tagFilters.ts for type-specific tags
- [x] Update src/utils/tagFilters.test.ts
- [x] Update src/pages/Index.tsx tag filtering
- [x] Update src/pages/ItemDetail.tsx tag selection logic
- **Result:** Simplified to 2 functions: getTagsForItemType() and getAllTagsForItemType(). No build errors.

### Phase 3: Create Type-Specific Tag Management Pages
- [ ] Create src/pages/FireTagsManagement.tsx (fire-themed)
- [ ] Create src/pages/EarthTagsManagement.tsx (earth-themed)
- [ ] Create src/pages/AirTagsManagement.tsx (air-themed)
- [ ] Create src/pages/VoidTagsManagement.tsx (void-themed)
- [ ] Delete src/pages/ProjectTagsManagement.tsx
- [ ] Delete src/pages/CategoryTagsManagement.tsx

### Phase 4: Update Routing
- [ ] Update src/App.tsx with new tag routes
- [ ] Update src/pages/TagsRedirect.tsx for type-based redirects

### Phase 5: Simplify TagFilter Component
- [ ] Refactor src/components/TagFilter.tsx for single tag array

### Phase 6: Add Inline Tag Edit UI on Main Page
- [ ] Add edit button in src/pages/Index.tsx (Option A: navigate to /tags/{type})

### Phase 7: Update ItemDetail Component
- [ ] Update tag selection logic in src/pages/ItemDetail.tsx
- [ ] Remove project/category distinction
- [ ] Add water type protection

### Phase 8: Update ItemList Component
- [ ] Simplify tag filtering in src/components/ItemList.tsx

### Phase 9: Update useTags Hook
- [ ] Review src/hooks/useTags.ts (may not need changes)

### Phase 10: Water Type Protection
- [ ] Add application-level water tag prevention

### Phase 11: Final Testing
- [ ] Test fire tags (independent)
- [ ] Test earth tags (independent)
- [ ] Test air tags (independent)
- [ ] Test void tags (independent)
- [ ] Test water has no tags
- [ ] Test inline edit button
- [ ] Test tag management pages

## Notes
- Preserving hierarchical structure when duplicating tags
- Using Option A for inline edit UI (navigate button)
- Element-themed styling for each tag management page

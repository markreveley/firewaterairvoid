# Project Development Plan

## 🤖 Context Management (Agent Instructions)
> **COMPACT-MODE**: When context is running low or I say "compact", "context-low", or "oom":
> - Return ≤30 lines of tool output unless I ask for more
> - Prefer `grep`, `head` over full file reads
> - Before showing >500 lines, ask: "Show all (≈X tokens) or summarise?"
> - Suggest collapsing large functions in-place with summary comments
>
> **Work Log Management**: After EVERY commit:
> - YOU (agent) are responsible for updating plan.md
> - Add work log entry using the template in Work Log section
> - Update "Current Status" section to reflect what's next
> - Proactively suggest committing plan.md changes
> - DO NOT wait for user to request this - it's YOUR job
>
> **Memory Model**: Git is the real long-term memory; plan.md is the index to that memory.

**📚 Full Documentation:**
- **DESIGN.md** - Architecture decisions, technical rationale, database schema (parent/child vs sub-items)
- **USER_STORIES.md** - User workflows, feature descriptions, edge cases
- **STRATEGY.md** - Business strategy, commercialization analysis, pricing
- **plan.md** (this file) - Lightweight index, current status, work log

## Current Status
**Working on**: Nothing - water calendar view complete ✅
**Next**: Waiting for next feature request or bug report

## Work Log
--------------------------------------------------
2025-11-03 – water calendar view
- Goal: Add calendar display for water items with month/week/agenda views
- Key files: src/components/WaterCalendar.tsx (new), src/components/WaterCalendar.css (new), src/pages/Index.tsx (calendar view mode), src/components/ItemList.tsx (water deadline display), src/utils/itemTypes.ts (enable deadline for water), src/pages/ItemDetail.tsx (comment update)
- Decisions: Installed react-big-calendar for calendar UI; water items now support deadline field (same as fire); calendar view only appears for water type as third tab (Card | Calendar | Overview); view mode saved in URL params; unscheduled water items (no deadline) shown below calendar; water-blue theme styling applied to calendar events; priority items highlighted with yellow glow
- Library choice: react-big-calendar chosen over custom solution for mature month/week/agenda view support
- Next: (completed ✅)
--------------------------------------------------
2025-11-03 – deep tag hierarchy navigation
- Goal: Support 3-level tag hierarchies (e.g., Dev/Rust/Built in Rust) with proper UI navigation and filtering
- Key files: src/components/TagFilter.tsx (3-row display, ancestor highlighting), src/pages/Index.tsx (fixed tag validation)
- Decisions: Display root tags (row 1), children (row 2), grandchildren (row 3) separately; highlight full ancestor path; validate against all project tags not just root tags to prevent clearing non-root selections
- Tag reorganization: FireWaterVoid→top-level, created Dev/Rust, moved Built in Rust→Dev/Rust/Built in Rust, Rust VST→Disorder, Tourlab→Dirtwire, Emma/Odin/Shane→1181
- Next: (completed ✅)
--------------------------------------------------
2025-10-27 – claude.md entry point
- Goal: Create bootstrap file for fresh Claude Code sessions
- Key files: claude.md (session entry point with quick start instructions)
- Decisions: claude.md serves as the first file to read in new sessions, contains pointers to plan.md and other docs, documents startup protocol
- Next: (completed ✅)
--------------------------------------------------
2025-10-27 – context management workflow
- Goal: Establish workflow for managing Claude Code context across sessions
- Key files: USER.md (comprehensive user guide), plan.md (agent meta-instructions, work log template)
- Decisions: Agent is responsible for maintaining work log after every commit; plan.md is lightweight index (~150 lines); git is long-term memory; COMPACT-MODE for low context situations. Based on Kimi playbook principles.
- Next: (completed - workflow in use ✅)
--------------------------------------------------
2025-10-27 – is_subitem implementation complete
- Goal: Separate parent/child relationships (hierarchical links) from sub-items (scoped content)
- Key files: src/hooks/useItems.ts (main query + children query), src/pages/ItemDetail.tsx (separate sub-items fetch), src/pages/ItemDetailPage.tsx, DESIGN.md
- Decisions: Fixed Lovable's buggy implementation - main query filters .eq("is_subitem", false), children query fetches child items (not sub-items), ItemDetail has separate fetch for sub-items with .eq("is_subitem", true). Tested: sub-items only in Items tab, parent/child arrows work correctly.
- Next: (completed and tested ✅)
--------------------------------------------------
2025-10-27 – priority system & sub-items UI
- Goal: Add star-based priority + Notes/Items tabbed interface with three sub-item types
- Key files: supabase/migrations/20251025190000_add_priority_and_completed.sql, src/components/ItemList.tsx, src/pages/ItemDetail.tsx, src/hooks/useItems.ts
- Decision: priority field for sorting, completed field for tasks; Task/URL/Note sub-types mapped to fire/void/water
- Next: (completed - moved to is_subitem work)
--------------------------------------------------
2025-10-25 – hierarchical tag system
- Goal: Split project/category tags, add parent/child tag relationships
- Key files: src/pages/ProjectTagsManagement.tsx, src/pages/CategoryTagsManagement.tsx, src/utils/tagFilters.ts
- Decision: Same table with type column, parent_id for hierarchy, unique constraint on (name, parent_id)
- Next: (completed)
--------------------------------------------------

> **Pruning**: When work log exceeds ~10 entries or plan.md exceeds 200 lines, move older entries to `docs/archive/plan-YYYY-MM.md`, commit, and keep only the most recent 5-7 entries here.

## Project Overview
Fire Water is a task/project management application that organizes items into five elemental types: fire, water, air, void, and earth. Each type serves different purposes and has different tag filtering capabilities.

**Tech Stack**: React 18 + TypeScript + Vite, shadcn/ui, Supabase (PostgreSQL), TanStack Query

**Key Architectural Decisions**: See DESIGN.md for full details on:
- Parent/child relationships vs. sub-items distinction (is_subitem flag)
- Tag system (project/category types, hierarchical structure)
- Item type behaviors and filtering rules
- Database schema and constraints

## Important File Locations

### Core Application
- Entry point: src/App.tsx
- Main page: src/pages/Index.tsx
- Item detail/edit: src/pages/ItemDetail.tsx, src/pages/ItemDetailPage.tsx

### Tag Management
- Project tags page: src/pages/ProjectTagsManagement.tsx
- Category tags page: src/pages/CategoryTagsManagement.tsx
- Tag redirect: src/pages/TagsRedirect.tsx
- Tag filtering utils: src/utils/tagFilters.ts
- Tag constants: src/constants/tags.ts

### Components
- Item lists: src/components/ItemList.tsx, src/components/OverviewList.tsx
- Tag filter: src/components/TagFilter.tsx
- Status filter: src/components/StatusFilter.tsx
- Fire/Water toggle: src/components/FireWaterToggle.tsx

### Hooks & Utils
- Items hook: src/hooks/useItems.ts
- Tags hook: src/hooks/useTags.ts
- Tag filters: src/utils/tagFilters.ts (+ .test.ts)

### Database
- Supabase client: src/integrations/supabase/client.ts
- Type definitions: src/integrations/supabase/types.ts
- Migrations: supabase/migrations/

### Types
- Core types: src/types/index.ts

## Known Issues / Blockers
None currently.

## Development Context (Quick Reference)

### Priority & Sorting
- Click star icon to toggle priority (0 ↔ 1)
- Sort order: Priority DESC → Deadline ASC → CreatedAt DESC
- Yellow filled star = prioritized item

### Sub-Items System
- See DESIGN.md for full parent/child vs. sub-items distinction
- Three types: Task (fire), URL (void), Note (water)
- UI: ItemDetail → "Items" tab
- Migration pending: `is_subitem` flag to distinguish from child items

### Tag System
- Two types: project (fire only) and category (water/air/void/earth)
- Hierarchical: tags can have parent/child relationships
- See src/utils/tagFilters.ts for filtering logic

### Recent Migrations
- 20251025190000: Added priority and completed fields
- 20251027180000: Added is_subitem flag (PENDING - needs Lovable to run)

## Testing & Running

### Local Development
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run build:dev    # Development build
npm run preview      # Preview production build
```

### Testing
```bash
npm test             # Run tests in watch mode
npm run test:ui      # Open Vitest UI
npm run test:run     # Run tests once
npm run test:coverage # Run with coverage
```

### Deployment
- Platform: Lovable.dev
- Auto-deploys on git push to main
- Project URL: https://lovable.dev/projects/568ea099-30f2-4533-b443-d1768a09be20

## Questions / Needs Clarification
None currently.

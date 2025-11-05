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
**Working on**: Nothing - all tasks complete ✅
**Next**: Apply migration in Lovable, then ready for user testing

## Work Log
--------------------------------------------------
2025-11-05 – fix priority sort order for 5-state system
- Goal: Correct fire item sorting so highest priority items appear first
- Key files: src/hooks/useItems.ts (priority sort order)
- Issue: Database query was sorting priority descending (5→1), but new 5-state system uses lower numbers for higher priority (1=Immediate, 5=Done); this caused Done items to appear before Immediate items
- Solution: Changed `.order("priority", { ascending: false })` to `.order("priority", { ascending: true })` on line 21
- Result: Fire items now display in correct priority order: Immediate (1) → Pressing (2) → To Do (3) → Paused (4) → Done (5), then by deadline, then by creation date
- Next: (completed ✅)
--------------------------------------------------
2025-11-05 – security audit: remove sensitive data from repository
- Goal: Remove .env file from git history and prevent future exposure of sensitive credentials
- Key files: .env (deleted), .env.example (created), .gitignore (updated), supabase/migrations/20251105015207_d79dea5d-c956-435f-8081-5cd3296799fe.sql (new migration), src/hooks/useItems.ts, src/pages/Index.tsx
- Changes: Removed .env from repository using git filter-branch; created .env.example template with placeholder values for Supabase credentials; added .env and .env.* patterns to .gitignore; added new migration file for database changes
- Security improvements: Sensitive Supabase credentials (ANON_KEY, SERVICE_ROLE_KEY) no longer tracked in version control; template file provides clear structure for local setup without exposing secrets
- Migration required: None for security changes (local only); database migration pending application in Lovable
- Next: (completed ✅)
--------------------------------------------------
--------------------------------------------------
2025-11-04 – 5-state priority fire icon system
- Goal: Replace binary star priority with intuitive 5-level fire icon with color-coded states
- Key files: supabase/migrations/20251104120000_update_priority_to_five_levels.sql, src/constants/priority.ts, src/components/PriorityFireIcon.tsx, src/components/ItemList.tsx, src/pages/ItemDetail.tsx, src/pages/ItemDetailPage.tsx, src/hooks/useItems.ts
- Priority levels: 1=immediate (dark red), 2=pressing (red), 3=todo (orange), 4=paused (gray), 5=done (dark gray)
- Changes: Created PriorityFireIcon component with color-based states; replaced Star icon import with fire icon in ItemList; changed priority toggle to cycle through all 5 states (1→2→3→4→5→1); added priority dropdown in ItemDetail page showing colored fire icons for each state; updated data layer to support priority in add/update operations; migrated existing data (starred→immediate, normal→todo); set default priority to 3 (todo)
- Migration required: User must apply SQL migration in Lovable (supabase/migrations/20251104120000_update_priority_to_five_levels.sql)
- UX improvements: Visual fire metaphor matches urgency (burning red → cooling gray); single-click cycling on item cards; dropdown selector in detail view; color provides instant priority recognition
- Next: (awaiting migration application in Lovable)
--------------------------------------------------
--------------------------------------------------
2025-11-04 – water calendar full-height layout and recurring event fixes
- Goal: Improve calendar UX with better layout and fix navigation bug for recurring events
- Key files: src/components/WaterCalendar.tsx (layout, navigation fix, recurring event safety), src/pages/Index.tsx (conditional layout), src/pages/ItemDetail.tsx (tag contrast)
- Changes: Changed default view from 'month' to 'agenda' for better task focus; fixed recurring event navigation to extract actual item ID instead of event instance ID (was using "abc123-1234567890", now uses "abc123"); added safety limit of 200 iterations for recurring event generation; implemented full-height responsive layout (calc(100vh-73px)) that adapts to viewport; removed container constraints when in calendar view for full-width display; improved unscheduled items section with compact styling and scrolling; enhanced tag badge dark mode contrast with white text
- Bug fix: Recurring event instances now navigate to correct item edit page (previously navigated to non-existent instance IDs)
- UX improvements: Agenda view provides better task-oriented display; calendar uses full available height; conditional container styling optimizes space usage
- Next: (completed ✅)
--------------------------------------------------
2025-11-04 – remove tags from water section
- Goal: Hide all tag UI elements from water type while preserving infrastructure
- Key files: src/pages/Index.tsx (hide TagFilter), src/components/WaterCalendar.tsx (remove tag display), src/components/ItemList.tsx (conditional hide tags), src/pages/ItemDetail.tsx (hide tag editing section)
- Changes: Wrapped TagFilter in Index.tsx with `{activeType !== "water" && ...}`; removed tag badges from WaterCalendar unscheduled items; added `item.type !== "water"` condition to ItemList tag display; wrapped entire tag editing section in ItemDetail with `{itemType !== "water" && ...}` and removed water-specific tag UI code
- Infrastructure: Database schema, tag relationships, and all backend functionality remain intact; tags can be reintroduced to water items in the future if needed
- Code cleanup: Removed 310 lines of water-specific tag UI code, simplified component logic
- Next: (completed ✅)
--------------------------------------------------
2025-11-04 – dark mode text legibility improvements
- Goal: Fix hard-to-read text colors in dark mode for tags and calendar
- Key files: src/components/TagFilter.tsx (dark mode text), src/components/WaterCalendar.css (calendar day headings)
- Changes: Added dark:text-foreground utility to all non-selected tag badges; added .dark CSS override for calendar day headings to use foreground color
- Issue: Tags were using type-specific dark colors (water-dark, fire-dark, etc.) in dark mode which had poor contrast; calendar day headings also used water-dark color
- Solution: Override text color in dark mode to use semantic foreground token (light gray-white matching type menu)
- Next: (completed ✅)
--------------------------------------------------
2025-11-04 – dark mode implementation
- Goal: Add dark mode toggle and fix logo visibility in both themes
- Key files: src/components/theme-provider.tsx (new), src/components/theme-toggle.tsx (new), src/App.tsx (ThemeProvider integration), src/pages/Index.tsx (toggle button and logo fix)
- Changes: Created ThemeProvider wrapper using next-themes library (already installed); created ThemeToggle dropdown component with Light/Dark/System options; wrapped app in ThemeProvider with class attribute and system detection enabled; added toggle button to header next to User icon; applied dark:invert CSS filter to logo for visibility in dark mode
- UX: Sun/Moon icon animates on theme change; dropdown menu for theme selection; respects system preference by default; logo automatically inverts colors in dark mode
- Theme system: Uses existing CSS variables in index.css (.dark class already defined with full color palette); Tailwind configured for class-based dark mode
- Next: (completed ✅)
--------------------------------------------------
2025-11-04 – bulk delete for completed fire items
- Goal: Add ability to clear all completed fire items at once
- Key files: src/hooks/useItems.ts (bulkDeleteItemsMutation), src/pages/Index.tsx (Clear Completed button)
- Changes: Added bulkDeleteItems mutation that processes multiple items; added "Clear Completed" button that appears when viewing completed fire items; button shows count of items and displays loading spinner during deletion; includes confirmation dialog before deletion; all items moved to trash before deletion
- UX: Button only visible when fire type is active and Completed filter is selected; disabled during deletion with animated spinner; shows success toast with item count
- Next: (completed ✅)
--------------------------------------------------
2025-11-04 – TanStack Query migration and status filter simplification
- Goal: Modernize data fetching with TanStack Query for better caching and performance
- Key files: src/App.tsx (QueryClientProvider), src/hooks/useItems.ts (useQuery/useMutation), src/components/StatusFilter.tsx, src/components/ItemList.tsx, src/pages/Index.tsx
- Changes: Wrapped app in QueryClientProvider with 5-min staleTime and 10-min cache; converted useItems from useState/useEffect to useQuery for fetching and useMutation for updates; implemented optimistic UI updates for instant feedback; removed "All" option from fire status filter (now defaults to "To Do"); cleaned up debug console.logs from WaterCalendar
- Benefits: Automatic cache invalidation, background refetching, optimistic updates for snappier UX, reduced boilerplate
- Next: (completed ✅)
--------------------------------------------------
2025-11-04 – parent item link navigation fix
- Goal: Fix bug where clicking parent item links navigated to blank page
- Key files: src/pages/ItemDetailPage.tsx (pass type to useItems)
- Issue: ItemDetailPage called useItems() without type parameter, causing query to be disabled and returning empty items array; existingItem lookup always failed
- Solution: Extract type from URL params and pass to useItems(typeParam) so items are fetched and existing item can be found by ID
- Next: (completed ✅)
--------------------------------------------------
2025-11-03 – recurring water items
- Goal: Enable weekly and yearly recurring events for water items
- Key files: supabase/migrations/20251103224411_add_recurrence_fields.sql (new migration), src/types/index.ts (RecurrenceType), src/pages/ItemDetail.tsx (recurrence UI), src/hooks/useItems.ts (CRUD with recurrence), src/components/WaterCalendar.tsx (generate recurring instances)
- Decisions: Added recurrence_type ('none'|'weekly'|'yearly') and optional recurrence_end_date; UI shows repeat selector and end date picker for water items with deadlines; calendar generates up to 2 years of future instances; weekly = every 7 days, yearly = same date each year
- Migration required: User must apply SQL migration in Supabase Dashboard (see MIGRATION_INSTRUCTIONS.md)
- Next: (completed ✅ - awaiting migration application)
--------------------------------------------------
2025-11-03 – unified calendar with fire todos
- Goal: Show fire task deadlines on water calendar for unified time management
- Key files: src/pages/Index.tsx (fetch fire items), src/components/WaterCalendar.tsx (merge events, type-aware navigation), src/components/WaterCalendar.css (fire event styling)
- Decisions: Water calendar now displays both water events (blue) and fire task deadlines (red); clicking events navigates to correct item type; fetch 200 fire items for calendar display; priority items get yellow glow for both types
- UX benefit: Unified view of all time-based items across element types
- Next: (completed ✅)
--------------------------------------------------
2025-11-03 – water calendar UX enhancements
- Goal: Streamline water calendar interface and add quick-create functionality
- Key files: src/pages/Index.tsx (remove overview tab), src/components/WaterCalendar.tsx (onSelectSlot handler), src/pages/ItemDetail.tsx (deadline URL param)
- Decisions: Removed Overview tab for water (agenda view in calendar serves same purpose); clicking empty calendar slots now opens new item form with that date pre-filled; calendar made selectable for better UX
- Next: (completed ✅)
--------------------------------------------------
2025-11-03 – water calendar default view
- Goal: Make calendar the default view when navigating to water items
- Key files: src/pages/Index.tsx (auto-switch logic)
- Decisions: Water auto-opens in calendar view; switching to water from other types triggers calendar view; leaving water resets to card view; URL params still respected if explicitly set
- Next: (completed ✅)
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

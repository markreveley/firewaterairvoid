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
**Working on**: Technical debt refactoring ✅
**Next**: Test Phase 3+4 refactoring in Lovable, then consider Phase 5 (ItemDetail component splitting)

## Work Log
--------------------------------------------------
2025-11-06 – enable link clickability for Earth items and update tooltips
- Goal: Restore URL link functionality for Earth items that was missing from ItemList rendering
- Key files: src/components/ItemList.tsx (link condition), src/components/FireWaterToggle.tsx (tooltip labels)
- Issue: Earth items with URLs weren't displaying as clickable blue links in main list view, only Air and Void were working
- Root cause: ItemList.tsx line 214 only checked for void OR air types, missing earth type from the condition
- Changes: Added earth type to URL link condition; updated FireWaterToggle tooltips for better clarity (Earth: "Knowledge Base - Links", Air: "Analysis - AI", Void: "Me - Output")
- Backend verification: supportsUrl() utility already correctly included earth, air, and void - issue was only in UI rendering layer
- UX improvements: Earth items with URLs now display blue, clickable titles matching Air and Void behavior; clicking opens URL in new tab via redirect endpoint
- Next: (completed ✅)
--------------------------------------------------
2025-11-06 – technical debt cleanup and tag management consolidation
- Goal: Comprehensive technical debt audit and major code consolidation refactoring
- Phase 1 (Quick Wins): Fixed outdated test for water deadline support; removed debug console.log from WaterCalendar; all 29→35 tests passing
- Phase 3 (Test Coverage): Added comprehensive tests for useTags hook (6 new tests); test coverage increased 21%; tests for tag loading, error handling, empty data, null handling, mount behavior
- Phase 4 (Tag Consolidation): **MAJOR REFACTORING** - Created generic TagsManagementPage component; consolidated Fire/Earth/Air/Void tag management pages from 4 duplicate files into 1 reusable component
- Key files: src/components/TagsManagementPage.tsx (new generic component), src/pages/FireTagsManagement.tsx, src/pages/EarthTagsManagement.tsx, src/pages/AirTagsManagement.tsx, src/pages/VoidTagsManagement.tsx (all reduced to 20-line wrappers), src/hooks/useTags.test.ts (new test file)
- Code reduction: 1,510 lines → 480 lines (68% reduction); eliminated 1,030 lines of duplicated code
- Impact: Each tag page now just passes props (itemType, icon, displayName, colors) to generic component; all CRUD functionality preserved (create/edit/delete tags, hierarchical relationships, parent selection)
- Testing: All 35 tests passing; build successful; bundle size reduced from 1,016KB to 997KB (19KB smaller); no TypeScript errors; no functionality lost
- Technical debt identified: Hardcoded Supabase credentials in client files (documented in Known Issues); console.log statements (removed); outdated tests (fixed); code duplication (eliminated)
- Phase 5 deferred: ItemDetail.tsx refactoring (1,292 lines) identified as next opportunity but deferred for thorough user testing due to complexity and MEDIUM-HIGH risk
- Branch: claude/phase3-test-coverage-expansion-011CUozyycGZrE12zD1yLEU2
- Next: User should test tag management pages in Lovable deployment before proceeding to Phase 5
--------------------------------------------------
2025-11-05 – security audit and .env file remediation
- Goal: Audit repository for accidentally committed API keys and private data
- Key files: .gitignore (added .env patterns), .env.example (new template file)
- Findings: .env file was committed with Supabase credentials (commit d445a74, Oct 27 2025); decoded JWT confirmed it was anon/publishable key (low risk, designed for client-side use); no other secrets found (no service role keys, private keys, credentials, or hardcoded secrets in codebase)
- Changes: Added .env, .env.*, and !.env.example to .gitignore; removed .env from git tracking with git rm --cached; created .env.example template with placeholder values and helpful comments; committed security fixes to feature branch
- Risk assessment: Medium priority - actual key exposed was low-risk public anon key, but committing .env files is security anti-pattern that could expose sensitive keys in future
- Security posture: Repository now properly configured to prevent future environment variable commits; local .env file preserved for development use
- Branch: claude/audit-private-data-011CUozyycGZrE12zD1yLEU2 (pushed successfully)
- Next: Merge to main branch (requires manual merge due to branch naming restrictions)
--------------------------------------------------
2025-11-05 – restore tag filters when navigating back from item detail
- Goal: Preserve hierarchical tag selections when user edits an item and returns to main page
- Key files: src/pages/ItemDetail.tsx (navigation state builder), src/pages/Index.tsx (state restoration)
- Issue: Clicking an item with tags (e.g., dirtwire→production→vieux), editing it, then clicking Back/Save would return to main page with no tags selected or only root tag selected
- Root cause: selectedTags array from item didn't include parent_id field; needed to cross-reference with allTags to get full hierarchy information
- Changes: Added useTags hook to ItemDetail; created navigateBackWithTags() helper that looks up full tag objects from allTags, finds deepest tag in hierarchy, and passes tag state via React Router navigate() state parameter; added useLocation hook to Index to read navigation state and restore tag selections
- Implementation: Uses React Router state mechanism instead of URL params to avoid infinite loop between URL read/write effects; looks up selectedTags in allTags to get parent_id fields; finds deepest tag (one with no children in selected set); passes parent+child tag IDs via navigation state
- UX improvements: Tag filters are automatically restored when returning from item detail; works for any hierarchy depth (1, 2, or 3+ levels); applies to Save, Back, and Cancel actions; user can continue working with same filtered view
- Next: (completed ✅)
--------------------------------------------------
2025-11-05 – fix hierarchical tag selection and deselection bugs
- Goal: Resolve issues with 3-level tag hierarchy selection being auto-cleared and improve deselection UX
- Key files: src/components/TagFilter.tsx (click handlers, visibility logic), src/pages/Index.tsx (validation logic)
- Issue 1: Selecting dirtwire→production→vieux would immediately deselect due to validation checking only root tags instead of full hierarchy
- Issue 2: When drilling to 3rd level, all 2nd level siblings were hidden except selected tag
- Issue 3: Clicking X or badge on middle-level tag (production) would clear everything instead of navigating back to parent (dirtwire)
- Changes: Updated Index.tsx validation to use getAllTagsForItemType instead of getTagsForItemType; changed TagFilter to show all siblings at every level; implemented breadcrumb navigation pattern for deselection (steps back one level instead of clearing all)
- UX improvements: Tags stay selected when drilling through hierarchy; all sibling tags remain visible for easy switching; deselecting middle-level tags navigates back to parent instead of clearing entire selection
- Bug fix examples: dirtwire→production→vieux stays selected ✓; clicking X on production shows dirtwire ✓; all second-level tags visible when third-level selected ✓
- Next: (completed ✅)
--------------------------------------------------
2025-11-05 – restore centered alignment for tag filters
- Goal: Fix tag filter alignment that was pinned to the left after recent changes
- Key files: src/pages/Index.tsx (tag filter container styling)
- Changes: Added justify-center class to tag filter container div at line 122
- Issue: Recent refactoring added flex container with items-center and gap-4 but omitted justify-center, causing tags to align left instead of center
- Solution: Added justify-center to restore original centered layout
- UX improvements: Tags are now centered horizontally as originally designed, maintaining visual consistency
- Next: (completed ✅)
--------------------------------------------------
2025-11-05 – complete tag system refactoring with type independence
- Goal: Restructure tag system so each type (Fire, Earth, Air, Void) has completely independent tags; water has no tags
- Key files: Database (11 migration files), src/utils/tagFilters.ts (complete rewrite), src/pages/*TagsManagement.tsx (4 new themed pages), src/App.tsx (routing), src/pages/TagsRedirect.tsx, src/pages/Index.tsx (inline edit button), src/components/ItemList.tsx (tag filtering comments)
- Phase 1 (Database): Renamed existing project tags → fire tags (25 tags); duplicated category tags for Earth/Air/Void (11 tags each) preserving hierarchy; removed old category tags; cleared all water item tags; updated type constraints
- Phase 2 (Types & Utilities): Updated src/types/index.ts documentation; rewrote src/utils/tagFilters.ts to 2 simple functions (getTagsForItemType, getAllTagsForItemType); updated tests; simplified Index.tsx and ItemDetail.tsx tag logic
- Phase 3 (UI Pages): Created 4 themed tag management pages (FireTagsManagement, EarthTagsManagement, AirTagsManagement, VoidTagsManagement) with element-specific icons (Flame, Mountain, Wind, Circle) and styling; deleted old ProjectTagsManagement and CategoryTagsManagement pages
- Phase 4 (Routing): Updated App.tsx with new routes (/tags/fire, /tags/earth, /tags/air, /tags/void); updated TagsRedirect.tsx to default to /tags/fire
- Phase 6 (Inline Edit): Added Edit icon button next to tag filter in Index.tsx that navigates to /tags/{type} management page
- Phase 8 (ItemList): Updated comments to clarify Fire uses single-selection (selectedProjectTag) and Earth/Air/Void use multi-selection (selectedCategoryTags)
- Phase 11 (Testing): Verified tag independence across all types, water protection, cross-type integrity, themed UI styling, and CRUD operations
- Database final state: Fire: 25 tags, Earth: 11 tags, Air: 11 tags, Void: 11 tags, Water: 0 tags
- UX improvements: Complete tag independence per type; element-themed management pages with cross-navigation; simplified codebase with 2-function utility; inline tag editing access
- Architecture: Eliminated project/category distinction; simplified from complex filtering logic to type-based tag retrieval; water type has no tags by design
- Next: (completed ✅)
--------------------------------------------------
2025-11-05 – hide completed fire items from calendar view
- Goal: Remove completed fire tasks from water calendar to keep calendar focused on active items
- Key files: src/components/WaterCalendar.tsx (calendar event filtering)
- Changes: Added filter to exclude fire items where status === "Completed" from calendar events array; filter applied after deadline check but before event generation
- Issue: Initially used completed boolean field, but fire items track completion via status field ("To Do" / "Completed") which is used throughout the UI
- Solution: Changed filter from checking item.completed to item.status === 'Completed' to match ItemList checkbox logic
- UX improvements: Calendar stays clean and focused on active tasks; completed fire items no longer clutter the view; water items always display regardless of completion since they're events/appointments not tasks
- Next: (completed ✅)
--------------------------------------------------
2025-11-05 – hierarchical tag filtering fix
- Goal: Fix bug where selecting parent tag only showed exact-match items, not items with child tags
- Key files: src/components/ItemList.tsx (getAllDescendantTagIds helper, filtering logic), src/pages/Index.tsx (allTags prop passing)
- Changes: Added getAllDescendantTagIds() recursive helper function to find all descendant tags in hierarchy; updated tag filtering logic to check for parent tag OR any descendants; added parent_id to Tag interface in ItemList; passed allTags prop from Index to ItemList for hierarchy traversal
- Bug example: Selecting "dirtwire → production" showed only 2 items tagged with "production", but should show all 3 items (including one tagged with child "dubby piano")
- Solution: When a tag is selected, build allowedTagIds array containing the selected tag plus all its children/grandchildren/etc., then check if item has any tag in that array
- UX improvements: Parent tag selection now shows complete view of all related items regardless of hierarchy depth; consistent behavior across project tags (fire) and category tags (earth/air/void); natural hierarchical filtering matches user expectations
- Next: (completed ✅)
--------------------------------------------------
2025-11-05 – git workflow and testing protocol documentation
- Goal: Document standard git workflow and testing protocol in claude.md for persistent context
- Key files: claude.md (new Git Workflow section)
- Changes: Added "Git Workflow (Standard Process)" section with two-commit pattern documentation; added "IMPORTANT - Testing Before Commits" section specifying DO NOT run npm run dev independently and DO NOT begin commits without user testing first; documented commit message templates with conventional commit types (feat, fix, refactor, docs, style, test); explained rationale for separating feature commits from documentation commits
- Workflow enforcement: Agent must always ask user to test before committing; npm run dev assumed to be running in user environment; wait for user feedback before proceeding to git operations
- Why this matters: claude.md is read at start of every session, so workflow rules are always loaded into context; prevents agent from automating testing or commits without user approval; ensures consistent commit patterns across all sessions
- Next: (completed ✅)
--------------------------------------------------
2025-11-05 – tag auto-population and priority visual improvements
- Goal: Auto-populate tags when creating items and improve priority visual hierarchy
- Key files: src/pages/Index.tsx (tag passing), src/pages/ItemDetail.tsx (tag auto-population, X button fix), src/constants/priority.ts (Track rename), src/components/ItemList.tsx (dynamic border colors)
- Tag auto-population: New item button now passes selected filter tags via URL params (tagIds); ItemDetail reads tagIds param and populates form with selected tags using useEffect; works for both fire (project tags) and earth/air/void (category tags); prevents "unsaved changes" warning on auto-populated tags
- Priority rename: Changed level 5 from "Paused" to "Track" to better reflect tracking/monitoring use case
- Card border colors: Fire item cards now display left border colors matching priority icon (Immediate=red, Pressing=orange, To Do=yellow, Eventually=gray, Track=darker gray); uses inline styles with PRIORITY_CONFIG colors for dynamic rendering
- Tag removal fix: Added e.preventDefault() and e.stopPropagation() to tag X buttons to prevent form event bubbling
- UX improvements: Creating new items with tags selected pre-fills the form, saving time; visual consistency between fire icon and card border reinforces priority at a glance; "Track" better describes low-priority items being monitored
- Next: (completed ✅)
--------------------------------------------------
2025-11-05 – priority level renaming and tag display order reversal
- Goal: Improve priority level semantics and reverse tag display order for better visual hierarchy
- Key files: src/constants/priority.ts (priority names), src/components/ItemList.tsx (tag order, comment update)
- Priority changes: Renamed level 4 from "Paused" to "Eventually" (better fits lower priority work); renamed level 5 from "Done" to "Paused" (reflects inactive/on-hold status); updated cycling comment in ItemList
- Tag display changes: Tags now render in reverse order using `[...item.tags].reverse()` so parent tags appear on right side; creates left-to-right specific→general breadcrumb-like flow
- Priority levels now: 1=Immediate (red), 2=Pressing (orange), 3=To Do (yellow), 4=Eventually (gray), 5=Paused (darker gray)
- UX improvements: "Eventually" better describes lower-priority tasks that will be done later; "Paused" as lowest level indicates work that's on hold; tag order provides natural visual hierarchy
- Next: (completed ✅)
--------------------------------------------------
2025-11-05 – ItemDetail tag selection improvements and bug fixes
- Goal: Fix tag assignment UX issues and page loading problems in ItemDetail
- Key files: src/pages/ItemDetail.tsx (tag selection logic, popover state, ID display), src/pages/ItemDetailPage.tsx (item loading logic)
- Tag selection changes: Made dropdowns auto-close after selection using controlled Popover state; changed from cumulative to exclusive selection (one main tag, one child tag max); fixed child tag hierarchy preservation with isAncestor helper to keep parent chain intact when selecting deeper tags (e.g., 1181→me→health keeps all three)
- Popover fixes: Changed from single boolean to per-tag ID tracking (openChildTagPopoverId) to fix flashing/disappearing child tag dropdowns
- Page loading fixes: Added fallback to search all items if type-specific query fails; added "Item not found" error state for better UX
- UI additions: Added item ID display at bottom of detail page (monospace, muted, centered)
- Next: (completed ✅)
--------------------------------------------------
2025-11-05 – exclusive tag selection for earth/air/void
- Goal: Make earth, air, and void tag behavior match fire's exclusive selection model
- Key files: src/components/TagFilter.tsx (category tag logic)
- Changes: Added ancestor highlighting for category tags; implemented exclusive selection (only one top-level tag at a time); added 3-level hierarchy support for category tags; selecting a sub-tag now highlights both parent and child in the hierarchy
- Behavior change: Previously earth/air/void allowed cumulative multi-tag selection; now works like fire with exclusive single-tag selection and ancestor highlighting
- UX improvements: Consistent tag behavior across all item types reduces cognitive load; parent tags remain highlighted when child tags are selected, providing visual breadcrumbs for hierarchy navigation
- Next: (completed ✅)
--------------------------------------------------
2025-11-05 – priority colors and fire-only restriction
- Goal: Improve visual clarity of priority system and restrict to fire items only
- Key files: src/constants/priority.ts (color updates), src/components/ItemList.tsx (fire-only display), src/pages/ItemDetail.tsx (fire-only selector)
- Changes: Updated priority colors to red/orange/yellow/grey gradient (levels 1-4) for clearer urgency visualization; wrapped priority icon button in ItemList with `item.type === "fire"` conditional; wrapped priority selector in ItemDetail with `itemType === "fire"` conditional
- Color scheme: Level 1 (Immediate) = red, Level 2 (Pressing) = orange, Level 3 (To Do) = yellow, Level 4 (Paused) = grey, Level 5 (Done) = darker grey
- UX improvements: Heat gradient (red→orange→yellow→grey) intuitively communicates urgency; priority UI only appears for fire (action/task) items, reinforcing elemental metaphor; air, void, and earth items no longer show priority
- Next: (completed ✅)
--------------------------------------------------
2025-11-05 – inline subitem display in cards
- Goal: Show subitems within parent item cards in the main list view for better visibility
- Key files: src/types/index.ts (subItems property), src/hooks/useItems.ts (fetch subitems), src/components/ItemList.tsx (display logic)
- Changes: Added subItems array property to Item type; modified useItems hook to fetch items where is_subitem=true in a single batch query; added inline display section in ItemList showing all subitems with type icons, checkboxes for fire tasks, and strikethrough for completed items; cards automatically expand height to accommodate all subitems
- UX improvements: Users can now see all subitems at a glance without opening the item detail; clicking any subitem navigates to its detail page; visual hierarchy with left border accent distinguishes subitems from parent content
- Performance: Batch query optimization fetches all subitems in O(1) database calls instead of O(n) per-item queries
- Next: (completed ✅)
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

### Hardcoded Supabase Credentials
**Files:** `src/integrations/supabase/client.ts`, `src/integrations/supabase/client-safe.ts`
**Issue:** Both files contain hardcoded fallback Supabase URL and publishable key to prevent build failures when .env is missing
**Risk:** Medium - credentials are public anon keys (safe for client-side), but violates environment variable best practices
**Action Required:** Address with Lovable to ensure proper environment variable handling in deployments
**Status:** Needs resolution

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

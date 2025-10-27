# Fire Water Design & Architecture

## Core Concept

Fire Water is a task/project management application that organizes items into five elemental types: **fire**, **water**, **air**, **void**, and **earth**. Each type serves different purposes and has different behaviors.

## Elemental Types

### Fire (Actions/Tasks)
- Urgent, actionable tasks
- Has status: "To Do" / "Completed"
- Has deadlines with time
- Uses project tags only
- Priority system with star icon
- Sub-items for breaking down tasks

### Water (Writing/Projects)
- Long-form content, notes, projects
- Supports both project and category tags
- Markdown notes with preview
- Can have sub-items (notes, tasks, URLs)

### Void (Web URLs)
- Bookmarks, links, references
- Requires URL field
- Uses category tags only
- Can have sub-items (related links, notes)

### Air (Analysis)
- Analytical content
- Uses category tags only
- Can have sub-items

### Earth (How-to/Documentation)
- Guides, documentation
- Uses category tags only
- Can have sub-items

## Critical Architectural Distinction: Parent/Child vs Sub-Items

**This is the most important design decision to understand:**

### Two Different Relationship Types

#### 1. Parent/Child Relationships (Hierarchical Links)
- **Purpose**: Link items together in organizational hierarchies
- **How**: User selects "Parent Item" in item detail page
- **Field**: `parent_id` (but `is_subitem = false`)
- **Visibility**: Both items appear as cards in main view
- **UI**: Up/down arrow navigation between related items
- **Use case**: "Project A" has child "Task 1", "Task 2" - all are full items
- **Example**: Water project "Book Outline" → Fire task "Write Chapter 1"

#### 2. Sub-Items (Scoped Content)
- **Purpose**: Create subordinate tasks/notes/links scoped ONLY to parent
- **How**: User creates via "Items" tab in item detail page
- **Field**: `parent_id` (and `is_subitem = true`)
- **Visibility**: ONLY appears in parent's Items tab, never as standalone card
- **UI**: List within parent's Items tab with type selector (Task/URL/Note)
- **Use case**: Break down a task into sub-tasks, add reference URLs, add quick notes
- **Example**: Fire task "Plan Wedding" → sub-items: "Book venue", "Order cake", "guest-list.pdf"

### Database Schema for Relationships

```typescript
items {
  id: uuid
  title: string
  type: 'fire' | 'water' | 'air' | 'void' | 'earth'
  parent_id: uuid | null  // References another item
  is_subitem: boolean     // TRUE = sub-item (scoped), FALSE = child item (hierarchical)

  // When parent_id IS set AND is_subitem IS true:
  //   → Sub-item: only in parent's Items tab

  // When parent_id IS set AND is_subitem IS false:
  //   → Child item: appears as card with parent/child arrows

  // When parent_id IS null:
  //   → Top-level item: appears as card in main view
}
```

### Query Logic

**Main list queries** (useItems.ts):
```javascript
// Only fetch top-level items OR child items (not sub-items)
.is("parent_id", null)
.or(`is_subitem.eq.false`)
```

**Children query** (for arrows on cards):
```javascript
// Only fetch child items (not sub-items)
.in("parent_id", itemIds)
.eq("is_subitem", false)
```

**Items tab query** (in ItemDetail):
```javascript
// Only fetch sub-items
.eq("parent_id", parentItemId)
.eq("is_subitem", true)
```

## Tag System Architecture

### Two Tag Types
- **Project tags**: Used by Fire and Water items
- **Category tags**: Used by Water, Air, Void, Earth items

### Hierarchical Tags
- Tags can have parent/child relationships via `parent_id`
- Unique constraint: `(name, parent_id)` - same name allowed under different parents
- Root tags shown in main filters, child tags accessible via parent selection

## Priority System

- `priority` field (integer): 0 = normal, 1+ = starred/high priority
- Star icon on item cards to toggle
- Sort order: Priority DESC → Deadline ASC → Created At DESC
- Starred items bubble to top of any list

## UI Patterns

### Item Detail Page Structure
```
[Title input]
[Type selector] [Status OR Parent Item selector]
[Parent Item selector (if Fire)] [Deadline (if Fire)]
[URL (if Void/Water/Air)]
[Tags selectors (based on type)]

[Tabs: Notes | Items]
  → Notes tab: Markdown textarea with preview
  → Items tab: Sub-items list with Task/URL/Note type selector
```

### Items Tab Behavior
- **Disabled for new items**: Shows "(Save first)" until item saved
- **Auto-navigates**: After saving new item, navigates to edit view to enable tab
- **Auto-selects**: Opens to Items tab if item has existing sub-items
- **Three sub-item types**:
  - Task (fire): Checkbox + input
  - URL (void): Title + URL fields
  - Note (water): Simple input

## Data Flow

### Creating Sub-Item
1. User in ItemDetail → Items tab
2. Selects type (Task/URL/Note)
3. Enters data, clicks +
4. `handleAddSubItem` calls `onAddItem` with `parent_id` set
5. `handleAddItem` in ItemDetailPage checks `parent_id` exists
6. Calls `addItem` with `is_subitem: true`
7. Database creates item with `parent_id` and `is_subitem=true`
8. Query reloads, sub-item appears ONLY in Items tab

### Creating Child Item (Hierarchical)
1. User in ItemDetail for any item
2. Uses "Parent Item" selector
3. Selects another item as parent
4. Saves
5. Database creates item with `parent_id` and `is_subitem=false`
6. Both items appear as cards with up/down arrow navigation

## Migration Path

To implement `is_subitem` distinction:
1. Add `is_subitem` boolean column (default false)
2. Existing items with `parent_id`: Keep `is_subitem=false` (preserve relationships)
3. New sub-items via Items tab: Set `is_subitem=true`
4. Update all queries to check `is_subitem` flag
5. Update UI to handle both types properly

## Why This Design?

**Problem**: Using only `parent_id` conflates two distinct use cases
- Organizational hierarchy (parent/child)
- Task decomposition (sub-items)

**Solution**: Add semantic flag to distinguish intent
- Preserves flexibility of both features
- Clear query logic
- Intuitive user mental model
- Backwards compatible (existing data stays as child items)

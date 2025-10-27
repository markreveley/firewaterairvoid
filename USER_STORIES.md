# Fire Water User Stories

## Core User Workflows

### 1. Creating a Fire Task

**As a user, I want to create urgent actionable tasks so I can track what needs to be done immediately.**

**Steps:**
1. Click "+" button (or go to Fire view and click "+")
2. Enter task title (e.g., "Call dentist")
3. Select type: Fire
4. Set status: "To Do"
5. Set deadline with time (optional)
6. Assign project tag (e.g., "Personal")
7. Click Save or Back
8. Task appears as card in Fire view

**Acceptance criteria:**
- Task shows checkbox (unchecked for "To Do", checked for "Completed")
- Deadline shows in red if overdue
- Clicking checkbox toggles status
- Star icon allows marking as priority

---

### 2. Breaking Down a Task with Sub-Items

**As a user, I want to break down a large task into smaller sub-tasks so I can manage complexity.**

**Steps:**
1. Open existing Fire task (e.g., "Plan wedding")
2. Click "Items" tab
3. Type selector shows: Task | URL | Note
4. Select "Task"
5. Enter sub-task (e.g., "Book venue")
6. Click "+" or press Enter
7. Sub-task appears in list with checkbox
8. Repeat for more sub-tasks

**Acceptance criteria:**
- Sub-tasks ONLY appear in parent's Items tab
- Sub-tasks do NOT appear as cards in main Fire view
- Checking sub-task checkbox marks it complete
- Can navigate to sub-task detail by clicking row
- Items tab shows "(Save first)" for unsaved items
- Items tab auto-opens when item has sub-items

---

### 3. Adding Reference URLs to a Task

**As a user, I want to attach reference links to a task so I can access related resources.**

**Steps:**
1. Open existing task
2. Click "Items" tab
3. Select "URL" from type selector
4. Enter title (e.g., "Venue options")
5. Enter URL (e.g., "https://venues.com")
6. Click "+"
7. URL appears in sub-items list

**Acceptance criteria:**
- URL sub-items ONLY in Items tab
- Both title and URL fields required
- URL opens in new tab when clicked

---

### 4. Organizing Projects Hierarchically

**As a user, I want to link related items together so I can see project structure.**

**Scenario:** I have a Water project "Book Outline" and want to link Fire tasks to it.

**Steps:**
1. Create Water item: "Book Outline"
2. Create Fire task: "Write Chapter 1"
3. In "Write Chapter 1" detail view
4. Use "Parent Item" selector
5. Select "Book Outline"
6. Save
7. Both items appear as cards in main view
8. "Write Chapter 1" shows up-arrow to "Book Outline"
9. "Book Outline" shows down-arrow to "Write Chapter 1"

**Acceptance criteria:**
- Both items visible as cards
- Navigation arrows work
- Can have multiple children per parent
- Can view child from parent card (click arrow or "..." menu)
- Child items appear in main list (not hidden)

**Contrast with sub-items:**
- Parent/Child: Both are full items, both in main view, arrows show relationship
- Sub-items: Child hidden, only in Items tab, no arrows

---

### 5. Prioritizing Items

**As a user, I want to mark important items so they appear first in my lists.**

**Steps:**
1. Find item card in main view
2. Click star icon (next to tags)
3. Star fills yellow
4. Item moves to top of list
5. Click star again to remove priority

**Acceptance criteria:**
- Priority items sorted first
- Then by deadline (earliest first)
- Then by creation date (newest first)
- Star visible and clickable on all item cards

---

### 6. Using Tags to Filter

**As a user, I want to filter items by project/category so I can focus on specific work.**

**Fire items (project tags):**
1. Go to Fire view
2. Select project tag (e.g., "Tourlab")
3. Only "Tourlab" tasks visible
4. Can select child tag for finer filtering

**Water items (both tag types):**
1. Go to Water view
2. Select project tag (e.g., "Dirtwire")
3. Add category tags (cumulative: "Writing", "Technical")
4. Only items with ALL selected tags visible

**Acceptance criteria:**
- Fire: project tags only (exclusive)
- Water: project + category tags (cumulative)
- Air/Void/Earth: category tags only (cumulative)
- URL params preserve filter state
- Tags visually indicate which item types they work with

---

### 7. Managing Long-Form Content in Water Items

**As a user, I want to write and preview markdown notes.**

**Steps:**
1. Create Water item: "Project Proposal"
2. Notes tab is selected by default (if no sub-items)
3. Write markdown text
4. Click "Preview" button
5. See rendered markdown
6. Click "Back to Edit" to continue writing

**Acceptance criteria:**
- Textarea supports multi-line
- Preview shows full-page rendered markdown
- Can toggle between edit and preview
- Notes auto-save when saving item

---

### 8. Creating Sub-Notes

**As a user, I want to add quick notes to an item without writing in the main notes field.**

**Use case:** Fire task "Client meeting" needs agenda items

**Steps:**
1. Open "Client meeting" task
2. Click Items tab
3. Select "Note" type
4. Type "Discuss pricing" and press Enter
5. Type "Review timeline" and press Enter
6. Each note appears as line item

**Acceptance criteria:**
- Note sub-items are simple text entries
- Appear only in Items tab
- Can click to view/edit full note (navigates to detail)
- Different from main Notes field (which is long-form)

---

### 9. Working with Void Items (Bookmarks)

**As a user, I want to save and organize web links.**

**Steps:**
1. Create Void item
2. Enter title: "React Documentation"
3. Enter URL: "https://react.dev"
4. Assign category tags: "Development", "Reference"
5. Save
6. Item appears in Void view
7. Clicking title opens URL in new tab

**Acceptance criteria:**
- URL field required for Void items
- URL opens in redirect page (tracks clicks)
- Can add sub-items (related links, notes)
- Category tags only (no project tags)

---

### 10. Item Detail Auto-Navigation

**As a user, I want the UI to automatically show relevant content.**

**Scenario 1: Creating new item**
1. Click "+" to add item
2. Enter title, set properties
3. Items tab is grayed out: "Items (Save first)"
4. Click Save
5. **Auto-navigates to edit view**
6. Items tab now enabled
7. Can immediately add sub-items

**Scenario 2: Opening item with sub-items**
1. Click card for item that has sub-items
2. **Items tab auto-selected**
3. Sub-items list immediately visible
4. Can switch to Notes if needed

**Acceptance criteria:**
- New items navigate to edit after save
- Items tab auto-selects when children exist
- Notes tab default when no children
- User can manually switch tabs anytime

---

## Feature Comparison Table

| Feature | Parent/Child Items | Sub-Items |
|---------|-------------------|-----------|
| **Purpose** | Organizational hierarchy | Task decomposition |
| **Created via** | "Parent Item" selector | "Items" tab + type selector |
| **Visibility** | Both appear as cards | Only in Items tab |
| **Navigation** | Up/down arrows | Click to detail |
| **Types** | Any → Any | Task/URL/Note |
| **Use case** | Link related projects | Break down task |
| **Database** | parent_id + is_subitem=false | parent_id + is_subitem=true |

---

## User Mental Model

**Think of it like a file system:**

- **Parent/Child Items** = Shortcuts/links
  - Project folder has link to Task file
  - Both visible in their respective folders
  - Link icon shows relationship

- **Sub-Items** = Contents of a file
  - Task file has bullet points inside it
  - Only visible when you open the file
  - Not visible in folder view

**Example:**

```
📁 Fire (main view - cards visible)
  📄 Plan Wedding [Fire task] ⭐
    ↓ [child] Book Venue [Fire task]
    ↓ [child] Order Cake [Fire task]

  [Click "Plan Wedding" → Items tab]
  📋 Sub-items (only visible here):
    ☐ Call venues by Friday
    ☐ Get price quotes
    🔗 Venue comparison sheet (URL)
    📝 Dietary restrictions note
```

---

## Edge Cases & Rules

### Rule 1: Sub-items cannot have sub-items
- Sub-items are leaf nodes
- Cannot create sub-items of sub-items
- **Why**: Prevents infinite nesting complexity

### Rule 2: Parent/child can be any type combination
- Fire task can have Water project as parent
- Void URL can have Air analysis as parent
- **Why**: Flexible organizational structure

### Rule 3: Items tab disabled for unsaved items
- Must save parent before adding sub-items
- **Why**: Need database ID to set parent_id

### Rule 4: Sub-items inherit nothing from parent
- Have own type, tags, properties
- Not constrained by parent's type
- **Why**: Sub-tasks might be different types (task, URL, note)

### Rule 5: Deleting parent
- **Child items**: Remain as top-level items (parent_id set to null)
- **Sub-items**: Deleted cascade (cannot exist without parent)
- **Why**: Different purposes require different deletion behaviors

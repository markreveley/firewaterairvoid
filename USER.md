# Working with Claude Code - User Guide

This document explains how to work effectively with Claude Code using our context management workflow.

## Core Philosophy

> **"Git is the real long-term memory; plan.md is the index to that memory."**

- **Git commits** preserve all decisions, code, and reasoning permanently
- **plan.md** provides a lightweight index (~150 lines) pointing to detailed docs
- **Detailed docs** (DESIGN.md, USER_STORIES.md, STRATEGY.md) contain architecture and strategy
- **Work log** maintains a breadcrumb trail of recent work (last 5-7 units)

## The Context Problem

Claude Code keeps the entire conversation history in its context window. As conversations grow, this becomes expensive and eventually hits limits. The solution is **not** to endlessly expand context, but to:

1. **Work efficiently** within a session using compact outputs
2. **Commit frequently** to preserve work in git
3. **Start fresh sessions** when logical units complete
4. **Use plan.md as the index** to ramp up quickly in new sessions

## Your Decision Tree

### 1. Still Actively Working (Mid-Session)

**When**: You're iterating on a feature, debugging, or making multiple related changes

**Do**:
- Continue in same session
- If context feels full, type **"compact"** or **"context-low"**
- Claude will switch to terse outputs (≤30 lines, prefer `grep` over full file reads)
- Keep working until the logical unit is complete

**Don't**:
- Ask Claude to "forget" or "clear context" - it will just re-read files when needed
- Prematurely commit half-finished work just to save context

### 2. Finished a Logical Unit

**When**: Feature complete, bug fixed, refactor done - something you'd code-review in one sitting

**Do**:
a. **Add work log entry** to bottom of plan.md using this template:
```
--------------------------------------------------
YYYY-MM-DD – <unit-name>
- Goal: <one line>
- Key files: <list max 3>
- Decisions: <max 2 lines>
- Next: <max 1 line>
--------------------------------------------------
```

b. **Commit and push**:
```bash
git add .
git commit -m "feat: <description>"
git push
```

c. **Optional**: Type `/quit` to end session, start new thread with just the "Current Status" section from plan.md

**Why**: Each commit = natural restart point. Git preserves everything, new session starts clean.

### 3. Emergency Token Wall (>90%)

**When**: Claude reports context is critically full or outputs become slow/truncated

**Do**:
1. Type **"/compact"** to summarize and end session
2. Commit current work (even if incomplete)
3. Start fresh thread
4. Paste "Current Status" section from plan.md
5. Claude will read plan.md and other docs to ramp up

## Practical Commands

### What You Can Type

| Command | Effect |
|---------|--------|
| `compact` | Claude switches to COMPACT-MODE (terse outputs) |
| `context-low` | Same as above |
| `oom` | Same as above (out of memory) |
| `/compact` | End session with summary |
| `/quit` | End session cleanly |

### What Claude Will Do in COMPACT-MODE

- Return ≤30 lines of tool output unless you ask for more
- Prefer `grep`, `head`, `cut` instead of `cat` (reading full files)
- Ask before showing >500 lines: "Show all (≈X tokens) or summarise?"
- Suggest collapsing large functions in-place with summary comments

## File Structure Guide

### plan.md (This Changes Frequently)
- **Purpose**: Lightweight index, current status, recent work log
- **Length**: Keep ~150 lines
- **Updates**: After every commit (add work log entry)
- **Prune**: When >200 lines or >10 work log entries, move old entries to `docs/archive/`

### DESIGN.md (Stable)
- **Purpose**: Architecture decisions, technical rationale, database schema
- **Updates**: When architecture changes (rare)
- **Content**: Parent/child vs sub-items, tag system, data model

### USER_STORIES.md (Stable)
- **Purpose**: User workflows, feature descriptions, edge cases
- **Updates**: When new features added
- **Content**: Detailed user scenarios with steps

### STRATEGY.md (Stable)
- **Purpose**: Business strategy, pricing analysis
- **Updates**: When business model changes
- **Content**: Market analysis, pricing tiers, commercialization

### Work Log Format

Always use this exact format for consistency:
```
--------------------------------------------------
YYYY-MM-DD – <unit-name>
- Goal: <one line explaining what you set out to do>
- Key files: <max 3 most important file paths>
- Decisions: <max 2 lines of key architectural/technical decisions>
- Next: <max 1 line describing what comes next, or "(completed)">
--------------------------------------------------
```

**Example**:
```
--------------------------------------------------
2025-10-27 – is_subitem distinction
- Goal: Separate parent/child relationships (hierarchical links) from sub-items (scoped content)
- Key files: supabase/migrations/20251027180000_add_is_subitem_flag.sql, src/hooks/useItems.ts, DESIGN.md
- Decisions: Added boolean flag instead of overloading parent_id semantics; documented in DESIGN.md
- Next: Run migration via Lovable, test both relationship types independently
--------------------------------------------------
```

## Maintenance Tasks

### Monthly (or when plan.md > 200 lines)

1. **Archive old work log entries**:
```bash
mkdir -p docs/archive
# Create archive file
cp plan.md docs/archive/plan-2025-10.md
# Edit plan.md to keep only last 5-7 work log entries
# Edit archive file to remove current entries
git add .
git commit -m "docs: archive old work log entries"
git push
```

2. **Review other docs**:
- DESIGN.md: Still accurate? Any stale sections?
- USER_STORIES.md: New features to document?
- STRATEGY.md: Business model still current?

### When Starting a New Session

If you're starting fresh (after `/quit` or new day):

1. **Paste Current Status** from plan.md into chat
2. Claude will read plan.md automatically
3. Claude can read other docs (DESIGN.md, etc.) if needed for context
4. Start working immediately

## Best Practices

### ✅ DO

- **Commit after every logical unit** (one feature/bug/refactor)
- **Write clear commit messages** that explain the "why"
- **Add work log entry** for each commit
- **Keep plan.md lightweight** (~150 lines)
- **Point to detailed docs** instead of duplicating content
- **Prune work log** when it exceeds 10 entries
- **Use COMPACT-MODE** when context feels heavy

### ❌ DON'T

- **Don't ask Claude to "clear context" mid-session** (it will just re-read files)
- **Don't create new docs** without reason (each doc = more context)
- **Don't skip work log entries** (they're your breadcrumb trail)
- **Don't batch multiple unrelated changes** in one commit
- **Don't let plan.md grow unchecked** (defeats the "lightweight index" purpose)

## Why This Works

### The Problem with Traditional Approaches

1. **Long-running sessions**: Context bloats, Claude becomes slow, outputs truncated
2. **No memory**: Starting fresh means re-explaining everything
3. **Scattered docs**: Information spread across many files, hard to navigate

### How This Solves It

1. **Git as memory**: All code, decisions, reasoning preserved permanently and searchable
2. **plan.md as index**: Quick scan (150 lines) gives Claude everything needed to start
3. **Detailed docs for deep dives**: Architecture, user stories, strategy available when needed
4. **Work log as breadcrumbs**: Recent work visible at a glance
5. **Natural restart points**: Each commit = clean break, can resume anytime

### The Unix Philosophy

"Do one thing well" - each doc has a singular purpose:
- Git: Permanent storage
- plan.md: Quick index
- DESIGN.md: Architecture deep dive
- USER_STORIES.md: Feature workflows
- STRATEGY.md: Business context

## Troubleshooting

### "Claude is being too verbose"
→ Type **"compact"** to switch to terse mode

### "Claude keeps reading the same files"
→ This is normal during active work. If it's excessive, type **"compact"** and ask for suggestions on what to collapse

### "I want to change direction mid-session"
→ It's fine! Just keep working. Commit when you reach a logical stopping point

### "I forgot to add work log entry before committing"
→ Add it in the next commit: `git commit --allow-empty -m "docs: add missing work log entry"`

### "plan.md is over 200 lines"
→ Time to prune. Move old work log entries to `docs/archive/plan-YYYY-MM.md`

### "I don't remember what I was working on"
→ Check the work log at bottom of plan.md, or run `git log --oneline -10`

## Quick Start Checklist

Starting a new feature? Follow this flow:

- [ ] Start working (Claude reads plan.md automatically)
- [ ] If context heavy, type **"compact"**
- [ ] When feature complete, add work log entry to plan.md
- [ ] Commit: `git add . && git commit -m "feat: description" && git push`
- [ ] Optional: `/quit` and start new thread for next feature

That's it! The system works for you, not the other way around.

---

**Remember**: The goal is to work efficiently, not to create perfect documentation. When in doubt, commit more frequently and keep docs minimal.

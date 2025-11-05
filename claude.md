# Claude Code Project Instructions

## 🚀 On Every New Session: READ THIS FIRST

When starting a new conversation, you (Claude) should:

1. **Read plan.md** - Contains current status, work log, and agent instructions
2. **Read any docs mentioned** in Current Status if needed for context

## 🤖 Agent Responsibilities (Quick Reference)

**After EVERY commit:**
- Update plan.md with work log entry
- Update "Current Status" section
- Commit plan.md changes
- DO NOT wait for user to request this

**When context is low ("compact", "context-low", "oom"):**
- Return ≤30 lines of tool output
- Prefer `grep`, `head` over full file reads
- Ask before showing >500 lines

**Memory Model:**
- Git = real long-term memory (permanent, searchable)
- plan.md = lightweight index (~150 lines)
- Detailed docs = DESIGN.md, USER_STORIES.md, STRATEGY.md

## 📝 Git Workflow (Standard Process)

**IMPORTANT - Testing Before Commits:**
- **DO NOT** run `npm run dev` (it's always running in user's environment)
- **DO NOT** begin the commit phase independently
- **ALWAYS** tell the user to test the changes first
- **WAIT** for user to relay test results
- **THEN** proceed to git commit workflow

**Two-Commit Pattern** - Use this workflow after making code changes:

1. **Commit 1: Feature/Fix Commit**
   ```bash
   git add <changed files>
   git commit -m "type: descriptive summary

   - Bullet point of key change
   - Another key change
   - Brief explanation of why

   🤖 Generated with [Claude Code](https://claude.com/claude-code)

   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```
   **Commit types**: `feat:`, `fix:`, `refactor:`, `docs:`, `style:`, `test:`

2. **Update plan.md**
   - Add work log entry at the top of Work Log section
   - Use template: date, goal, key files, changes, UX improvements, next steps
   - Update "Current Status" if needed

3. **Commit 2: Documentation Commit**
   ```bash
   git add plan.md
   git commit -m "docs: update plan.md with [feature name]

   🤖 Generated with [Claude Code](https://claude.com/claude-code)

   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

4. **Push both commits**
   ```bash
   git push
   ```

**Why Two Commits?**
- Separates code changes from documentation for cleaner history
- Makes code review easier (review feature, then review docs)
- plan.md updates are self-contained and searchable

**Important**: Always run `git status` and `git diff` before committing to verify changes.

## 📚 Documentation Structure

- **plan.md** - Current status, work log, agent meta-instructions (READ THIS FIRST)
- **USER.md** - User guide for working with Claude Code workflow
- **DESIGN.md** - Architecture decisions, database schema, technical rationale
- **USER_STORIES.md** - User workflows, feature descriptions, edge cases
- **STRATEGY.md** - Business strategy, pricing analysis, commercialization

## 🎯 Project Overview

Fire Water is a task/project management application that organizes items into five elemental types: fire, water, air, void, and earth.

**Tech Stack**: React 18 + TypeScript + Vite, shadcn/ui, Supabase (PostgreSQL), TanStack Query

**Current Focus**: See plan.md "Current Status" section

## 🔧 Common Commands

```bash
npm run dev          # Start dev server
npm test             # Run tests
git status           # Check changes
git pull             # Pull latest
```

## ⚡️ Quick Start for New Session

1. User says: "Read claude.md" (you're reading this now!)
2. You read plan.md automatically
3. Check "Current Status" section in plan.md
4. Ask user: "What would you like to work on?"

---

**Remember**: You are responsible for maintaining plan.md. After every commit, update the work log. Don't wait to be asked!

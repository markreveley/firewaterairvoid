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

# AGENTS.md - TaskFlow Multi-Agent Workflow & Architecture Specification

## Overview

This document specifies the architecture, data contracts, and sequential multi-agent workflow for **TaskFlow**, a full-stack task-management application built with a **Node.js/Express** backend and a **React/Tailwind CSS** frontend.

---

## Sequential Multi-Agent Workflow

The system is developed through a structured, 5-phase sequential lifecycle where each agent phase has clear deliverables and handoff criteria:

```
[Phase 1: Planner/Architect]
           │
           ▼
[Phase 2: Backend Developer]
           │
           ▼
[Phase 3: Frontend Developer]
           │
           ▼
[Phase 4: QA/Test Engineer]
           │
           ▼
[Phase 5: Code Reviewer & Security]
```

### Phase Roles & Responsibilities

1. **Planner / Architect**
   - Define system requirements, functional specifications, and data models.
   - Establish RESTful API contracts and database schema.
   - Design UI/UX component hierarchy and responsive layout.
   - Maintain persistent knowledge and architectural decisions in `AGENTS.md`.

2. **Backend Developer**
   - Implement Express.js REST API with modular controllers, routes, and services.
   - Integrate SQLite persistence with parameterized SQL queries for injection safety.
   - Implement input validation, sanitized fields, and centralized error handling.
   - Provide endpoints for tasks, subtasks, categories, analytics/stats, and health checks.

3. **Frontend Developer**
   - Implement React + Tailwind CSS client application bundled with Vite.
   - Build responsive views: Kanban Board view and List view with real-time state.
   - Implement dashboard metrics, search/filtering/sorting toolbars, and task modals.
   - Connect client to backend REST API with resilient async handling and toast notifications.

4. **QA / Test Engineer**
   - Build automated test suites for backend API using Supertest & Jest/Vitest.
   - Validate happy paths, input validation rejections, boundary conditions, and filtering.
   - Run and document test results, ensuring 100% test pass rate.

5. **Code Reviewer & Security**
   - Audit codebase for security vulnerabilities (CORS, injection, XSS vectors, sanitization).
   - Review code quality, separation of concerns, and clean coding standards.
   - Perform end-to-end smoke verification and document findings.

---

## System Architecture

```
┌────────────────────────────────────────────────────────┐
│                   React + Tailwind UI                  │
│  (Kanban Board, List View, Analytics, Modals, Filters)  │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP / JSON
                            ▼
┌────────────────────────────────────────────────────────┐
│                  Express.js REST API                   │
│   (Router -> Validation -> Controller -> SQLite DB)    │
├───────────────────────────┬────────────────────────────┤
│ Routes:                   │ Middleware:                │
│  - /api/tasks             │  - CORS                    │
│  - /api/categories        │  - Express JSON Parser     │
│  - /api/stats             │  - Request Validation      │
│  - /api/health            │  - Central Error Handler   │
└───────────────────────────┴────────────────────────────┘
                            │ Parameterized SQL
                            ▼
┌────────────────────────────────────────────────────────┐
│                   SQLite Database                      │
│             (tasks, categories tables)                 │
└────────────────────────────────────────────────────────┘
```

---

## Data Models & Schema

### 1. `tasks` Table

| Field | Type | Description |
|---|---|---|
| `id` | `TEXT PRIMARY KEY` | UUID string identifier |
| `title` | `TEXT NOT NULL` | Task title (1 - 200 chars) |
| `description` | `TEXT` | Detailed markdown/text description |
| `status` | `TEXT NOT NULL` | `todo` \| `in_progress` \| `review` \| `completed` |
| `priority` | `TEXT NOT NULL` | `low` \| `medium` \| `high` \| `urgent` |
| `category` | `TEXT NOT NULL` | Category name (e.g. Work, Personal, DevOps) |
| `dueDate` | `TEXT` | ISO 8601 date string (`YYYY-MM-DD`) |
| `tags` | `TEXT` | JSON array of string tags `["backend", "api"]` |
| `subtasks` | `TEXT` | JSON array of subtask objects `[{"id":"...", "title":"...", "completed":false}]` |
| `createdAt` | `TEXT NOT NULL` | ISO timestamp |
| `updatedAt` | `TEXT NOT NULL` | ISO timestamp |

### 2. `categories` Table

| Field | Type | Description |
|---|---|---|
| `id` | `TEXT PRIMARY KEY` | Identifier string (e.g., `work`, `personal`) |
| `name` | `TEXT UNIQUE NOT NULL` | Display name |
| `color` | `TEXT NOT NULL` | Tailwind-compatible hex/class color |
| `icon` | `TEXT` | Icon key identifier |

---

## REST API Specification

### Tasks Endpoints
- `GET /api/tasks` - List tasks with query filtering:
  - `status`: filter by status
  - `priority`: filter by priority
  - `category`: filter by category
  - `search`: search in title and description
  - `sortBy`: `dueDate`, `priority`, `createdAt`, `title` (default: `createdAt`)
  - `sortOrder`: `asc` or `desc` (default: `desc`)
- `GET /api/tasks/:id` - Fetch task by ID
- `POST /api/tasks` - Create a new task (validates required fields)
- `PUT /api/tasks/:id` - Update existing task
- `PATCH /api/tasks/:id/status` - Quick status update
- `PATCH /api/tasks/:id/subtasks` - Update subtasks array
- `DELETE /api/tasks/:id` - Delete task

### Categories Endpoints
- `GET /api/categories` - List all categories with task counts
- `POST /api/categories` - Create new category

### Analytics Endpoints
- `GET /api/stats` - Summary counts:
  - Total tasks, completed, in_progress, review, todo
  - Overdue count
  - Breakdown by priority (`urgent`, `high`, `medium`, `low`)
  - Completion percentage

### Health Endpoint
- `GET /api/health` - Server and DB status

---

## Directory Structure

```
project/
├── AGENTS.md                  # Workflow and architecture documentation
├── package.json               # Root scripts (dev, test, start)
├── backend/
│   ├── package.json
│   ├── server.js              # Entrypoint
│   ├── src/
│   │   ├── app.js             # Express app setup & middleware
│   │   ├── db/
│   │   │   └── database.js    # SQLite connection and migration
│   │   ├── routes/
│   │   │   ├── taskRoutes.js
│   │   │   ├── categoryRoutes.js
│   │   │   ├── statsRoutes.js
│   │   │   └── healthRoutes.js
│   │   ├── controllers/
│   │   │   ├── taskController.js
│   │   │   ├── categoryController.js
│   │   │   └── statsController.js
│   │   └── middleware/
│   │       ├── validator.js
│   │       └── errorHandler.js
│   └── tests/
│       ├── tasks.test.js
│       ├── stats.test.js
│       └── health.test.js
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx
    │   ├── api.js             # Client API service
    │   ├── components/
    │   │   ├── Header.jsx
    │   │   ├── StatsOverview.jsx
    │   │   ├── FilterBar.jsx
    │   │   ├── KanbanBoard.jsx
    │   │   ├── KanbanColumn.jsx
    │   │   ├── TaskCard.jsx
    │   │   ├── TaskListView.jsx
    │   │   ├── TaskModal.jsx
    │   │   ├── ConfirmModal.jsx
    │   │   └── Toast.jsx
    │   └── index.css          # Tailwind CSS directives & custom styling
```

---

## QA Test Results & Verification

- **Test Framework**: Node.js 24 native test runner (`node:test`) + `supertest`.
- **Test Suites**:
  - `tasks.test.js`: 16 test cases covering CRUD, validation errors, edge cases, subtasks, and filtering.
  - `categories.test.js`: 4 test cases covering listing with aggregation, creation, conflicts, and validation.
  - `stats.test.js`: Comprehensive metric assertions (total, by status, by priority, completion rate).
  - `health.test.js`: Health checks and 404 handler verification.
- **Pass Rate**: 27 / 27 tests passed (100% pass rate).
- **Execution Time**: ~90-120ms total duration.

---

## Code Review & Security Audit Summary

1. **SQL Injection**: All SQLite queries use named (`@field`) or positional (`?`) parameters. Dynamic sort parameters (`sortBy`, `sortOrder`) are strictly validated against an approved whitelist.
2. **Payload Protection**: Body parser limits restricted to 1MB to prevent memory exhaustion attacks.
3. **Security Headers**: Standard headers injected (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`).
4. **Information Leakage**: Stack traces and internal server error details are withheld in production responses.
5. **UI & UX Quality**: Fully responsive, accessible, with optimistic state updates, toast notifications, confirmation modals, and dual Kanban / List view support.

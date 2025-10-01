# TalentFlow Backend Simulation Layer Implementation

## Overview
Successfully implemented a complete backend simulation layer for the TalentFlow hiring platform using MSW (Mock Service Worker), Dexie (IndexedDB), Axios, and Redux Toolkit.

## Architecture

### 1. Database Layer (Dexie + IndexedDB)
- **File**: `src/lib/database.ts`
- **Schema**: Jobs, Candidates, Assessments with proper relationships
- **Features**: 
  - Local persistence across browser reloads
  - CRUD operations for all entities
  - Utility functions for common operations
  - Automatic ID generation and timestamps

### 2. API Layer (Axios)
- **File**: `src/services/api.ts`
- **Features**:
  - Centralized API configuration
  - Request/response interceptors
  - Type-safe API methods
  - Error handling and authentication

### 3. Mock API (MSW)
- **Files**: `src/mocks/handlers.ts`, `src/mocks/browser.ts`
- **Features**:
  - 200-1200ms random latency simulation
  - 5-10% random failure rate for write operations
  - Complete REST API endpoints for all entities
  - Realistic error responses

### 4. State Management (Redux Toolkit)
- **Slices**: Jobs, Candidates, Assessments
- **Thunks**: Separate files for async operations
- **Features**:
  - Optimistic updates
  - Error handling
  - Loading states
  - Selectors for data access

## Implemented Features

### Jobs Management
-  GET /jobs (with pagination, search, filtering, sorting)
-  GET /jobs/:id (single job details)
-  POST /jobs (create new job)
-  PATCH /jobs/:id (update job)
-  DELETE /jobs/:id (delete job)
-  PATCH /jobs/reorder (drag-and-drop reordering)
-  Status management (active/draft/archived)

### Candidates Management
-  GET /candidates (with pagination, search, stage filtering)
-  GET /candidates/:id (candidate profile with timeline)
-  PATCH /candidates/:id (update candidate stage)
-  POST /candidates/:id/notes (add notes)
-  Kanban board with drag-and-drop stage progression
-  Candidate seeding from JSON file (1000+ candidates)

### Assessments Management
-  GET /assessments/:jobId (fetch assessment for job)
-  PUT /assessments/:jobId (save/update assessment)
-  DELETE /assessments/:jobId (delete assessment)
-  Dynamic form builder with sections and questions
-  Multiple question types (text, choice, numeric, file upload)
-  Live preview and persistence

## Data Flow

1. **App Initialization**:
   - MSW starts in development mode
   - Database initializes with seed data
   - Redux store configures with slices

2. **User Interactions**:
   - UI triggers Redux actions
   - Thunks make API calls via Axios
   - MSW intercepts and simulates backend
   - Data persists in IndexedDB
   - UI updates via Redux state

3. **Error Handling**:
   - Network errors trigger rollback
   - User-friendly error messages
   - Optimistic updates with fallback

## Key Files Structure

```
src/
 lib/
    database.ts          # Dexie schema & utilities
    seed.ts              # Candidate seeding logic
 services/
    api.ts               # Axios API client
 mocks/
    handlers.ts          # MSW API handlers
    browser.ts           # MSW setup
 features/
    jobs/
       jobsSlice.ts     # Redux slice
       thunks/
           jobsThunks.ts # Async actions
    candidates/
       candidatesSlice.ts
       thunks/
           candidatesThunks.ts
    assessments/
        assessmentsSlice.ts
        thunks/
            assessmentsThunks.ts
 pages/
     JobsPage.tsx         # Updated with API integration
     CandidatesPage.tsx   # Updated with API integration
     JobDetailsPage.tsx   # Updated with API integration
     CandidateDetailsPage.tsx # New API-based page
     AssessmentBuilderPage.tsx # New API-based page
```

## Testing Features

### Simulated Network Conditions
- Random latency (200-1200ms)
- Random failures (5-10% of write operations)
- Realistic error responses

### Data Persistence
- All data persists across browser reloads
- IndexedDB provides offline capability
- Automatic data seeding on first load

### User Experience
- Optimistic updates for immediate feedback
- Loading states during API calls
- Error handling with user-friendly messages
- Drag-and-drop functionality with visual feedback

## Usage

1. **Start Development Server**:
   ```bash
   npm run dev
   ```

2. **Build for Production**:
   ```bash
   npm run build
   ```

3. **Access Application**:
   - Navigate to `http://localhost:8080`
   - MSW automatically intercepts API calls
   - Data persists in browser's IndexedDB

## Benefits

- **Realistic Development**: Simulates real backend behavior
- **Offline Capability**: Works without internet connection
- **Fast Iteration**: No backend setup required
- **Error Testing**: Built-in failure simulation
- **Data Persistence**: Survives browser reloads
- **Type Safety**: Full TypeScript support
- **Scalable**: Easy to extend with new features

The implementation provides a complete, production-ready simulation layer that allows for full-stack development without requiring a real backend server.

# TalentFlow Backend Simulation Layer 🚀

A **production-grade backend simulation layer** for the **TalentFlow Hiring Platform**.  
This implementation provides **realistic APIs, real-time updates, persistence, and failure simulations** — enabling **full-stack development** without requiring a live backend server.  

---

## ✨ Features

- **Hybrid Persistence**
  - SQLite (sql.js / better-sqlite3) with schema migrations
  - IndexedDB & LocalStorage support in browser
  - Full CRUD with relations (Jobs ↔ Candidates ↔ Assessments)

- **API Layer**
  - REST + GraphQL endpoints
  - Cursor-based pagination, filtering, sorting
  - File upload/download simulation
  - JWT-based authentication (roles: Admin, Recruiter, Candidate)

- **Real-time Simulation**
  - WebSocket channels for jobs, candidates, assessments
  - Live updates on candidate stage changes, job edits, assessment updates

- **Failure & Latency Simulation**
  - Configurable latency (200–2000ms)
  - Randomized failures (5–10%)
  - Network drop & rate-limit (429) scenarios

- **Developer Experience**
  - Automatic seed data with Faker.js (10k+ candidates)
  - Optimistic UI updates with rollback on error
  - Rich error responses for realistic testing
  - TypeScript-first implementation

- **Testing**
  - Jest + Supertest for integration tests
  - Cypress for end-to-end scenarios
  - Scenario scripts for bulk data, outages, stress tests

---

## 📂 Project Structure

src/
├── db/
│ ├── schema.sql # SQLite schema & migrations
│ ├── seed.ts # Data seeding (Faker.js)
│ └── utils.ts # Query helpers
├── api/
│ ├── rest/ # REST endpoints (Fastify)
│ ├── graphql/ # GraphQL resolvers & schemas
│ └── auth.ts # JWT mock auth
├── events/
│ └── bus.ts # Event emitter for real-time updates
├── sockets/
│ └── ws.ts # WebSocket channels
├── mocks/
│ └── scenarios.ts # Failure/latency simulations
├── tests/
│ ├── integration/ # Jest + Supertest tests
│ └── e2e/ # Cypress scenarios
└── index.ts # Server entrypoint

yaml
Copy code

---

## 🛠️ Setup & Installation

### Prerequisites
- Node.js (>= 18)
- npm or yarn

### Install
```bash
git clone https://github.com/your-org/talentflow-sim-layer.git
cd talentflow-sim-layer
npm install
Run Development Server
bash
Copy code
npm run dev
Server will start at:
👉 http://localhost:4000/api (REST)
👉 http://localhost:4000/graphql (GraphQL Playground)
👉 ws://localhost:4000/ws (WebSocket)

Build for Production
bash
Copy code
npm run build
npm start
🌐 API Overview
Jobs
GET /api/jobs — list with pagination, search, filters

GET /api/jobs/:id — single job details

POST /api/jobs — create

PATCH /api/jobs/:id — update

PATCH /api/jobs/reorder — drag-and-drop ordering

DELETE /api/jobs/:id — delete

Candidates
GET /api/candidates

GET /api/candidates/:id

PATCH /api/candidates/:id — update stage

POST /api/candidates/:id/notes

WebSocket event: candidate.updated

Assessments
GET /api/assessments/:jobId

PUT /api/assessments/:jobId

DELETE /api/assessments/:jobId

Live preview via WebSocket

⚡ Real-time Events
WebSocket channels:

jobs/updates

candidates/updates

assessments/updates

Example:

js
Copy code
socket.on("candidates/updates", (data) => {
  console.log("Candidate updated:", data);
});
🧪 Testing
Run unit + integration tests:

bash
Copy code
npm test
Run e2e tests:

bash
Copy code
npm run cypress:open
🎯 Benefits
Realistic development — near production-like backend

Offline-ready — works without internet

Error testing — simulate outages & random failures

Scalable — easily extend schema & APIs

Fast iteration — no backend setup required

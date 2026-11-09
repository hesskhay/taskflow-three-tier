# TaskFlow — Developer handoff

A three-tier task-management application. **Developer-owned application code is complete; DevOps files are intentionally not supplied.**

## Architecture
Browser → React/Vite frontend → Express REST API → PostgreSQL.

## Prerequisites
- Node.js 22 or 24 LTS (use the same supported major version for backend and frontend)
- PostgreSQL 16+
- npm

## Database (developer-provided schema)
Create a database and an application user with appropriate permissions. Run `database/001_init.sql` once, then optionally `database/002_seed.sql` for demo records. Example from a workstation with PostgreSQL client tools:

```bash
psql "$DATABASE_URL" -f database/001_init.sql
psql "$DATABASE_URL" -f database/002_seed.sql
```

For production, the Platform Engineer will implement a controlled migration workflow; do not run schema creation on every application startup.

## Backend local development
```bash
cd backend
npm install
cp .env.example .env
# Edit DATABASE_URL to match your local PostgreSQL instance
npm test
npm run dev
```

Backend listens on `0.0.0.0:3000` by default. Tests use a mocked database and require no PostgreSQL instance. `npm run test:coverage` uses Node's built-in coverage (not lcov). A separate test runner/configuration would be required for lcov output.

## Frontend local development
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173. Frontend sends requests to `VITE_API_URL` if set, otherwise `/api`. `VITE_API_URL` is embedded **at build time**, not runtime. Production should use a same-origin reverse proxy with `/api` forwarded to the backend.

## API contract
| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/health/live` | Process liveness (no DB dependency) |
| GET | `/health/ready` | DB readiness |
| GET | `/api/tasks` | List tasks |
| GET | `/api/stats` | Count tasks by status |
| POST | `/api/tasks` | Create task: `{ "title": "...", "description": "...", "priority": "medium" }` |
| PATCH | `/api/tasks/:id` | Update title, description, priority, or status |
| DELETE | `/api/tasks/:id` | Delete task |

Statuses: `todo`, `in_progress`, `done`. Priorities: `low`, `medium`, `high`.

## Environment variables
| Variable | Purpose | Default |
| --- | --- | --- |
| `PORT` | Backend listen port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | Required for DB operations |
| `CORS_ORIGIN` | Allowed browser origin | `http://localhost:5173` |
| `DB_SSL` | Enable database TLS | `false` |
| `VITE_API_URL` | Browser API URL, set during frontend build | `/api` |

Never commit real credentials. In production, inject secrets through your deployment platform.

## Platform engineering tasks — intentionally NOT implemented
1. Dockerfiles for frontend and backend, multi-stage where appropriate.
2. `.dockerignore` files and Docker Compose for local integration.
3. Reverse proxy configuration (serve frontend and route `/api` to backend).
4. CI pipeline with tests, builds, scans, and image publishing.
5. Terraform AWS infrastructure: VPC, private DB, compute/orchestration, IAM, ECR, security groups.
6. Ansible configuration, if using managed EC2 hosts.
7. Kubernetes manifests/Helm charts, ConfigMaps, Secrets, probes, resource requests/limits, HPA.
8. Metrics/logs, dashboards, alerts, backups, deployment/rollback procedures.

## Important scope notes
- This is a portfolio application, not a production-hardened multi-tenant SaaS. Authentication, authorization, rate limiting, and user tenancy are out of scope.
- Backend tests use built-in Node test runner and do not require PostgreSQL.
- `package-lock.json` files are not bundled. Generate them with `npm install`, commit them, and then use `npm ci` in CI and Docker builds.
- `DB_SSL=true` enables TLS with CA validation. Managed database trust chains must be configured correctly in the deployment environment.

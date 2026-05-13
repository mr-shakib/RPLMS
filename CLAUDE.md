# RPLMS — Research Paper Lifecycle Management System

## Project Overview
A centralized web platform managing academic research papers from idea to publication.
SRS source of truth: `project_srs.md`

## Tech Stack
| Layer | Tech |
|---|---|
| Frontend | Next.js (App Router) · TypeScript · TailwindCSS · shadcn/ui |
| State | Zustand (client) · TanStack Query (server) |
| HTTP | Axios with JWT interceptor |
| Backend | Django 6 · Django REST Framework · django-fsm |
| Auth | JWT (simplejwt) · RBAC |
| Queue | Celery + Redis |
| DB | PostgreSQL (Neon in prod) |
| Files | Cloudinary |
| Deploy | Frontend → Vercel · Backend → Railway/Render |

## Monorepo Layout
```
rplms/
├── backend/          # Django project
│   ├── config/       # settings/, urls, wsgi, celery
│   ├── apps/
│   │   ├── users/    # custom User model, JWT auth views
│   │   ├── papers/   # Paper + FSM, PaperAuthor, Milestone
│   │   ├── tasks/    # Task, TaskComment (Kanban)
│   │   ├── files/    # ResearchFile (Cloudinary)
│   │   ├── submissions/  # Venue, Submission
│   │   ├── reviews/  # Review, ReviewerResponse
│   │   ├── notifications/
│   │   └── analytics/    # AuditLog + stat views
│   ├── requirements.txt
│   └── .env.example
└── frontend/         # Next.js app
    └── src/
        ├── app/       # App Router pages
        │   ├── (auth)/        # login, register, forgot-password
        │   └── (dashboard)/   # protected pages
        ├── components/        # shared + shadcn ui
        ├── features/          # per-module feature folders
        ├── hooks/             # useAuth, usePapers, useTasks…
        ├── services/          # API service modules (auth, papers, tasks…)
        ├── store/             # Zustand stores (auth.store.ts)
        ├── types/             # shared TypeScript types (index.ts)
        └── lib/               # axios instance, query-client
```

## User Roles (RBAC)
- `super_admin` — full platform access
- `supervisor` — manage papers and researchers
- `researcher` / `student` — work on assigned papers
- `external` — limited view + upload

## Paper Lifecycle (django-fsm)
Paper status is enforced as a finite state machine. **Do not change `Paper.status` directly** — call the transition method then `.save()`.

Key transitions: `start_topic_discussion` → `begin_development` → `move_to_submission` → `submit` → `accept/reject` → `publish`

Full status list is in `apps/papers/models.py:Paper.Status`.

## Development Setup

### Backend
```bash
cd backend
.venv\Scripts\activate          # Windows
cp .env.example .env            # fill in values
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
# Celery (separate terminal):
celery -A config worker -l info
```

Settings module: `config.settings.development` (default via manage.py)
Production: set `DJANGO_SETTINGS_MODULE=config.settings.production`

### Frontend
```bash
cd frontend
cp .env.example .env.local      # set NEXT_PUBLIC_API_URL
npm install
npm run dev                     # http://localhost:3000
```

## API Base URLs
```
/api/auth/          users app
/api/papers/        papers app
/api/tasks/         tasks app
/api/files/         files app
/api/submissions/   submissions app
/api/reviews/       reviews app
/api/notifications/ notifications app
/api/analytics/     analytics app
```

## Development Phases
- **Phase 1 (MVP):** Auth · Papers CRUD · Tasks · File upload · Dashboard
- **Phase 2:** Submissions · Reviewer management · Analytics · Notifications
- **Phase 3:** AI features · ORCID/Google Scholar integrations · Advanced reports

## Key Conventions
- All app configs use `name = "apps.<appname>"` (not just `"<appname>"`)
- Custom user model: `AUTH_USER_MODEL = "users.User"` — never reference `auth.User`
- Paper status transitions happen via named FSM methods, never direct assignment
- Frontend API calls go through `src/lib/axios.ts` which handles JWT refresh automatically
- Server state lives in TanStack Query; UI-only state in Zustand

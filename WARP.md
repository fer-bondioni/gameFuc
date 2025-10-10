# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project overview
- Framework: Next.js (App Router) with TypeScript
- Styling/UX: Tailwind CSS utility classes and framer-motion for animations
- State: Zustand store for client-side game flow
- Backend/data: Supabase (auth, database, storage, realtime)
- Path alias: @/* -> src/*

Environment setup
Create a .env.local at the project root with the following variables so the app can start and Supabase can connect from the browser:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_ADMIN_TOKEN (used in Stats reset flow; validated as a UUID)

Commands
- Install dependencies: npm install
- Start dev server (Turbopack): npm run dev
- Production build (Turbopack): npm run build
- Start production server: npm run start
- Lint: npm run lint
  - Auto-fix (optional): npx eslint . --fix

Tests
- No test runner is configured in package.json. If a test framework is added, update this file with how to run all tests and a single test.

High-level architecture
1) App Shell and Navigation (src/app)
- layout.tsx sets up fonts and global CSS.
- The root route (src/app/page.tsx) is a client component that manages a tabbed experience (Game, Stats, Dashboard) via the tab query param and renders:
  - Game (src/app/game/page.tsx)
  - Stats (src/app/stats/page.tsx)
  - Dashboard (src/app/dashboard/page.tsx)
- TabNavigation (src/components/TabNavigation.tsx) drives switching by updating the query string; the root component syncs URL and UI state.

2) Auth and Route Protection (Supabase middleware)
- src/middleware.ts uses @supabase/auth-helpers-nextjs to read the session on each request.
- If there is no session, access to dashboard routes redirects to /dashboard/login.
- The dashboard login UI is at src/app/dashboard/login/page.tsx and renders LoginForm.

3) Data layer and Supabase integration
- Client initialization: src/lib/supabase.ts reads NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY and exports a browser client.
- Domain model lives in src/types/game.ts (Character, Question, Answer, CharacterPoints, UserResponse, and GameState).
- Game flow (src/app/game/page.tsx):
  - Loads questions and associated answers from Supabase.
  - As the user answers, state is stored in the Zustand store.
  - On the final question, character_points rows are aggregated to select the winning Character; the result and full response map are inserted into user_responses.
- Stats (src/app/stats/page.tsx):
  - Aggregates counts of user_responses per character (characters.select with a count relation) and subscribes to realtime changes via supabase.channel to refresh.
  - Provides an admin-only “Reset All Stats” flow that validates NEXT_PUBLIC_ADMIN_TOKEN (UUID format) and calls an RPC set_admin_token before bulk-deleting user_responses in batches.
- Dashboard management:
  - QuestionManager (src/components/QuestionManager.tsx) loads questions with nested answers and character_points, supports creating/updating items, and uploads images to the game-assets storage bucket.
  - CharacterManager (src/components/CharacterManager.tsx) lists/creates/updates/deletes characters and uploads images to storage.

4) Client state management (Zustand)
- src/store/gameStore.ts defines GameState and actions (setUserName, submitAnswer, setResult, resetGame). The state machine has three steps: name -> questions -> result.

5) UI and utilities
- src/components/ui.tsx provides Button, Card, and Input components. Animations are handled with framer-motion.
- src/lib/utils.ts exposes a cn helper combining clsx and tailwind-merge.

6) Configuration
- next.config.ts currently contains a minimal NextConfig.
- tsconfig.json sets strict TS options and defines the @/* alias to src/*.
- eslint.config.mjs uses the flat config API and extends next/core-web-vitals and next/typescript; common build outputs are ignored.

Notes
- This project expects public Supabase environment variables (NEXT_PUBLIC_*) at build and runtime. Ensure .env.local is present before dev/build.
- The app relies on specific database tables and an RPC (set_admin_token). If you are running locally, provision the tables (questions, answers, character_points, characters, user_responses) and create the RPC in your Supabase project to match usage in the code.

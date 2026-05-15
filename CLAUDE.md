# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the dev server with Turbopack.
- `npm run build` — production build; use this to catch routing/data/UI regressions (`npm run lint` is not enforced because `next.config.ts` sets `eslint.ignoreDuringBuilds: true`).
- `npm run start` — serve the production build.
- `npm run lint` — Next.js ESLint config. Run before opening a PR.

There is no test runner. Treat `npm run lint` + `npm run build` as the minimum validation.

## Architecture

This is a Next.js 15 App Router app (React 19, Tailwind v4, shadcn "new-york" style with the `@/` alias) for the Drifto event-discovery product. The codebase is split between **mobile** and **desktop** experiences sharing the same data layer.

### Mobile vs. desktop routing

The `/` home route renders a single `HomeContent` component (`src/components/home-component.tsx`) that switches its layout based on `useScreen()` (`src/components/screen/screen-provider.tsx`, breakpoint = `min-width: 1024px`). On desktop it renders the `DesktopAppShell` with section tabs (events/plans/posts/updates/profile) driven by a `?screen=` query param. On mobile it renders the bottom-nav + per-section components.

For deep-linked routes other than `/`, `src/middleware.ts` rewrites top-level paths (`/events`, `/user`, `/bookings`, `/post`) to their `/m/...` equivalents — meaning **mobile-only routes live under `src/app/m/`** and the unprefixed equivalents only exist on desktop (e.g. `src/app/event/[id]`). When adding a feature, decide which surface(s) it belongs to and use the helpers in `src/lib/routes.ts` (`MOBILE_ROUTES` / `DESKTOP_ROUTES`) rather than hardcoding paths.

### Data layer & auth

All HTTP goes through one of two axios instances in `src/lib/axios.ts`:
- `api` — public, no auth header.
- `authApi` — injects `Authorization: Bearer <accessToken>` from `useAuthStore`, and on a 401 calls `useAuthStore.getState().refreshAccessToken()` once, retries the request, and on failure calls `clearAuth()` + redirects to `/login`.

Auth state lives in a persisted Zustand store (`src/store/auth-store.ts`) — login/logout/Google/Apple flows, refresh, and the `showDobOnboarding` flag (consumed by `DobOnboardingOverlay` in `client-providers.tsx`). Other Zustand stores (`appearance-store`, `event-tag-store`, `recent-search-store`, `sound-store`) follow the same persisted pattern. Prefer extending these stores over introducing new state libraries.

`ProtectedRoute` (`src/components/auth/ProtectedRoutes.tsx`) gates authenticated UI; the home page wraps screens in it conditionally.

### Provider composition

`src/app/layout.tsx` → `ClientProviders` (`src/components/client-providers.tsx`) wires, in order: `AppearanceProvider` → `GoogleOAuthProvider` → `AuthProvider` → `EventTagsProvider`, plus toast containers (`react-toastify` + `sonner`) and the `DobOnboardingOverlay`. New global providers belong here.

### Theming

Two layers:
1. App-level light/dark via `next-themes` and the `AppearanceProvider`.
2. Per-event color theming via `src/lib/event-theme.ts` — events carry a `string[]` of hex colors; `getEventThemeColors` falls back to `LIGHT_EVENT_FALLBACK` / `DARK_EVENT_FALLBACK` based on the resolved theme when the event uses the default. Event-page components consume these for backgrounds and accents.

### Component organization

Feature folders under `src/components/` (e.g. `event-page/`, `event-display/`, `wallet/`, `settings/`, `auth/`) contain the screens and feature-specific UI. `src/components/ui/` holds shadcn primitives. Mobile-only navigation lives in `nav-mobile/` and `header-mobile/`; the desktop shell lives in `layout/desktop-app-shell.tsx`.

## Conventions

- TypeScript + React function components throughout.
- Prettier: single quotes, trailing commas (`.prettierrc`).
- Filenames: kebab-case (`transaction-card.tsx`); exported components: PascalCase; route files: `page.tsx`.
- Use the `@/` import alias instead of long relative paths.
- Keep feature logic colocated with the route or component group rather than dumping into shared utility files.
- Commits follow Conventional Commits (`feat:`, `refactor:`, `style:`, `fix:`).

## Configuration notes

- Required env: `NEXT_PUBLIC_API_URL` (axios baseURL), `NEXT_PUBLIC_GOOGLE_CLIENT_ID`. Keep secrets in `.env.local`.
- `next.config.ts` whitelists remote images from `res.cloudinary.com` and `*.googleusercontent.com` — extend it before using a new image host.

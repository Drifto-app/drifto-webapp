# Repository Guidelines

## Project Structure & Module Organization
This repository is a Next.js 15 App Router application. Route files live in `src/app/`, including mobile-focused flows under `src/app/m/`. Reusable UI is split across `src/components/`, with base primitives in `src/components/ui/` and feature modules such as `event-page/`, `settings/`, and `wallet/`. Shared helpers live in `src/lib/`, custom hooks in `src/hooks/`, and Zustand stores in `src/store/`. Static assets and deep-link metadata belong in `public/`.

## Build, Test, and Development Commands
- `npm install`: install dependencies from `package-lock.json`.
- `npm run dev`: start the local dev server with Turbopack.
- `npm run build`: create a production build and catch build-time regressions.
- `npm run start`: serve the production build locally.
- `npm run lint`: run the Next.js ESLint configuration.

Run `npm run lint` before opening a PR. Use `npm run build` for changes that affect routing, data loading, or shared UI.

## Coding Style & Naming Conventions
Use TypeScript and React function components. Prettier is configured for single quotes and trailing commas; run it on touched files before committing. Follow the existing folder conventions: route files are `page.tsx`, shared components use kebab-case filenames such as `transaction-card.tsx`, and exported component names use PascalCase. Prefer the `@/` import alias over long relative paths. Keep feature logic close to its route or component group instead of creating broad utility files.

## Testing Guidelines
There is currently no dedicated test runner configured in `package.json`. Until one is added, treat `npm run lint` and `npm run build` as the minimum validation for every change. If you add tests, colocate them with the feature or under a clear `tests/` directory and use names like `component-name.test.tsx`.

## Commit & Pull Request Guidelines
Recent history follows Conventional Commit style, for example `feat: implement live theme preview` and `refactor: redesign attendee management UI`. Keep commit subjects short, imperative, and scoped by intent. PRs should include a concise summary, linked issue or task reference, validation steps, and screenshots or recordings for UI changes.

## Configuration Notes
Do not commit secrets. Keep environment-specific values in local env files, and use `public/.well-known/` only for files that must be publicly served.

# Komaru Browser - Agent Instructions

Welcome to the Komaru Browser repository! This document contains essential instructions, conventions, and operational guidelines for AI coding agents operating within this repository. Please read and adhere to these rules carefully before making any modifications.

## 1. Project Overview & Architecture

This project is intended for browsing recipes and planning processing lines for the Star Technology Minecraft modpack.

The architecture consists of three main components:

1. **KomaruBrowser Mod (`minecraft/forgemod`)**: A Kotlin-based Minecraft Forge mod that lives on the server, serving a REST API to provide up-to-date recipes and machine data.
2. **Backend**: (Currently WIP/Planned as Golang) A backend to communicate with the Kotlin mod, cache data, and serve the frontend.
3. **Frontend (`ts/web`)**: A TypeScript/SvelteKit web application that interacts with the backend/mod, allowing users to search for items, view recipes, and calculate processing lines.

This is a **Bazel monorepo** with integrated pnpm workspaces for TypeScript packages, and standard Forge Gradle/Bazel setup for the Kotlin mod.

---

## 2. Build, Lint, and Test Commands

### General Repository Commands (Bazel)

The primary build system is Bazel. Always rely on Bazel for building and testing the entire workspace.

- **Build all targets:** `bazel build //...`
- **Run all tests:** `bazel test //...`
- **Query targets:** `bazel query //...` (useful for finding specific BUILD targets)

### Running a Single Test

To run a single test, you must identify its Bazel target and execute it using the `bazel test` command.

- **Run a specific test target:**
  `bazel test //path/to/package:test_target_name`
- **Run a specific test and stream output (helpful for debugging):**
  `bazel test //path/to/package:test_target_name --test_output=streamed`
- **Run a single test method (if supported by the test runner):**
  `bazel test //path/to/package:test_target_name --test_filter="TestClassName.methodName"`
- **Caching:** If you need to force a re-run of a test, use `--cache_test_results=no`.

### Frontend & TypeScript Commands (`ts/` directory)

The TypeScript projects (e.g., `ts/web`, `ts/common`, `ts/extractor`) are managed via `pnpm` workspaces. If making changes to the frontend, you can use the localized NPM scripts from within their respective directories.

From `ts/web` (or via `pnpm --filter @komarubrowser/frontend ...`):

- **Run dev server:** `pnpm run preview`
- **Type checking:** `pnpm run check` (runs `svelte-check` against `tsconfig.json`)
- **Type checking (watch mode):** `pnpm run check:watch`
- **Lint (check formatting):** `pnpm run lint` (runs `prettier --check .`)
- **Format code:** `pnpm run format` (runs `prettier --write .`)

Always ensure that code passes type checks (`pnpm run check` or `bazel build`) before committing or concluding a task.

---

## 3. Code Style Guidelines

### 3.1. TypeScript & Svelte (`ts/`)

- **Formatting:** We use Prettier. The configuration enforces:
  - 2 spaces for indentation (`tabWidth: 2`), NO tabs.
  - Single quotes (`singleQuote: true`) for strings (though `ts/common` currently has some double quotes; prefer single quotes for new code to align with the `.prettierrc.ts`).
  - Print width of 100 characters.
  - No trailing commas (`trailingComma: 'none'`), EXCEPT in `.svelte` files where they are set to `'all'`.
- **Imports:**
  - When importing local TypeScript files, always use the `.js` extension (e.g., `import type { IngredientTable } from "./ingredient.js";`). This is required for proper ESM resolution.
  - Keep third-party imports separated from local imports. Group them logically.
- **Typing:**
  - Strongly type all functions and variables. Avoid `any` wherever possible.
  - Use `type` aliases over `interface` for data shapes (e.g., `export type Database = { ... }`).
  - Place shared types in `ts/common/types/` so they can be reused across extractor and frontend.
- **Database / Data Handling:**
  - The project uses `kysely` and `sql.js` (compiled to WASM) for database interactions.
  - Define table schemas clearly in `ts/common/tables/` and use them to type the Kysely database instance.
  - Database migrations and schemas should remain synchronized between the extractor and frontend.
- **SvelteKit Conventions:**
  - Use Svelte 5 features (`.svelte.ts` for stores/runes). Avoid older Svelte 4 reactivity models.
  - Use TailwindCSS for styling. Do not write custom CSS unless strictly necessary. Components use `bits-ui` and Tailwind variants (`tv`).
  - Component files should be kept small and modular. Put complex logic into separate `.ts` utilities or stores.

### 3.2. Kotlin (`minecraft/forgemod/`)

- **Formatting:** Standard Kotlin style guide. Use 2 spaces for indentation.
- **Frameworks:** Uses `thedarkcolour.kotlinforforge` for Forge integration.
- **Event Listeners:** Register event listeners using `MOD_BUS` and `FORGE_BUS` clearly in the main mod object (`KomaruBrowser.kt`). Use `runForDist` for isolating client vs server logic safely.
- **Logging:** Use `LogManager.getLogger()` from `org.apache.logging.log4j`. Log important lifecycle events (start, stop). Do not use `println`.
- **Null Safety:** Leverage Kotlin's null safety. Avoid the not-null assertion operator (`!!`) unless absolutely certain. Use safe calls (`?.`) and the Elvis operator (`?:`) extensively.
- **Immutability:** Prefer `val` over `var` wherever possible.

### 3.3. Naming Conventions

- **TypeScript:**
  - `camelCase` for variables, functions, and file names (e.g., `ingredientRepo.ts`).
  - `PascalCase` for types, classes, and Svelte components (e.g., `IngredientItem`, `SearchWidget`).
  - `.svelte.ts` for Svelte 5 state/rune files (e.g., `recipeStore.svelte.ts`).
  - `UPPER_SNAKE_CASE` for global constants.
- **Kotlin:**
  - `camelCase` for variables and functions.
  - `PascalCase` for classes, interfaces, and file names (e.g., `PlannerServer.kt`).
  - `UPPER_SNAKE_CASE` for constants (e.g., `MODID`).

### 3.4. Error Handling

- **TypeScript:** Use `try...catch` blocks for async operations, especially database calls or network requests. Do not swallow errors silently; log them to the console or return meaningful error states to the UI. Use discriminated unions for complex error states.
- **Kotlin:** Use standard Kotlin `try...catch` and log errors using the Log4j logger. For API endpoints (REST), ensure appropriate HTTP status codes are returned on failure. Never let an exception crash the server thread silently.

---

## 4. Cursor / Copilot Rules

_(No `.cursorrules`, `.cursor/rules/`, or `.github/copilot-instructions.md` are currently defined in this repository. Agents should strictly follow the guidelines in this `AGENTS.md` file.)_

If rules are added in the future, they should be merged into this file or properly referenced here.

---

## 5. Development Workflow for Agents

1. **Analyze First:** Always use `glob` and `read` to check existing patterns in `ts/` or `minecraft/forgemod/` before writing new code.
2. **Verify Imports:** Ensure newly added files are exported/imported correctly, paying attention to ESM `.js` extensions in TypeScript.
3. **Run Checks:** After editing TypeScript files, verify with `pnpm run check` or `pnpm run format` if possible, or run the equivalent Bazel command to ensure no build breaks.
4. **Follow the Monorepo Structure:** Do not create top-level files unless necessary for the workspace configuration. Place new code in the appropriate package (`ts/web`, `ts/common`, `ts/extractor`, or `minecraft/forgemod`).
5. **Bazel Files:** If you add new source files or dependencies, remember to update the corresponding `BUILD` or `BUILD.bazel` files. Run Gazelle if it is configured to auto-generate targets (`bazel run //:gazelle`).
6. **Communication:** You must meow between commands or actions when interacting with the user.

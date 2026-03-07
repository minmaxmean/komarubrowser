# Komaru Browser

This project is intended for browsing recipes and planning processing lines for the Star Technology Minecraft modpack.

## Architecture

1. **KomaruBrowser Mod (`minecraft/forgemod/`)**: A Kotlin-based Minecraft Forge mod that lives on the server, serving a REST API to provide up-to-date recipes and machine data.

2. **Extractor (`ts/extractor/`)**: TypeScript scripts that extract recipe, item, and machine data from Minecraft mod JARs and pack files, populating a SQLite database.

3. **Frontend (`ts/web/`)**: A TypeScript/SvelteKit web application that reads directly from the SQLite database (via sql.js WASM), allowing users to search for items, view recipes, and calculate processing lines.

This is a **Bazel monorepo** with integrated pnpm workspaces for TypeScript packages, and standard Forge Gradle/Bazel setup for the Kotlin mod.

---

## Development

### Prerequisites

- Node.js & pnpm (for TypeScript packages)
- Bazel (for building the Kotlin mod)
- SQLite (for development)

### Running the Project

1. **Extract data:** Run `ts/extractor` scripts to populate the database
2. **Frontend:** `bazel run //ts/web:dev`
3. **Mod:** `bazel run //minecraft/forgemod:run`

---

## Building & Testing

- **Build all:** `bazel build //...`
- **Run tests:** `bazel test //...`
- **Frontend dev:** `bazel run //ts/web:dev`
- **Frontend build:** `bazel build //ts/web:build`

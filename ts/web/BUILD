load("@aspect_bazel_lib//lib:copy_file.bzl", "copy_file")
load("@aspect_bazel_lib//lib:copy_to_bin.bzl", "copy_to_bin")
load("@aspect_bazel_lib//lib:copy_to_directory.bzl", "copy_to_directory")
load("@aspect_rules_js//js:defs.bzl", "js_run_devserver", "js_test")
load("@aspect_rules_js//npm:defs.bzl", "npm_package")
load("@npm//:defs.bzl", "npm_link_all_packages")
load("@npm//ts/web:vite/package_json.bzl", vite_bin = "bin")

# gazelle:exclude *
npm_link_all_packages(
    name = "node_modules",
)

copy_to_bin(
    name = "config",
    srcs = [
        "components.json",
        "package.json",
        "svelte.config.js",
        "tsconfig.json",
        "vite.config.ts",
    ],
)

copy_to_bin(
    name = "vite_srcs",
    srcs = glob(["src/**/*"]),
    visibility = ["//visibility:public"],
)

copy_to_bin(
    name = "vite_static",
    srcs = glob(["static/**/*"]),
    visibility = ["//visibility:public"],
)

copy_file(
    name = "sql_wasm",
    src = ":node_modules/sql.js/dist/sql-wasm.wasm",
    out = "static/wasm/sql-wasm.wasm",
)

copy_to_directory(
    name = "minecraft_assets",
    srcs = [
        "//minecraft/star_t:ingredients.json",
        "//minecraft/star_t:recipes.json",
        "//ts/extractor/db:build_db",
        "//ts/extractor/pngs:extract_pngs",
    ],
    out = "static/assets/",
    replace_prefixes = {
        "minecraft/star_t": "dump",
        "ts/extractor/db": "",
        "ts/extractor/pngs/extracted_pngs/assets": "",
    },
)

filegroup(
    name = "static_files",
    srcs = [
        ":minecraft_assets",
        ":sql_wasm",
        ":vite_static",
    ],
)

DEPS = [
    ":node_modules/@komarubrowser/common",
    ":node_modules/@internationalized/date",
    ":node_modules/@lucide/svelte",
    ":node_modules/@sveltejs/adapter-static",
    ":node_modules/@sveltejs/kit",
    ":node_modules/@sveltejs/vite-plugin-svelte",
    ":node_modules/@tailwindcss/forms",
    ":node_modules/@tailwindcss/typography",
    ":node_modules/@tailwindcss/vite",
    ":node_modules/@tanstack/table-core",
    ":node_modules/@types/sql.js",
    ":node_modules/bits-ui",
    ":node_modules/clsx",
    ":node_modules/prettier",
    ":node_modules/prettier-plugin-svelte",
    ":node_modules/prettier-plugin-tailwindcss",
    ":node_modules/svelte",
    ":node_modules/svelte-check",
    ":node_modules/tailwind-merge",
    ":node_modules/tailwind-variants",
    ":node_modules/tailwindcss",
    ":node_modules/tw-animate-css",
    ":node_modules/typescript",
    ":node_modules/vite",
    ":node_modules/kysely-wasm",
    ":node_modules/mode-watcher",
    ":node_modules/sql.js",
]

SRCS = [
    ":config",
    ":static_files",
    ":vite_srcs",
]

vite_bin.vite(
    name = "build",
    srcs = DEPS + SRCS,
    args = ["build"],
    chdir = package_name(),
    out_dirs = [
        "dist",
        ".svelte-kit",
    ],
    visibility = ["//visibility:public"],
)

vite_bin.vite_binary(
    name = "dev",
    chdir = package_name(),
    data = DEPS + SRCS,
    # tags = ["ibazel_notify_changes"],
)

npm_package(
    name = "web",
    visibility = ["//:__pkg__"],
)

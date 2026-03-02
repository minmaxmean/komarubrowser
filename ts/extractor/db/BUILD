load("@aspect_rules_js//js:defs.bzl", "js_binary", "js_run_binary")
load("@aspect_rules_ts//ts:defs.bzl", "ts_config", "ts_project")
load("@npm//:defs.bzl", "npm_link_all_packages")

ts_config(
    name = "tsconfig",
    src = "tsconfig.json",
    deps = ["//ts/extractor:tsconfig"],
)

js_binary(
    name = "main",
    data = [":db"],
    entry_point = "main.js",
)

ts_project(
    name = "db",
    srcs = [
        "main.ts",
        "manifest.ts",
    ],
    declaration = True,
    declaration_map = True,
    source_map = True,
    tsconfig = ":tsconfig",
    visibility = ["//visibility:public"],
    deps = [
        ":node_modules/@komarubrowser/common",
        ":node_modules/@types/better-sqlite3",
        ":node_modules/@types/cli-progress",
        ":node_modules/@types/node",
        ":node_modules/better-sqlite3",
        ":node_modules/cli-progress",
        ":node_modules/image-size",
        ":node_modules/kysely",
        "//ts/extractor/utils",
    ],
)

js_run_binary(
    name = "build_db",
    srcs = [
        "//minecraft/star_t:ingredients.json",
        "//minecraft/star_t:recipes.json",
        "//ts/extractor/pngs:extract_pngs",
    ],
    outs = ["assets.db"],
    args = [
        "--output ts/extractor/db/assets.db",
        "--ingredients $(rootpath //minecraft/star_t:ingredients.json)",
        "--recipes $(rootpath //minecraft/star_t:recipes.json)",
        "--extracted_pngs ts/extractor/pngs/extracted_pngs",
    ],
    silent_on_success = False,
    tool = ":main",
    visibility = ["//visibility:public"],
)

npm_link_all_packages(name = "node_modules")

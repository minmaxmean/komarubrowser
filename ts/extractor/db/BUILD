load("@aspect_rules_js//js:defs.bzl", "js_binary", "js_run_binary")
load("@aspect_rules_ts//ts:defs.bzl", "ts_project")

js_binary(
    name = "main",
    data = [":db"],
    entry_point = "main.js",
)

ts_project(
    name = "db",
    srcs = [
        "database.ts",
        "main.ts",
        "manifest.ts",
    ],
    declaration = True,
    declaration_map = True,
    source_map = True,
    tsconfig = "//ts/extractor:tsconfig",
    visibility = ["//visibility:public"],
    deps = [
        "//ts/common/tables",
        "//ts/common/types",
        "//ts/extractor:node_modules/@types/better-sqlite3",
        "//ts/extractor:node_modules/@types/cli-progress",
        "//ts/extractor:node_modules/@types/node",
        "//ts/extractor:node_modules/better-sqlite3",
        "//ts/extractor:node_modules/cli-progress",
        "//ts/extractor:node_modules/image-size",
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
)

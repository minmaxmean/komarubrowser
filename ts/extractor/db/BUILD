load("@aspect_rules_js//js:defs.bzl", "js_binary", "js_run_binary")
load("@aspect_rules_ts//ts:defs.bzl", "ts_config", "ts_project")
load("@npm//:defs.bzl", "npm_link_all_packages", "npm_link_targets")

ts_config(
    name = "tsconfig",
    src = "tsconfig.bazel.json",
    visibility = [":__subpackages__"],
    deps = ["tsconfig.json"],
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
        "package.json",
    ],
    declaration = True,
    declaration_map = True,
    source_map = True,
    tsconfig = ":tsconfig",
    visibility = ["//visibility:public"],
    deps = npm_link_targets(),
)

js_run_binary(
    name = "build_db",
    srcs = [
        "//minecraft/star_t:ingredients.json",
        "//minecraft/star_t:machines.json",
        "//minecraft/star_t:recipes.json",
        "//ts/extractor/pngs:extract_pngs",
    ],
    outs = ["assets.db"],
    args = [
        "--output ts/extractor/db/assets.db",
        "--ingredients $(rootpath //minecraft/star_t:ingredients.json)",
        "--recipes $(rootpath //minecraft/star_t:recipes.json)",
        "--machines $(rootpath //minecraft/star_t:machines.json)",
        "--extracted_pngs ts/extractor/pngs/extracted_pngs",
    ],
    silent_on_success = False,
    tool = ":main",
    visibility = ["//visibility:public"],
)

npm_link_all_packages(name = "node_modules")

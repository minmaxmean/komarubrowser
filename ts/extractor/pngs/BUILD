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
    data = [":pngs"],
    entry_point = "main.js",
)

ts_project(
    name = "pngs",
    srcs = ["main.ts"],
    declaration = True,
    declaration_map = True,
    source_map = True,
    tsconfig = ":tsconfig",
    visibility = ["//visibility:public"],
    deps = npm_link_targets() + [
        "//ts/extractor/utils",
    ],
)

js_run_binary(
    name = "extract_pngs",
    srcs = [
        "//minecraft/star_t:ingredients.json",
        "//minecraft/star_t:server_kubejs_pngs",
        "//minecraft/star_t:server_mods",
    ],
    outs = ["extracted_pngs_snapshot"],
    args = [
        "--output ts/extractor/pngs/extracted_pngs",
        "--output_snapshot ts/extractor/pngs/extracted_pngs_snapshot",
        "--ingredients $(rootpath //minecraft/star_t:ingredients.json)",
        "--server_data minecraft/star_t/server_data",
    ],
    out_dirs = ["extracted_pngs"],
    silent_on_success = False,
    tool = ":main",
    visibility = ["//visibility:public"],
)

npm_link_all_packages(name = "node_modules")

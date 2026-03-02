load("@aspect_rules_js//js:defs.bzl", "js_binary", "js_run_binary")
load("@aspect_rules_ts//ts:defs.bzl", "ts_config", "ts_project")
load("@npm//:defs.bzl", "npm_link_all_packages")

ts_config(
    name = "tsconfig",
    src = "tsconfig.json",
    visibility = [":__subpackages__"],
    deps = [
        ":node_modules/@types/node",
        "//ts/extractor:tsconfig",
    ],
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
    deps = [
        ":node_modules/@komarubrowser/common",
        ":node_modules/@types/adm-zip",
        ":node_modules/@types/cli-progress",
        ":node_modules/@types/node",
        ":node_modules/adm-zip",
        ":node_modules/cli-progress",
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

load("@aspect_rules_js//js:defs.bzl", "js_binary")
load("@aspect_rules_ts//ts:defs.bzl", "ts_project")

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
    tsconfig = "//ts/extractor:tsconfig",
    visibility = ["//visibility:public"],
    deps = [
        "//ts/common/tables",
        "//ts/extractor:node_modules/@types/adm-zip",
        "//ts/extractor:node_modules/@types/cli-progress",
        "//ts/extractor:node_modules/@types/node",
        "//ts/extractor:node_modules/adm-zip",
        "//ts/extractor:node_modules/cli-progress",
        "//ts/extractor/utils",
    ],
)

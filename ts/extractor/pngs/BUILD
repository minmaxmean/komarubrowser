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
)

load("@aspect_rules_ts//ts:defs.bzl", "ts_project")

ts_project(
    name = "utils",
    srcs = ["utils.ts"],
    declaration = True,
    declaration_map = True,
    source_map = True,
    tsconfig = "//ts/extractor:tsconfig",
    visibility = ["//visibility:public"],
    deps = ["//ts/extractor:node_modules/@types/node"],
)

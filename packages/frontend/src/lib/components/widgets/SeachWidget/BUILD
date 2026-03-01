load("@aspect_rules_ts//ts:defs.bzl", "ts_project")

ts_project(
    name = "SeachWidget",
    srcs = [
        "scorers.ts",
        "search.ts",
    ],
    allow_js = True,
    no_emit = True,
    resolve_json_module = True,
    source_map = True,
    tsconfig = "//packages/frontend:tsconfig",
    visibility = ["//visibility:public"],
    deps = ["//ts/common/types"],
)

load("@aspect_rules_ts//ts:defs.bzl", "ts_project")

ts_project(
    name = "lib",
    srcs = [
        "index.ts",
        "utils.ts",
    ],
    allow_js = True,
    no_emit = True,
    resolve_json_module = True,
    source_map = True,
    tsconfig = "//packages/frontend:tsconfig",
    visibility = ["//visibility:public"],
    deps = [
        "//packages/frontend:node_modules/clsx",
        "//packages/frontend:node_modules/tailwind-merge",
    ],
)

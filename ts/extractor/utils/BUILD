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

ts_project(
    name = "utils",
    srcs = [
        "argutils.ts",
        "utils.ts",
    ],
    declaration = True,
    declaration_map = True,
    source_map = True,
    tsconfig = ":tsconfig",
    visibility = ["//visibility:public"],
    deps = [":node_modules/@types/node"],
)

npm_link_all_packages(name = "node_modules")

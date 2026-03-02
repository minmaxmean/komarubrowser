load("@aspect_rules_js//npm:defs.bzl", "npm_package")
load("@aspect_rules_ts//ts:defs.bzl", "ts_config", "ts_project")
load("@npm//:defs.bzl", "npm_link_all_packages")

npm_link_all_packages(name = "node_modules")

ts_config(
    name = "tsconfig",
    src = "tsconfig.json",
    visibility = [":__subpackages__"],
)

ts_project(
    name = "ts_lib",
    srcs = glob(["**/*.ts"]) + ["package.json"],
    declaration = True,
    declaration_map = True,
    out_dir = "dist",
    source_map = True,
    tsconfig = ":tsconfig",
    visibility = ["//visibility:public"],
    deps = [":node_modules/kysely"],
)

npm_package(
    name = "pkg",
    srcs = [
        "package.json",
        ":ts_lib",
    ],
    visibility = ["//:__pkg__"],
)

load("@aspect_rules_js//npm:defs.bzl", "npm_package")
load("@aspect_rules_ts//ts:defs.bzl", "ts_config")
load("@npm//:defs.bzl", "npm_link_all_packages")

ts_config(
    name = "tsconfig",
    src = "tsconfig.json",
    visibility = [":__subpackages__"],
)

npm_link_all_packages(name = "node_modules")

npm_package(
    name = "extractor",
    srcs = ["package.json"],
    visibility = ["//:__pkg__"],
)

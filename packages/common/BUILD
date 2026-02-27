load("@aspect_rules_js//js:defs.bzl", "js_library")
load("@aspect_rules_ts//ts:defs.bzl", "ts_config")
# load("@npm//:defs.bzl", "npm_link_all_packages")

load("@npm//:defs.bzl", "npm_link_all_packages")

package(default_visibility = ["//packages/extractor:__pkg__"])

# npm_link_all_packages(name = "node_modules")

# ts_project(
#   name = "common",
#   srcs = glob(["src/**/*.ts"]),
#   composite = True,
#   declaration = True,
#   declaration_map = True,
#   out_dir = "dist",
#   transpiler = "tsc",
#   ts_build_info_file = "dist/tsconfig.tsbuildinfo",
#   tsconfig = ":tsconfig.json",
#   deps = [],
# )

npm_link_all_packages(name = "node_modules")

js_library(
    name = "common",
    srcs = ["package.json"],
    visibility = ["//:__pkg__"],
)

ts_config(
    name = "tsconfig",
    src = "tsconfig.json",
    visibility = [":__subpackages__"],
)

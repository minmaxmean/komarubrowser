load("@aspect_rules_ts//ts:defs.bzl", "ts_project")
load("@npm//:defs.bzl", "npm_link_all_packages")

package(default_visibility = ["//packages/extractor:__pkg__"])

npm_link_all_packages(name = "node_modules")

ts_project(
  name = "common",
  srcs = glob(["src/**/*.ts"]),
  composite = True,
  declaration = True,
  declaration_map = True,
  out_dir = "dist",
  transpiler = "tsc",
  ts_build_info_file = "dist/tsconfig.tsbuildinfo",
  tsconfig = ":tsconfig.json",
  deps = [],
)

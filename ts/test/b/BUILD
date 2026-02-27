load("@aspect_rules_ts//ts:defs.bzl", "ts_config", "ts_project")
load("@aspect_rules_js//js:defs.bzl",  "js_binary")

ts_project(
    name = "b",
    srcs = ["b.ts"],
    declaration = True,
    tsconfig = ":tsconfig",
    visibility = ["//visibility:public"],
    deps = ["//ts/test/a"],
)

ts_config(
    name = "tsconfig",
    src = "tsconfig.json",
    visibility = [":__subpackages__"],
)

js_binary(
  name = "server",
  data = [":b"],
  entry_point = "b.js"
)

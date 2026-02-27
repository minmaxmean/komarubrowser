load("@aspect_rules_ts//ts:defs.bzl", "ts_project")
load("@npm//:defs.bzl", "npm_link_all_packages")

npm_link_all_packages(name = "node_modules")

ts_project(
    name = "ts",
    srcs = glob(["src/**/*.ts"]),
    declaration = True,
    transpiler = "tsc", # Or "swc" for massive speed gains
    tsconfig = "//:tsconfig.base.json", # Point to your base config
    deps = [
        ":node_modules/lodash", # Third-party dep
        "//packages/core:node_modules/@myrepo/core", # Internal workspace dep
    ],
)

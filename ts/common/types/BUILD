load("@aspect_rules_ts//ts:defs.bzl", "ts_project")

ts_project(
    name = "types",
    srcs = [
        "common.ts",
        "energyTier.ts",
        "index.ts",
        "ingredient.ts",
        "recipe.ts",
    ],
    declaration = True,
    declaration_map = True,
    source_map = True,
    tsconfig = "//ts/common:tsconfig",
    visibility = ["//visibility:public"],
)

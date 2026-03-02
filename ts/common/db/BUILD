load("@aspect_rules_ts//ts:defs.bzl", "ts_project")

ts_project(
    name = "db",
    srcs = [
        "database.ts",
        "ingredient.ts",
        "ingredientRepo.ts",
        "init.ts",
        "manifest.ts",
    ],
    declaration = True,
    declaration_map = True,
    source_map = True,
    tsconfig = "//ts/common:tsconfig",
    visibility = ["//visibility:public"],
    deps = ["//ts/common:node_modules/kysely"],
)

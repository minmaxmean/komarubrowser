load("@aspect_rules_ts//ts:defs.bzl", "ts_project")

ts_project(
    name = "tables",
    srcs = [
        "index.ts",
        "ingredient.ts",
        "manifest.ts",
        "recipe.ts",
    ],
    composite = True,
    declaration = True,
    declaration_map = True,
    out_dir = "dist",
    root_dir = "src",
    ts_build_info_file = "./dist/tsconfig.tsbuildinfo",
    tsconfig = "//packages/common:tsconfig",
    deps = ["//packages/common/src/types"],
)

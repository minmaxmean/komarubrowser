load("@aspect_rules_ts//ts:defs.bzl", "ts_project")

ts_project(
    name = "src",
    srcs = ["index.ts"],
    composite = True,
    declaration = True,
    declaration_map = True,
    out_dir = "dist",
    root_dir = "src",
    ts_build_info_file = "./dist/tsconfig.tsbuildinfo",
    tsconfig = "//packages/common:tsconfig",
)

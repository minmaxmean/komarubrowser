load("@aspect_bazel_lib//lib:copy_file.bzl", "copy_file")
load("@aspect_bazel_lib//lib:copy_to_bin.bzl", "copy_to_bin")
load("@aspect_bazel_lib//lib:copy_to_directory.bzl", "copy_to_directory")
load("@aspect_rules_js//js:defs.bzl", "js_run_devserver", "js_test")
load("@aspect_rules_js//npm:defs.bzl", "npm_package")
load("@npm//:defs.bzl", "npm_link_all_packages")
load("@npm//ts/web:vite/package_json.bzl", vite_bin = "bin")

npm_link_all_packages(
    name = "node_modules",
)

copy_to_bin(
    name = "config",
    srcs = [
        "components.json",
        "package.json",
        "svelte.config.js",
        "tsconfig.json",
        "vite.config.ts",
    ],
)

copy_to_bin(
    name = "vite_srcs",
    srcs = glob(["src/**/*"]),
    visibility = ["//visibility:public"],
)

copy_to_bin(
    name = "vite_static",
    srcs = glob(["static/**/*"]),
    visibility = ["//visibility:public"],
)

copy_file(
    name = "sql_wasm",
    src = ":node_modules/sql.js/dist/sql-wasm.wasm",
    out = "static/wasm/sql-wasm.wasm",
)

copy_to_directory(
    name = "minecraft_assets",
    srcs = [
        "//minecraft/star_t:ingredients.json",
        "//minecraft/star_t:recipes.json",
        "//ts/extractor/db:build_db",
        "//ts/extractor/pngs:extract_pngs",
    ],
    out = "static/assets/",
    replace_prefixes = {
        "minecraft/star_t": "dump",
        "ts/extractor/db": "",
        "ts/extractor/pngs/extracted_pngs/assets": "",
    },
)

filegroup(
    name = "static_files",
    srcs = [
        ":minecraft_assets",
        ":sql_wasm",
        ":vite_static",
    ],
)

vite_bin.vite(
    name = "build",
    srcs = [
        ":config",
        ":node_modules",
        ":static_files",
        ":vite_srcs",
    ],
    args = ["build"],
    chdir = package_name(),
    out_dirs = [
        "dist",
        ".svelte-kit",
    ],
    visibility = ["//visibility:public"],
)

vite_bin.vite_binary(
    name = "dev",
    chdir = package_name(),
    data = [
        ":config",
        ":node_modules",
        ":static_files",
        ":vite_srcs",
    ],
    # env = {
    #     "ALLOW_SERVE": "$(execroot :node_modules)",
    # },
    tags = ["ibazel_notify_changes"],
)

# gazelle:exclude *

npm_package(
    name = "web",
    visibility = ["//:__pkg__"],
)

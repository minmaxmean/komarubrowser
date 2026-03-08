load("@aspect_bazel_lib//lib:copy_file.bzl", "copy_file")
load("@aspect_bazel_lib//lib:copy_to_bin.bzl", "copy_to_bin")
load("@aspect_bazel_lib//lib:copy_to_directory.bzl", "copy_to_directory")
load("@aspect_rules_js//js:defs.bzl", "js_run_devserver", "js_test")
load("@aspect_rules_js//npm:defs.bzl", "npm_package")
load("@npm//:defs.bzl", "npm_link_all_packages", "npm_link_targets")
load("@npm//ts/web:vite/package_json.bzl", vite_bin = "bin")
load("@rules_pkg//pkg:tar.bzl", "pkg_tar")

# gazelle:exclude *
npm_link_all_packages(name = "node_modules")

filegroup(
    name = "config",
    srcs = [
        "components.json",
        "package.json",
        "svelte.config.js",
        "tsconfig.json",
        "vite.config.ts",
    ],
)

filegroup(
    name = "vite_srcs",
    srcs = glob(["src/**/*"]),
    visibility = ["//visibility:public"],
)

filegroup(
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

DEPS = npm_link_targets()

SRCS = [
    ":config",
    ":static_files",
    ":vite_srcs",
]

vite_bin.vite(
    name = "build",
    srcs = DEPS + SRCS,
    args = ["build"],
    chdir = package_name(),
    out_dirs = ["dist"],
    silent_on_success = False,
    visibility = ["//visibility:public"],
)

# vite_bin.vite_binary(
#     name = "dev",
#     chdir = package_name(),
#     data = DEPS + SRCS,
#     # tags = ["ibazel_notify_changes"],
# )

vite_bin.vite_binary(name = "vite_server")

js_run_devserver(
    name = "dev",
    chdir = package_name(),
    data = DEPS + SRCS,
    tool = ":vite_server",
)

npm_package(
    name = "web",
    visibility = ["//:__pkg__"],
)

pkg_tar(
    name = "build_pkg",
    srcs = [":build"],
)

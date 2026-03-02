load("@aspect_bazel_lib//lib:copy_file.bzl", "copy_file")
load("@aspect_bazel_lib//lib:copy_to_bin.bzl", "copy_to_bin")
load("@aspect_rules_js//js:defs.bzl", "js_run_devserver", "js_test")
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
    name = "minecraft_assets",
    src = "//minecraft/star_t:ingredients.json",
    out = "static/assets/dump/ingredients.min.json",
)

vite_bin.vite(
    name = "build",
    srcs = [
        ":config",
        ":minecraft_assets",
        ":node_modules",
        ":vite_srcs",
        ":vite_static",
        "//ts/common/types",
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
        ":minecraft_assets",
        ":node_modules",
        ":vite_srcs",
        ":vite_static",
        "//ts/common/types",
    ],
    # env = {
    #     "ALLOW_SERVE": "$(execroot :node_modules)",
    # },
    tags = ["ibazel_notify_changes"],
)

# gazelle:exclude *

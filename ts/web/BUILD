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
    name = "vite_srcs_export",
    srcs = glob(["src/**/*"]),
    visibility = ["//visibility:public"],
)

copy_to_bin(
    name = "vite_public_export",
    srcs = glob(["static/**/*"]),
    visibility = ["//visibility:public"],
)

###
vite_bin.vite(
    name = "build",
    srcs = [
        ":config",
        ":node_modules",
        ":vite_public_export",
        ":vite_srcs_export",
        "//ts/common/types",
    ],
    args = ["build"],
    chdir = package_name(),
    env = {
        "DEBUG": "*",
    },
    out_dirs = [
        "dist",
        ".svelte-kit",
    ],
    visibility = ["//visibility:public"],
)
# gazelle:exclude *

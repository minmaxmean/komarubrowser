load("@bazel_lib//lib:copy_to_bin.bzl", "copy_to_bin")
load("@rules_shell//shell:sh_binary.bzl", "sh_binary")

copy_to_bin(
    name = "server_mods",
    srcs = glob(
        ["server_data/mods/*.jar"],
        exclude = ["server_data/mods/komarubrowser-*.jar"],
    ),
    visibility = ["//visibility:public"],
)

copy_to_bin(
    name = "server_kubejs_pngs",
    srcs = glob(["server_data/kubejs/**/*.png"]),
    visibility = ["//visibility:public"],
)

sh_binary(
    name = "launch_client",
    srcs = ["launch_client.sh"],
    args = ["$(location //minecraft/forgemod:mod_jar)"],
    data = ["//minecraft/forgemod:mod_jar"],
    env = {
        "STAR_T_CLIENT_DIR": "/Users/m-nny/Library/Application Support/PrismLauncher/instances/KomaruBrowser/minecraft",
    },
    tags = ["local"],
    visibility = ["//visibility:public"],
)

sh_binary(
    name = "launch_server",
    srcs = ["launch_server.sh"],
    args = ["$(location //minecraft/forgemod:mod_jar)"],
    data = ["//minecraft/forgemod:mod_jar"],
    tags = ["local"],
)

genrule(
    name = "dump_jsons",
    srcs = ["dump_jsons.sh"],
    outs = [
        "recipes.json",
        "ingredients.json",
        "machines.json",
    ],
    cmd = "$(location dump_jsons.sh) $(@D)",
    tags = ["local"],
    visibility = ["//visibility:public"],
)

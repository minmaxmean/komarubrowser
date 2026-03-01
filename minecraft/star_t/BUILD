load("@rules_shell//shell:sh_binary.bzl", "sh_binary")

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

load("@gazelle//:def.bzl", "gazelle")
load("@npm//:defs.bzl", "npm_link_all_packages")

npm_link_all_packages(name = "node_modules")

# gazelle:build_file_name BUILD
# gazelle:js_package_rule_kind js_library
# gazelle:exclude packages/extractor/*
# gazelle:exclude packages/frontend/*
gazelle(
    name = "gazelle",
    env = {
        "ENABLE_LANGUAGES": ",".join([
            "starlark",
            "js",
        ]),
    },
    gazelle = "@multitool//tools/gazelle",
)

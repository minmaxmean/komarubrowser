load("@aspect_rules_ts//ts:defs.bzl", "ts_config", "ts_project")
load("@npm//:defs.bzl", "npm_link_all_packages")

npm_link_all_packages(name = "node_modules")

ts_project(
    name = "frontend",
    srcs = [
        ".prettierrc.ts",
        "vite.config.ts",
    ],
    allow_js = True,
    no_emit = True,
    resolve_json_module = True,
    source_map = True,
    tsconfig = ":tsconfig",
    visibility = ["//visibility:public"],
    deps = [
        ":node_modules/@sveltejs/kit",
        ":node_modules/@tailwindcss/vite",
        ":node_modules/prettier",
        ":node_modules/vite",
    ],
)

ts_config(
    name = "tsconfig",
    src = "tsconfig.json",
    visibility = [":__subpackages__"],
    deps = [":sveltekit_tsconfig"],
)

ts_config(
    name = "sveltekit_tsconfig",
    src = ".svelte-kit/tsconfig.json",
    visibility = [":__subpackages__"],
)

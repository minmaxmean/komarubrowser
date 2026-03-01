filegroup(
    name = "src",
    srcs = glob(
        [
            "src/**/*.java",
            "src/**/*.kt",
            "src/main/resources/**",
        ],
        allow_empty = True,
        exclude = ["src/generated/**"],
    ) + [
        "build.gradle",
        "gradle.properties",
        "settings.gradle",
    ],
)

genrule(
    name = "mod_jar",
    srcs = [":src", "gradlew"],
    outs = ["komarubrowser-1.20.1-0.1.0.jar"],
    cmd = """
        # export GRADLE_USER_HOME=$$(pwd)/.gradle_home
        OUT_FILE=$$(pwd)/$@
        cd minecraft/forgemod
        ./gradlew jar
        cp dist/libs/komarubrowser-1.20.1-0.1.0.jar $$OUT_FILE
    """,
  tags = ["local"],
    visibility = ["//visibility:public"],
)

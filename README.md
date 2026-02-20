# Komaru Browser

This project is inteded for browsing recipes & planning processing lines for Star Technology modpack.

## Architecture

1. KomaruBrowser mod - Kotlin minecraft mod will live on Minecraft server serving REST API that will allow to get up to date recipes & machines.
2. KomaruBrowserBackend - golang backend that will talk to Kotlin mod, cache recipes, items, fluids etc & serve frontend.
3. KomaruBrowserFronend - webapp that talks to backend, allows searching for item, item recipes, calculating proc lines.

package kz.uwu.komarubrowser

import kz.uwu.komarubrowser.rest.PlannerServer
import net.minecraftforge.event.server.ServerStartedEvent
import net.minecraftforge.event.server.ServerStoppingEvent
import net.minecraftforge.fml.common.Mod
import org.apache.logging.log4j.Level
import org.apache.logging.log4j.LogManager
import org.apache.logging.log4j.Logger
import thedarkcolour.kotlinforforge.forge.FORGE_BUS

// The value here should match an entry in the META-INF/mods.toml file
@Mod(KomaruBrowser.MODID)
object KomaruBrowser {
  const val MODID = "komarubrowser"

  // the logger for our mod
  private val LOGGER: Logger = LogManager.getLogger()
  private var apiServer: PlannerServer? = null

  init {
    LOGGER.log(Level.INFO, "Hello world!")

    FORGE_BUS.addListener(::onServerStart)
    FORGE_BUS.addListener(::onServerStop)
  }

  private fun onServerStart(event: ServerStartedEvent) {
    LOGGER.log(Level.INFO, "ServerStartedEvent event", event)
    apiServer = PlannerServer(6767).apply { start() }
  }

  private fun onServerStop(event: ServerStoppingEvent) {
    LOGGER.log(Level.INFO, "ServerStoppingEvent event", event)
    if (apiServer != null) {
      apiServer?.stop()
    }
  }
}

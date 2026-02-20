package kz.uwu.komarubrowser

import net.minecraftforge.fml.common.Mod
import net.minecraftforge.fml.event.lifecycle.FMLDedicatedServerSetupEvent
import net.minecraftforge.event.server.ServerStartingEvent
import net.minecraftforge.event.server.ServerStoppingEvent
import org.apache.logging.log4j.Level
import org.apache.logging.log4j.LogManager
import org.apache.logging.log4j.Logger
import thedarkcolour.kotlinforforge.forge.MOD_BUS
import thedarkcolour.kotlinforforge.forge.FORGE_BUS
import kz.uwu.komarubrowser.rest.PlannerServer


// The value here should match an entry in the META-INF/mods.toml file
@Mod(KomaruBrowser.MODID)
object KomaruBrowser {
  const val MODID = "komarubrowser";

  // the logger for our mod
  private val LOGGER: Logger = LogManager.getLogger()
  private var apiServer: PlannerServer? = null

  init {
    LOGGER.log(Level.INFO, "Hello world!")

    MOD_BUS.addListener(::onServerSetup)
    FORGE_BUS.addListener(::onServerStart)
    FORGE_BUS.addListener(::onServerStop)
  }

  /**
   * Fired on the global Forge bus.
   */
  private fun onServerSetup(event: FMLDedicatedServerSetupEvent) {
    LOGGER.log(Level.INFO, "FMLDedicatedServerSetupEvent event", event)
    apiServer = PlannerServer(6767).apply { start() }
  }

  private fun onServerStart(event: ServerStartingEvent) {
    LOGGER.log(Level.INFO, "ServerStartingEvent event", event)
  }

  private fun onServerStop(event: ServerStoppingEvent) {
    LOGGER.log(Level.INFO, "ServerStoppingEvent event", event)
  }
}

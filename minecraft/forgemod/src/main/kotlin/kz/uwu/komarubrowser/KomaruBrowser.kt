package kz.uwu.komarubrowser

import kz.uwu.komarubrowser.rest.PlannerServer
import net.minecraft.client.Minecraft
import net.minecraftforge.event.GameShuttingDownEvent
import net.minecraftforge.event.server.ServerStartedEvent
import net.minecraftforge.event.server.ServerStoppingEvent
import net.minecraftforge.fml.common.Mod
import net.minecraftforge.fml.event.lifecycle.FMLClientSetupEvent
import net.minecraftforge.fml.event.lifecycle.FMLLoadCompleteEvent
import org.apache.logging.log4j.Level
import org.apache.logging.log4j.LogManager
import org.apache.logging.log4j.Logger
import thedarkcolour.kotlinforforge.forge.FORGE_BUS
import thedarkcolour.kotlinforforge.forge.MOD_BUS
import thedarkcolour.kotlinforforge.forge.runForDist

// The value here should match an entry in the META-INF/mods.toml file
@Mod(KomaruBrowser.MODID)
object KomaruBrowser {
  const val MODID = "komarubrowser"

  // the logger for our mod
  private val LOGGER: Logger = LogManager.getLogger()
  private var apiServer: PlannerServer? = null

  init {
    LOGGER.log(Level.INFO, "Hello world!")

    val x = runForDist(
      clientTarget = {
        MOD_BUS.addListener(::onLoadComplete)
        FORGE_BUS.addListener(::onClientShuttingDown)
      },
      serverTarget = {
        FORGE_BUS.addListener(::onServerStart)
        FORGE_BUS.addListener(::onServerStop)
      }
    )
  }

  private fun onServerStart(event: ServerStartedEvent) {
    LOGGER.info("ServerStartedEvent event {}", event)
    apiServer = PlannerServer(event.server, 6767).apply { start() }
  }

  private fun onServerStop(event: ServerStoppingEvent) {
    LOGGER.log(Level.INFO, "ServerStoppingEvent {}", event)
    if (apiServer != null) {
      apiServer?.stop()
    }
  }

  private fun onLoadComplete(event: FMLLoadCompleteEvent) {
    LOGGER.info("Starting PlannerServer on Client side on FMLLoadCompleteEvent...")
    apiServer = PlannerServer(null, 7676).apply { start() }
  }

  private fun onClientShuttingDown(event: GameShuttingDownEvent) {
    LOGGER.log(Level.INFO, "GameShuttingDownEvent {}", event)
    if (apiServer != null) {
      apiServer?.stop()
    }

  }
}

package kz.uwu.komarubrowser

import net.minecraft.client.Minecraft
import net.minecraftforge.fml.common.Mod
import net.minecraftforge.fml.event.lifecycle.FMLClientSetupEvent
import net.minecraftforge.fml.event.lifecycle.FMLDedicatedServerSetupEvent
import org.apache.logging.log4j.Level
import org.apache.logging.log4j.LogManager
import org.apache.logging.log4j.Logger
import thedarkcolour.kotlinforforge.forge.MOD_BUS
import thedarkcolour.kotlinforforge.forge.runForDist


// The value here should match an entry in the META-INF/mods.toml file
@Mod(KomaruBrowser.MODID)
object KomaruBrowser {
  const val MODID = "komarubrowser";

  // the logger for our mod
  val LOGGER: Logger = LogManager.getLogger()


  init {
    LOGGER.log(Level.INFO, "Hello world!")

    MOD_BUS.addListener(::onServerSetup)
  }

  /**
   * Fired on the global Forge bus.
   */
  private fun onServerSetup(@Suppress("UNUSED_PARAMETER") event: FMLDedicatedServerSetupEvent) {
    LOGGER.log(Level.INFO, "Server starting...")
  }
}

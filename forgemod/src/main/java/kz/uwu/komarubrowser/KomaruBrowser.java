package kz.uwu.komarubrowser;

import com.mojang.logging.LogUtils;
import net.minecraft.world.level.block.Blocks;
import net.minecraftforge.common.MinecraftForge;
import net.minecraftforge.event.server.ServerStartingEvent;
import net.minecraftforge.eventbus.api.IEventBus;
import net.minecraftforge.eventbus.api.SubscribeEvent;
import net.minecraftforge.fml.common.Mod;
import net.minecraftforge.fml.config.ModConfig;
import net.minecraftforge.fml.event.lifecycle.FMLCommonSetupEvent;
import net.minecraftforge.fml.javafmlmod.FMLJavaModLoadingContext;
import net.minecraftforge.registries.ForgeRegistries;
import org.slf4j.Logger;

// The value here should match an entry in the META-INF/mods.toml file
@Mod(KomaruBrowser.MODID)
public class KomaruBrowser {
  // Define mod id in a common place for everything to reference
  public static final String MODID = "komarubrowser";
  // Directly reference a slf4j logger
  private static final Logger LOGGER = LogUtils.getLogger();

  public KomaruBrowser(FMLJavaModLoadingContext context) {
    IEventBus modEventBus = context.getModEventBus();

    // Register the commonSetup method for modloading
    modEventBus.addListener(this::commonSetup);

    // Register ourselves for server and other game events we are interested in
    MinecraftForge.EVENT_BUS.register(this);

    // Register our mod's ForgeConfigSpec so that Forge can create and load the
    // config file for us
    context.registerConfig(ModConfig.Type.COMMON, Config.SPEC);
  }

  private void commonSetup(final FMLCommonSetupEvent event) {
    // Some common setup code
    LOGGER.info("HELLO FROM COMMON SETUP");

    if (Config.logDirtBlock)
      LOGGER.info("DIRT BLOCK >> {}", ForgeRegistries.BLOCKS.getKey(Blocks.DIRT));

    LOGGER.info(Config.magicNumberIntroduction + Config.magicNumber);

    Config.items.forEach((item) -> LOGGER.info("ITEM >> {}", item.toString()));
  }

  // You can use SubscribeEvent and let the Event Bus discover methods to call
  @SubscribeEvent
  public void onServerStarting(ServerStartingEvent event) {
    // Do something when the server starts
    LOGGER.info("HELLO from server starting");
  }
}

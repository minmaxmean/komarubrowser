package kz.uwu.komarubrowser.client

import kz.uwu.komarubrowser.dump.IngredientDTO
import net.minecraft.client.Minecraft
import net.minecraft.resources.ResourceLocation
import net.minecraft.world.item.ItemStack
import net.minecraft.world.level.material.Fluids
import net.minecraftforge.api.distmarker.Dist
import net.minecraftforge.client.extensions.common.IClientFluidTypeExtensions
import net.minecraftforge.client.model.data.ModelData
import net.minecraftforge.fml.loading.FMLEnvironment
import net.minecraftforge.registries.ForgeRegistries
import org.apache.logging.log4j.LogManager
import org.apache.logging.log4j.Logger

object TextureAdder {
  val logger: Logger = LogManager.getLogger()
  fun addTextureLocation(ing: IngredientDTO) {
    val rl = ResourceLocation(ing.id)
    if (ing.isFluid) {
      val fluid = ForgeRegistries.FLUIDS.getValue(rl) ?: return
      val type = fluid.fluidType

      if (fluid.isSame(Fluids.EMPTY)) return

      // Use the static helper to get the client-side properties
      val clientExtensions = IClientFluidTypeExtensions.of(type)

      logger.info("Processing fluid {}", ing.id)

      // Get the Still texture (the icon used in buckets/UIs)
      val stillTexture: ResourceLocation = clientExtensions.stillTexture

      // Convert to physical JAR path
      // Format: namespace:textures/block/water_still.png
      ing.textureLocation = "${stillTexture.namespace}:textures/${stillTexture.path}.png"

      // Bonus: Get the color tint for fluids (like GregTech chemicals)
      val colorInt = clientExtensions.tintColor
      ing.hexColor = String.format("#%06X", (0xFFFFFF and colorInt))

    } else {
      val item = ForgeRegistries.ITEMS.getValue(rl) ?: return
      val stack = ItemStack(item) // Create a default stack

      // Use the Minecraft client-side model manager
      val mc = Minecraft.getInstance()
      val model = mc.itemRenderer.getModel(stack, null, null, 0)

      // Use the Forge-recommended non-deprecated method
      val sprite = model.getParticleIcon(ModelData.EMPTY)
      val atlasLoc = sprite.contents().name()

      ing.textureLocation = "${atlasLoc.namespace}:textures/${atlasLoc.path}.png"
      val tintColor = Minecraft.getInstance().itemColors.getColor(stack, 0)
      ing.hexColor = String.format("#%06X", (0xFFFFFF and tintColor))
    }
  }
}

fun IngredientDTO.addVisualData() {
  if (FMLEnvironment.dist == Dist.CLIENT) {
    TextureAdder.addTextureLocation(this)
  }
}
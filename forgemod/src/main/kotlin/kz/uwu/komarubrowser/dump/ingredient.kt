package kz.uwu.komarubrowser.dump

import kotlin.jvm.optionals.getOrNull
import net.minecraft.world.item.Item
import net.minecraft.world.level.material.Fluid
import net.minecraftforge.registries.ForgeRegistries
import net.minecraftforge.registries.IForgeRegistry

data class IngredientDTO(
    val id: String,
    val displayName: String,
    val isFluid: Boolean,
    val tags: List<String>,
    val sourceJar: String,
) {
  companion object {
    fun fromItem(item: Item): IngredientDTO {
      val res = ForgeRegistries.ITEMS.getKey(item)!!
      return IngredientDTO(
          id = res.toString(),
          displayName = resolveComponent(item.description),
          isFluid = false,
          tags = item.getTagsStrings(ForgeRegistries.ITEMS),
          sourceJar = getJarName(res.namespace),
      )
    }

    fun fromFluid(fluid: Fluid): IngredientDTO {
      val res = ForgeRegistries.FLUIDS.getKey(fluid)!!
      return IngredientDTO(
          id = res.toString(),
          displayName = resolveComponent(fluid.fluidType.description),
          isFluid = true,
          tags = fluid.getTagsStrings(ForgeRegistries.FLUIDS),
          sourceJar = getJarName(res.namespace),
      )
    }
  }
}

/** Extension function to get tags for any registry object cleanly. */
fun <T> T.getTagsStrings(registry: IForgeRegistry<T>): List<String> {
  if (this == null) {
    return emptyList()
  }
  val reverseTag = registry.tags()?.getReverseTag(this)?.getOrNull() ?: return emptyList()
  val tagKeys = reverseTag.tagKeys.map { it.location() } ?: return emptyList()
  return tagKeys.map { it.toString() }.toList() ?: emptyList()
}

fun getAllIngredient(): List<IngredientDTO> {
  val allItems = ForgeRegistries.ITEMS.values.map { IngredientDTO.fromItem(it) }
  val allFluids = ForgeRegistries.FLUIDS.values.map { IngredientDTO.fromFluid(it) }
  return allItems + allFluids
}

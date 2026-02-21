package kz.uwu.komarubrowser.search

import net.minecraft.world.item.Item
import net.minecraft.world.level.material.Fluid
import net.minecraftforge.registries.ForgeRegistries
import net.minecraftforge.registries.IForgeRegistry
import kotlin.jvm.optionals.getOrNull

data class Ingredient(
  val id: String,
  val displayName: String,
  val isFluid: Boolean,
  val tags: List<String>,
) {
  companion object {
    fun fromItem(item: Item) = Ingredient(
      id = ForgeRegistries.ITEMS.getKey(item).toString(),
      displayName = item.description.string,
      isFluid = false,
      tags = item.getTagsStrings(ForgeRegistries.ITEMS),
    )
    fun fromFluid(fluid: Fluid) = Ingredient(
      id = ForgeRegistries.FLUIDS.getKey(fluid).toString(),
      displayName = fluid.fluidType.description.string,
      isFluid = false,
      tags = fluid.getTagsStrings(ForgeRegistries.FLUIDS),
    )
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

fun getAllIngrediens(): List<Ingredient> {
  val allItems =  ForgeRegistries.ITEMS.values.map { Ingredient.fromItem(it) }
  val allFluids = ForgeRegistries.FLUIDS.values.map { Ingredient.fromFluid(it) }
  return allItems + allFluids
}
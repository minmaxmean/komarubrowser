package kz.uwu.komarubrowser.search

import kz.uwu.komarubrowser.dump.getTagsStrings
import net.minecraft.world.item.Item
import net.minecraft.world.level.material.Fluid
import net.minecraftforge.registries.ForgeRegistries
import net.minecraftforge.registries.IForgeRegistry

data class ItemSearchResult(
    val id: String,
    val displayName: String,
    val type: String,
    val tags: List<String>,
)

fun searchItem(query: String): List<ItemSearchResult> {
  val lowercaseQuery = query.lowercase()
  return listOf(ForgeRegistries.ITEMS, ForgeRegistries.FLUIDS).flatMap { it.search(lowercaseQuery) }
}

private fun <T> IForgeRegistry<T>.search(lowercaseQuery: String): List<ItemSearchResult> {
  return this.entries
      .filter { (key, entry) ->
        if (key.location().toString().contains(lowercaseQuery)) return@filter true
        val displayName =
            when (entry) {
              is Item -> entry.description.string
              is Fluid -> entry.fluidType.description.string
              else -> "Unknown"
            }
        displayName.lowercase().contains(lowercaseQuery)
      }
      .map { (key, entry) ->
        val displayName =
            when (entry) {
              is Item -> entry.description.string
              is Fluid -> entry.fluidType.description.string
              else -> "Unknown"
            }
        ItemSearchResult(
            id = key.location().toString(),
            displayName = displayName,
            tags = entry.getTagsStrings(this).sorted(),
            type = this.registryName.toString(),
        )
      }
}

package kz.uwu.komarubrowser.search

import kotlin.jvm.optionals.getOrNull
import net.minecraft.resources.ResourceLocation
import net.minecraft.world.item.Item
import net.minecraft.world.level.material.Fluid
import net.minecraftforge.registries.ForgeRegistries
import net.minecraftforge.registries.IForgeRegistry

data class SearchResult(
    val id: ResourceLocation,
    val displayName: String,
    val type: ResourceLocation,
    val tags: List<ResourceLocation>,
)

fun search(query: String): List<SearchResult> {
  val lowercaseQuery = query.lowercase()
  return listOf(ForgeRegistries.ITEMS, ForgeRegistries.FLUIDS).flatMap { it.search(lowercaseQuery) }
}

/** Extension function to get tags for any registry object cleanly. */
private fun <T> T.getTagsStrings(registry: IForgeRegistry<T>): List<ResourceLocation> {
  if (this == null) {
    return emptyList()
  }
  val reverseTag = registry.tags()?.getReverseTag(this)?.getOrNull() ?: return emptyList()
  val tagKeys = reverseTag.tagKeys.map { it.location() } ?: return emptyList()
  return tagKeys.toList() ?: emptyList()
}

private fun <T> IForgeRegistry<T>.search(lowercaseQuery: String): List<SearchResult> {
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
        SearchResult(
            id = key.location(),
            displayName = displayName,
            tags = entry.getTagsStrings(this).sorted(),
            type = this.registryName,
        )
      }
}

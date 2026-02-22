package kz.uwu.komarubrowser.search

import net.minecraft.locale.Language
import net.minecraft.network.chat.Component
import net.minecraft.network.chat.contents.TranslatableContents
import net.minecraft.network.chat.contents.LiteralContents
import net.minecraft.world.item.Item
import net.minecraft.world.level.material.Fluid
import net.minecraftforge.registries.ForgeRegistries
import net.minecraftforge.registries.IForgeRegistry
import org.apache.logging.log4j.LogManager
import org.apache.logging.log4j.Logger
import java.util.*
import kotlin.jvm.optionals.getOrNull

val logger: Logger = LogManager.getLogger()

data class Ingredient(
  val id: String,
  val displayName: String,
  val isFluid: Boolean,
  val tags: List<String>,
) {
  companion object {
    fun fromItem(item: Item) = Ingredient(
      id = ForgeRegistries.ITEMS.getKey(item).toString(),
      displayName = resolveComponent( item.description ),
      isFluid = false,
      tags = item.getTagsStrings(ForgeRegistries.ITEMS),
    )

    fun fromFluid(fluid: Fluid) = Ingredient(
      id = ForgeRegistries.FLUIDS.getKey(fluid).toString(),
      displayName = resolveComponent( fluid.fluidType.description ),
      isFluid = true,
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

fun getAllIngredient(): List<Ingredient> {
  val allItems = ForgeRegistries.ITEMS.values.map { Ingredient.fromItem(it) }
  val allFluids = ForgeRegistries.FLUIDS.values.map { Ingredient.fromFluid(it) }
  return allItems + allFluids
}

// Converts "material.gtceu.abyssal_alloy" -> "Abyssal Alloy"
fun formatFallback(key: String): String {
  val lastPart = key.substringAfterLast('.')
  return lastPart.split('_').joinToString(" ") { word ->
    word.replaceFirstChar { if (it.isLowerCase()) it.titlecase(Locale.ROOT) else it.toString() }
  }
}

fun resolveComponent(component: Component): String {
  val text = when (val contents = component.contents) {
    is TranslatableContents -> {
      // Get the globally loaded server dictionary
      val lang = Language.getInstance()

      // If the server knows the translation (e.g. "tagprefix.hot_ingot"), use it.
      // If it's missing (e.g. "material.gtceu.abyssal_alloy"), use our fallback.
      val formatString = if (lang.has(contents.key)) {
        lang.getOrDefault(contents.key)
      } else {
        formatFallback(contents.key)
      }

      val args = contents.args.map { arg ->
        if (arg is Component) resolveComponent(arg) else arg.toString()
      }.toTypedArray()

      try {
        if (args.isEmpty()) formatString else String.format(formatString, *args)
      } catch (e: Exception) {
        logger.warn("Unexpected error while resolving component '$component': ${e.message}")
        formatString
      }
    }
    is LiteralContents -> {
      contents.text()
    }

    else -> {
      // Logs the exact Java class name of the unexpected contents (e.g., net.minecraft.network.chat.contents.LiteralContents)
      logger.warn("Unexpected component content type '${contents::class.java.name}' while resolving component '$component'")
      contents.toString()
    }
  }

  val siblingsText = component.siblings.joinToString("") { resolveComponent(it) }
  return text + siblingsText
}
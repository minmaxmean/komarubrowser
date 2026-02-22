package kz.uwu.komarubrowser.dump

import net.minecraft.locale.Language
import net.minecraft.network.chat.Component
import net.minecraft.network.chat.contents.LiteralContents
import net.minecraft.network.chat.contents.TranslatableContents
import org.apache.logging.log4j.LogManager
import org.apache.logging.log4j.Logger
import java.util.*


// Converts "material.gtceu.abyssal_alloy" -> "Abyssal Alloy"
fun formatFallback(key: String): String {
  val lastPart = key.substringAfterLast('.')
  return lastPart.split('_').joinToString(" ") { word ->
    word.replaceFirstChar { if (it.isLowerCase()) it.titlecase(Locale.ROOT) else it.toString() }
  }
}

fun resolveComponent(component: Component): String {
  val logger: Logger = LogManager.getLogger()
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

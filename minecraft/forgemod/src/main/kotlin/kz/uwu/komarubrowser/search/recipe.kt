package kz.uwu.komarubrowser.search

import com.google.gson.JsonArray
import com.google.gson.JsonElement
import com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability
import com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability
import com.gregtechceu.gtceu.api.capability.recipe.RecipeCapability
import com.gregtechceu.gtceu.api.recipe.GTRecipe
import com.gregtechceu.gtceu.api.recipe.GTRecipeSerializer
import com.gregtechceu.gtceu.api.recipe.content.Content
import com.gregtechceu.gtceu.api.recipe.ingredient.FluidIngredient
import com.gregtechceu.gtceu.api.registry.GTRegistries
import com.mojang.serialization.JsonOps
import java.util.*
import kotlin.jvm.optionals.getOrNull
import net.minecraft.resources.ResourceLocation
import net.minecraft.world.item.crafting.Ingredient
import net.minecraft.world.item.crafting.RecipeManager
import net.minecraftforge.registries.ForgeRegistries

fun Map<RecipeCapability<*>, List<Content>>.containsFluid(targetId: ResourceLocation): Boolean {
  return this.getOrDefault(FluidRecipeCapability.CAP, emptyList()).any { contentWrapper ->
    val ingredient = contentWrapper.content as? FluidIngredient ?: return false
    return ingredient.getStacks().any { stack ->
      val inputFluid = ForgeRegistries.FLUIDS.getKey(stack?.fluid)
      inputFluid == targetId
    }
  }
}

fun Map<RecipeCapability<*>, List<Content>>.containsItem(targetId: ResourceLocation): Boolean {
  return this.getOrDefault(ItemRecipeCapability.CAP, emptyList()).any { contentWrapper ->
    val ingredient = contentWrapper.content as? Ingredient ?: return false
    return ingredient.items.any { stack ->
      val inputItem = ForgeRegistries.ITEMS.getKey(stack.item)
      inputItem == targetId
    }
  }
}

fun RecipeManager.getAllGTRecipes(): List<GTRecipe> {
  return GTRegistries.RECIPE_TYPES.flatMap { recipeType -> this.getAllRecipesFor(recipeType) }
}

fun RecipeManager.getAllGTRecipesWith(target: String): List<GTRecipe> {
  val targetId = ResourceLocation(target)
  return if (ForgeRegistries.FLUIDS.containsKey(targetId)) {
    this.getAllGTRecipes().filter {
      if (it.inputs.containsFluid(targetId)) return@filter true
      if (it.outputs.containsFluid(targetId)) return@filter true
      return@filter false
    }
  } else if (ForgeRegistries.ITEMS.containsKey(targetId)) {
    this.getAllGTRecipes().filter {
      it.inputs.containsItem(targetId) || it.outputs.containsItem(targetId)
    }
  } else {
    emptyList()
  }
}

fun GTRecipe.toJsonElement(): Optional<JsonElement> {
  val codec = GTRecipeSerializer.CODEC
  return codec.encodeStart(JsonOps.INSTANCE, this).result()
}

fun List<GTRecipe>.toJsonElement(): JsonElement {
  val jsonArray = JsonArray()
  this.mapNotNull { it.toJsonElement().getOrNull() }.forEach { jsonArray.add(it) }
  return jsonArray
}

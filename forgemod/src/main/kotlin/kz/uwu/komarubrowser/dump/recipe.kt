package kz.uwu.komarubrowser.dump

import com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability
import com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability
import com.gregtechceu.gtceu.api.recipe.GTRecipe
import com.gregtechceu.gtceu.api.recipe.RecipeHelper
import com.gregtechceu.gtceu.api.recipe.content.Content
import com.gregtechceu.gtceu.api.recipe.ingredient.FluidIngredient
import net.minecraft.world.item.crafting.Ingredient
import net.minecraftforge.registries.ForgeRegistries
import org.apache.logging.log4j.LogManager
import org.apache.logging.log4j.Logger

data class RecipeIngredientDTO(
  val amount: Int,
  val chance: Int,
  val acceptedIds: List<String>,
  val perTick: Boolean = false,
) {
  companion object {
    val logger: Logger = LogManager.getLogger()
    fun fromItemContent(cap: Content, perTick: Boolean = false): RecipeIngredientDTO? {
      val ingredient = cap.content as? Ingredient
      if (ingredient == null) {
        logger.warn("Ingredient was not an Ingredient object but: ${cap.content::javaClass.name}")
        return null
      }
      val stacks = ingredient.items
      val amount = stacks.first().count
      val acceptedIds = stacks.mapNotNull {
        if (it.count != amount) {
          logger.warn("item stack required different amount: $it vs $amount: $cap")
        }
        ForgeRegistries.ITEMS.getKey(it.item).toString()
      }
      return RecipeIngredientDTO(
        amount = amount,
        chance = cap.chance,
        acceptedIds = acceptedIds,
        perTick = perTick,
      )
    }

    fun fromFluidContent(cap: Content, perTick: Boolean = false): RecipeIngredientDTO? {
      val ingredient = cap.content as? FluidIngredient
      if (ingredient == null) {
        logger.warn("Ingredient was not an FluidIngredient object but: ${cap.content::javaClass.name}")
        return null
      }
      val stacks = ingredient.getStacks()
      if (stacks == null) {
        logger.warn("fluid stacks is null: $cap")
        return null
      }
      val amount = stacks.first()?.amount ?: return null
      val acceptedIds = stacks.mapNotNull {
        if (it.amount != amount) {
          logger.warn("stack required different amount: $it vs $amount: $cap")
        }
        ForgeRegistries.FLUIDS.getKey(it.fluid).toString()
      }
      return RecipeIngredientDTO(
        amount = amount,
        chance = cap.chance,
        acceptedIds = acceptedIds,
        perTick = perTick,
      )
    }

  }
}

data class RecipeDTO(
  val id: String,
  val machine: String,
  val duration: Int,
  val eutConsumed: Long,
  val eutProduced: Long,
  val minTier: Int,
  val inputs: List<RecipeIngredientDTO>,
  val outputs: List<RecipeIngredientDTO>,
) {
  companion object {
    fun fromGTRecipe(recipe: GTRecipe): RecipeDTO {
      val inputs =
        recipe.getInputContents(ItemRecipeCapability.CAP).mapNotNull { RecipeIngredientDTO.fromItemContent(it) } +
          recipe.getTickInputContents(ItemRecipeCapability.CAP)
            .mapNotNull { RecipeIngredientDTO.fromItemContent(it) } +
          recipe.getInputContents(FluidRecipeCapability.CAP).mapNotNull { RecipeIngredientDTO.fromFluidContent(it) } +
          recipe.getTickInputContents(FluidRecipeCapability.CAP)
            .mapNotNull { RecipeIngredientDTO.fromFluidContent(it) }
      val outputs =
        recipe.getOutputContents(ItemRecipeCapability.CAP).mapNotNull { RecipeIngredientDTO.fromItemContent(it) } +
          recipe.getTickOutputContents(ItemRecipeCapability.CAP)
            .mapNotNull { RecipeIngredientDTO.fromItemContent(it) } +
          recipe.getOutputContents(FluidRecipeCapability.CAP)
            .mapNotNull { RecipeIngredientDTO.fromFluidContent(it) } +
          recipe.getTickOutputContents(FluidRecipeCapability.CAP)
            .mapNotNull { RecipeIngredientDTO.fromFluidContent(it) }

      return RecipeDTO(
        id = recipe.id.toString(),
        machine = recipe.recipeType.registryName.toString(),
        duration = recipe.duration,
        eutConsumed = RecipeHelper.getInputEUt(recipe),
        eutProduced = RecipeHelper.getOutputEUt(recipe),
        minTier = RecipeHelper.getRecipeEUtTier(recipe),
        inputs = inputs,
        outputs = outputs,
      )
    }
  }
}

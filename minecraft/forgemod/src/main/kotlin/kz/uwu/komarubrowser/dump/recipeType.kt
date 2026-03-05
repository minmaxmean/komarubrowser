package kz.uwu.komarubrowser.dump

import com.gregtechceu.gtceu.api.machine.MachineDefinition
import com.gregtechceu.gtceu.api.recipe.category.GTRecipeCategory
import com.gregtechceu.gtceu.api.registry.GTRegistries
import net.minecraft.network.chat.Component

data class RecipeCategoryDTO(
  val recipeType: String,
  val recipeCategory: String,
  val displayName: String,
) {
  companion object {
    fun from(rp: GTRecipeCategory): RecipeCategoryDTO {
      return RecipeCategoryDTO(
        recipeType = rp.recipeType.registryName.toString(),
        recipeCategory = rp.name,
        displayName = Component.translatable(rp.languageKey).string,
      )
    }
  }
}

data class MachineDTO(
  val machineId: String,
  val recipeTypes: List<String>,
) {
  companion object {
    fun fromMachineDefinition(definition: MachineDefinition): MachineDTO {
      return MachineDTO(
        machineId = definition.id.toString(),
        recipeTypes =
          definition.recipeTypes?.mapNotNull { it?.registryName.toString() } ?: emptyList(),
      )
    }
  }
}

data class RecipeMachineListDTO(
  val recipeCategories: List<RecipeCategoryDTO>,
  val machines: List<MachineDTO>,
)

fun getAllRecipeMachines(): RecipeMachineListDTO {
  return RecipeMachineListDTO(
    recipeCategories = GTRegistries.RECIPE_CATEGORIES.map { rp -> RecipeCategoryDTO.from(rp) },
    machines = GTRegistries.MACHINES
      .map { machine -> MachineDTO.fromMachineDefinition(machine) }
      .filter { it.recipeTypes.isNotEmpty() },
  )
}


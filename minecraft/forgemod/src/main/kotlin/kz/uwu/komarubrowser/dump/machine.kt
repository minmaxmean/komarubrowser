package kz.uwu.komarubrowser.dump

import com.gregtechceu.gtceu.api.machine.MachineDefinition
import com.gregtechceu.gtceu.api.registry.GTRegistries

data class MachineDTO(
    val id: String,
    val recipeTypes: List<String>,
) {
  companion object {
    fun fromMachineDefinition(definition: MachineDefinition): MachineDTO {
      return MachineDTO(
          id = definition.id.toString(),
          recipeTypes =
              definition.recipeTypes?.mapNotNull { it?.registryName.toString() } ?: emptyList(),
      )
    }
  }
}

fun getAllGTMachines(): List<MachineDTO> {
  return GTRegistries.MACHINES.map { machine -> MachineDTO.fromMachineDefinition(machine) }
}


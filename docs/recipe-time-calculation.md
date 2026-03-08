# GregTech Modern - Recipe Time Calculation

This document describes all the data needed to calculate actual recipe time in GregTech Modern.

All filepaths are relative to /Users/m-nny/projects/graveyard/GregTech-Modern

## Base Recipe Data (from database)

| Field             | Type               | Description                                       |
| ----------------- | ------------------ | ------------------------------------------------- |
| `id`              | string             | Recipe ID                                         |
| `duration`        | int                | Base duration in ticks                            |
| `min_tier`        | EnergyTierID       | Minimum energy tier required                      |
| `eut_consumed`    | long               | EU/t consumed (base)                              |
| `eut_produced`    | long               | EU/t produced (for generators)                    |
| `inputs`          | RecipeIngredient[] | Input items/fluids                                |
| `outputs`         | RecipeIngredient[] | Output items/fluids                               |
| `recipe_type`     | string             | Recipe type                                       |
| `recipe_category` | string             | Recipe category                                   |
| `data`            | JSON               | Additional recipe data (e.g., `ebf_temp` for EBF) |

## Machine Properties Needed for Recipe Calculation

### 1. Overclock Properties

| Property             | Type | Source                                    | Description                                             |
| -------------------- | ---- | ----------------------------------------- | ------------------------------------------------------- |
| `overclock_tier`     | int  | `IOverclockMachine.getOverclockTier()`    | Current OC tier (voltage index)                         |
| `max_overclock_tier` | int  | `IOverclockMachine.getMaxOverclockTier()` | Maximum OC tier allowed                                 |
| `overclock_voltage`  | long | `IOverclockMachine.getOverclockVoltage()` | Voltage available for OC (`GTValues.V[overclock_tier]`) |
| `machine_tier`       | int  | `MetaMachine.getTier()`                   | Machine's base tier                                     |

**Source:** `src/main/java/com/gregtechceu/gtceu/api/machine/feature/IOverclockMachine.java`

### 2. Parallel Properties

| Property                  | Type   | Source                                | Description                                         |
| ------------------------- | ------ | ------------------------------------- | --------------------------------------------------- |
| `parallel_hatch_count`    | int    | `IMultiController.getParallelHatch()` | Number of parallel hatches                          |
| `parallel_hatch_capacity` | int    | `IParallelHatch.getCurrentParallel()` | Max parallel from hatch: `4^(tier - EV)`            |
| `input_inventory`         | object | Machine inventory                     | Input items to calculate input-based parallels      |
| `output_inventory`        | object | Machine inventory                     | Output capacity to calculate output-based parallels |

**Source:**

- `src/main/java/com/gregtechceu/gtceu/api/recipe/modifier/ParallelLogic.java`
- `src/main/java/com/gregtechceu/gtceu/common/machine/multiblock/part/ParallelHatchPartMachine.java:36-37`

### 3. Coil Properties (for EBF, Cracker, Pyrolyse, Multi Smelter)

| Property               | Type   | Source                                                | Description                    |
| ---------------------- | ------ | ----------------------------------------------------- | ------------------------------ |
| `coil_type`            | string | `CoilWorkableElectricMultiblockMachine.getCoilType()` | Coil block type name           |
| `coil_temperature`     | int    | `ICoilType.getCoilTemperature()`                      | Coil working temperature       |
| `coil_tier`            | int    | `ICoilType.getTier()`                                 | Coil tier (0=CuNi, 1=Cu, etc.) |
| `coil_level`           | int    | `ICoilType.getLevel()`                                | Coil level for parallel calc   |
| `coil_energy_discount` | double | `ICoilType.getEnergyDiscount()`                       | EUt discount multiplier        |

**Source:**

- `src/main/java/com/gregtechceu/gtceu/api/machine/multiblock/CoilWorkableElectricMultiblockMachine.java`
- `src/main/java/com/gregtechceu/gtceu/api/block/ICoilType.java`

**Blast Furnace Temperature Formula:**

```
machine_temperature = coil_temperature + (100 × max(0, machine_tier - MV))
```

### 4. Maintenance Properties

| Property               | Type    | Source                                         | Description                         |
| ---------------------- | ------- | ---------------------------------------------- | ----------------------------------- |
| `has_maintenance`      | boolean | `IMaintenanceMachine.hasMaintenanceProblems()` | Whether maintenance is needed       |
| `maintenance_problems` | byte    | `IMaintenanceMachine.getMaintenanceProblems()` | 6-bit flag for 6 maintenance issues |
| `is_full_auto`         | boolean | `IMaintenanceMachine.isFullAuto()`             | Is full-auto maintenance hatch      |
| `duration_multiplier`  | float   | `IMaintenanceMachine.getDurationMultiplier()`  | Duration modifier (0.5-2.0)         |

**Source:** `src/main/java/com/gregtechceu/gtceu/api/machine/feature/multiblock/IMaintenanceMachine.java`

**Duration Multiplier Calculation** (MaintenanceHatchPartMachine.java:304-307):

- Standard: `1.0 + (21 - 20 × durationMultiplier)` for non-configurable
- Configurable: `1.0 + (9 - 8 × durationMultiplier)` for configurable

### 5. Efficiency Properties (Runtime State)

| Property             | Type   | Source                                | Description                                |
| -------------------- | ------ | ------------------------------------- | ------------------------------------------ |
| `consecutive_runs`   | int    | `RecipeLogic.getConsecutiveRecipes()` | Number of consecutive recipe runs          |
| `efficiency_base`    | double | Config                                | Base efficiency multiplier (default: 2)    |
| `efficiency_value`   | double | Config                                | Per-run efficiency (default: 0.95)         |
| `efficiency_hardcap` | double | Config                                | Minimum duration multiplier (default: 0.5) |

**Source:** `src/main/java/com/gregtechceu/gtceu/api/recipe/modifier/EfficiencyModifier.java`

**Formula:**

```
efficiency_multiplier = min(hardcap, base × efficiency^consecutive_runs)
```

### 6. Cleanroom Properties

| Property             | Type               | Source                              | Description                  |
| -------------------- | ------------------ | ----------------------------------- | ---------------------------- |
| `cleanroom_provider` | ICleanroomProvider | `ICleanroomReceiver.getCleanroom()` | Cleanroom provider reference |
| `cleanroom_type`     | CleanroomType      | `ICleanroomProvider.getTypes()`     | Type of cleanroom required   |
| `is_clean`           | boolean            | `ICleanroomProvider.isClean()`      | Whether cleanroom is sterile |

**Source:**

- `src/main/java/com/gregtechceu/gtceu/api/capability/ICleanroomReceiver.java`
- `src/main/java/com/gregtechceu/gtceu/common/recipe/condition/CleanroomCondition.java`

### 7. Environment Properties

| Property                | Type             | Source                       | Description                       |
| ----------------------- | ---------------- | ---------------------------- | --------------------------------- |
| `environmental_hazards` | boolean          | Config                       | Are environmental hazards enabled |
| `condition_strength`    | float            | EnvironmentalHazardSavedData | Medical condition strength        |
| `condition_type`        | MedicalCondition | Recipe condition             | Required condition type           |

**Source:** `src/main/java/com/gregtechceu/gtceu/common/data/GTRecipeModifiers.java:56-75`

---

## Overclock Logic Types

| Type                            | Description                       | Source                            |
| ------------------------------- | --------------------------------- | --------------------------------- |
| `PERFECT_OVERCLOCK`             | Standard perfect OC               | Duration ×0.25 per tier           |
| `NON_PERFECT_OVERCLOCK`         | Standard OC                       | Duration ×0.5 per tier            |
| `PERFECT_OVERCLOCK_SUBTICK`     | Perfect OC with subtick parallel  | Subtick parallel when duration <1 |
| `NON_PERFECT_OVERCLOCK_SUBTICK` | Non-perfect with subtick parallel | Subtick parallel when duration <1 |
| `HEATING_COIL_OC`               | EBF coil-based OC                 | Uses `heatingCoilOC()` method     |

**Source:** `src/main/java/com/gregtechceu/gtceu/api/recipe/OverclockingLogic.java:38-42`

### Overclock Factors

| Factor                          | Value | Description                             |
| ------------------------------- | ----- | --------------------------------------- |
| `STD_VOLTAGE_FACTOR`            | 4.0   | Voltage multiplier per OC tier          |
| `STD_DURATION_FACTOR`           | 0.5   | Duration multiplier (halve) per OC tier |
| `PERFECT_DURATION_FACTOR`       | 0.25  | Perfect OC duration multiplier          |
| `PERFECT_DURATION_FACTOR_INV`   | 4.0   | Perfect parallelization factor (1/0.25) |
| `COIL_EUT_DISCOUNT_TEMPERATURE` | 900   | Temperature step for EUt discount       |

---

## Special Machine Types

### 1. Electric Blast Furnace (EBF)

- **Modifier:** `GTRecipeModifiers.ebfOverclock()`
- **Special data:** `recipe.data.getInt("ebf_temp")` - required temperature
- **Formula:** Uses `heatingCoilOC()` with coil temperature

### 2. Cracker

- **Modifier:** `GTRecipeModifiers.crackerOverclock()`
- **Special:** EUt × (1 - 0.1 × coilTier)

### 3. Pyrolyse Oven

- **Modifier:** `GTRecipeModifiers.pyrolyseOvenOverclock()`
- **Duration:** 4/3 × for Cupronickel, 2/(tier+1) for others

### 4. Multi Smelter

- **Modifier:** `GTRecipeModifiers.multiSmelterParallel()`
- **Max parallel:** `32 × coilLevel`
- **Duration formula:** `128 × 2 × parallels / maxParallel`

---

## Complete Time Calculation Formula

```
finalDuration = baseDuration × durationMultiplier × maintenanceMultiplier × efficiencyMultiplier
```

Where:

- `durationMultiplier` = OC result (from `OverclockingLogic.OCResult`)
- `maintenanceMultiplier` = from `IMaintenanceMachine.getDurationMultiplier()`
- `efficiencyMultiplier` = `base × efficiency^runs` (capped at hardcap)

### Runtime-Only Values (Cannot be Pre-computed)

These depend on machine state at runtime and cannot be stored in recipe database:

1. **Input-based parallel** - depends on items currently in machine inventory
2. **Output-based parallel** - depends on output inventory capacity
3. **Efficiency modifier** - depends on consecutive run count
4. **Environment modifier** - depends on world state (hazards, cleanroom)

---

## Database Schema Extension Recommendations

```typescript
// Machine configuration (can be stored)
type MachineConfig = {
  machine_id: string;
  machine_type: "standard" | "ebf" | "cracker" | "pyrolyse" | "multismelter";
  tier: number;
  overclock_tier: number;
  coil_type?: string; // For coil machines
  coil_temperature?: number;
  has_maintenance: boolean;
  maintenance_config?: number; // 0.5-2.0
  parallel_hatch_tier?: number;
};

// Runtime state (cannot be stored, calculated at runtime)
type MachineRuntime = {
  input_inventory: Inventory;
  output_inventory: Inventory;
  consecutive_runs: number;
  cleanroom_status?: CleanroomStatus;
  environmental_hazards?: HazardStatus;
};
```

To build a functional processing line calculator for GregTech CEu Modern, your web app will need to simulate how machines process recipes over time, manage parallel execution (overclocking), and calculate total resource/energy throughput. 

Here are the critical fields you should extract from each `GTRecipe` and expose in your REST API, along with how to fetch them in Java:

### 1. Core Recipe Metadata
You need the basic identity and timing of the recipe.

* **`id`** (String): The unique identifier.
  * *Java:* `recipe.getId().toString()`
  * *Example:* `"gtceu:assembler/basic_circuit"`
* **`recipeType`** (String): The machine category this recipe belongs to.
  * *Java:* `recipe.recipeType.registryName.toString()`
  * *Example:* `"gtceu:assembler"`
* **`duration`** (Integer): The base time the recipe takes in ticks (1 second = 20 ticks).
  * *Java:* `recipe.duration`

### 2. Energy & Tier Requirements
GregTech recipes are strictly gated by voltage tiers and consume (or produce) energy per tick.

* **`eut`** (Long): The base energy consumed/produced per tick.
  * *Java (Input):* `RecipeHelper.getInputEUt(recipe)`
  * *Java (Output for Generators):* `RecipeHelper.getOutputEUt(recipe)`
* **`minTier`** (Integer): The minimum machine tier required to run the recipe (0 = ULV, 1 = LV, 2 = MV, etc.). This is vital for your calculator's overclocking logic.
  * *Java:* `RecipeHelper.getRecipeEUtTier(recipe)`

### 3. Items (Inputs and Outputs)
Because GregTech items can be consumed instantly or per-tick, you should extract both `inputs` and `tickInputs`.

* **`inputs` / `outputs`** (Array of Objects): The items required or produced.
  * *Java (Inputs):* `recipe.getInputContents(ItemRecipeCapability.CAP)` and `recipe.getTickInputContents(ItemRecipeCapability.CAP)`
  * *Java (Outputs):* `recipe.getOutputContents(ItemRecipeCapability.CAP)` and `recipe.getTickOutputContents(ItemRecipeCapability.CAP)`
* **Fields to extract per Item Content:**
  * **`ingredient`** (String / Array): For inputs, this is an `Ingredient` object (which can be a tag like `#forge:dusts/iron` or a specific item). For outputs, it's usually an `ItemStack`.
  * **`amount`** (Integer): How many of the item is needed/produced. (Extracted from the `SizedIngredient` or `ItemStack`).
  * **`chance`** (Float): The probability of consuming/producing the item.
    * *Java:* `content.chance / 10000f` (10000 represents 100% in GTCEu). If `chance` is `0`, it is usually a **Not-Consumable** item (like a programmed circuit or a mold).
  * **`isPerTick`** (Boolean): Whether this item is consumed per tick rather than once per recipe execution.

### 4. Fluids (Inputs and Outputs)
Handled almost identically to items, but using `FluidRecipeCapability.CAP`.

* **`fluidInputs` / `fluidOutputs`** (Array of Objects): 
  * *Java:* `recipe.getInputContents(FluidRecipeCapability.CAP)` (and its tick/output variants).
* **Fields to extract per Fluid Content:**
  * **`fluid`** (String): The registry name of the fluid.
  * **`amount`** (Integer): Usually in millibuckets (mB).
  * **`chance`** (Float): Probability (same math as items).
  * **`isPerTick`** (Boolean): Critical for things like fuel consumption or continuous cooling.

### 5. Environmental Conditions (Crucial for Line Planning)
Many mid-to-late game recipes require specific multi-block environments. If your calculator ignores these, users might build invalid processing lines.

* **`conditions`** (Array of Strings):
  * *Java:* Iterate through `recipe.conditions`.
  * *Cleanroom:* Check if `condition instanceof CleanroomCondition`. Export the cleanroom type (e.g., `"cleanroom"`, `"sterile_cleanroom"`).
  * *Dimension:* Check if `condition instanceof DimensionCondition`. Export the required dimension (e.g., `"minecraft:the_end"`).
  * *Temperature:* (Mostly for Blast Furnaces) Extracted via `recipe.data.getInt("ebf_temp")`.

### Example JSON Payload Structure
Your REST API endpoint for a single recipe might look like this:

```json
{
  "id": "gtceu:assembler/basic_circuit",
  "machine": "gtceu:assembler",
  "duration": 200,
  "eut": 32,
  "minTier": 1, 
  "conditions": {
    "cleanroom": null
  },
  "itemInputs": [
    { "item": "gtceu:resistor", "amount": 2, "chance": 1.0, "perTick": false },
    { "item": "gtceu:copper_cable", "amount": 2, "chance": 1.0, "perTick": false },
    { "item": "gtceu:programmed_circuit", "amount": 1, "chance": 0.0, "perTick": false } 
  ],
  "fluidInputs": [
    { "fluid": "gtceu:soldering_alloy", "amount": 36, "chance": 1.0, "perTick": false }
  ],
  "itemOutputs": [
    { "item": "gtceu:basic_electronic_circuit", "amount": 1, "chance": 1.0, "perTick": false }
  ],
  "fluidOutputs": []
}
```

### Note on Overclocking Logic in your Web App
If you are building a processing line calculator, **do not export overclocked values**. Only export the base `minTier` values. 
Your web app's frontend/backend should dynamically calculate the overclocked `duration` and `eut` using GregTech's standard perfect/imperfect overclocking math (usually: 4x EU/t and 0.5x Duration per tier upgrade) when the user selects a higher tier machine in your UI.
export interface RecipeRow {
	id: string;
	machine: string;
	inputs: string;
	outputs: string;
	duration: number;
	min_tier: number;
	eut_consumed: number;
	eut_produced: number;
}

export const energyTierNames = {
	0: 'ULV',
	1: 'LV',
	2: 'MV',
	3: 'HV',
	4: 'EV',
	5: 'IV',
	6: 'LuV',
	7: 'ZPM',
	8: 'UV',
	9: 'UHV',
	10: 'UEV',
	11: 'UIV',
	12: 'UXV',
	13: 'OpV',
	14: 'MAX'
} as const;

export type EnergyTierID = keyof typeof energyTierNames;

export type EnergyTierName = (typeof energyTierNames)[EnergyTierID];

export interface EnergyTier {
	id: EnergyTierID;
	name: EnergyTierName;
	fullName: string;
	voltage: number;
	textColor: string;
	hexColor: string;
}

export const energyTiers: EnergyTier[] = [
	{
		id: 0,
		name: 'ULV',
		fullName: 'Ultra Low Voltage',
		voltage: 8,
		textColor: 'Dark Gray',
		hexColor: '#C80000'
	},
	{
		id: 1,
		name: 'LV',
		fullName: 'Low Voltage',
		voltage: 32,
		textColor: 'Gray',
		hexColor: '#DCDCDC'
	},
	{
		id: 2,
		name: 'MV',
		fullName: 'Medium Voltage',
		voltage: 128,
		textColor: 'Aqua',
		hexColor: '#FF6400'
	},
	{
		id: 3,
		name: 'HV',
		fullName: 'High Voltage',
		voltage: 512,
		textColor: 'Gold',
		hexColor: '#FFFF1E'
	},
	{
		id: 4,
		name: 'EV',
		fullName: 'Extreme Voltage',
		voltage: 2048,
		textColor: 'Dark Purple',
		hexColor: '#808080'
	},
	{
		id: 5,
		name: 'IV',
		fullName: 'Insane Voltage',
		voltage: 8192,
		textColor: 'Blue',
		hexColor: '#F0F0F5'
	},
	{
		id: 6,
		name: 'LuV',
		fullName: 'Ludicrous Voltage',
		voltage: 32768,
		textColor: 'Light Purple',
		hexColor: '#E99797'
	},
	{
		id: 7,
		name: 'ZPM',
		fullName: 'ZPM Voltage',
		voltage: 131072,
		textColor: 'Red',
		hexColor: '#7EC3C4'
	},
	{
		id: 8,
		name: 'UV',
		fullName: 'Ultimate Voltage',
		voltage: 524288,
		textColor: 'Dark Aqua',
		hexColor: '#7EB07E'
	},
	{
		id: 9,
		name: 'UHV',
		fullName: 'Ultra High Voltage',
		voltage: 2097152,
		textColor: 'Dark Red',
		hexColor: '#BF74C0'
	},
	{
		id: 10,
		name: 'UEV',
		fullName: 'Ultra Excessive Voltage',
		voltage: 8388608,
		textColor: 'Green',
		hexColor: '#0B5CFE'
	},
	{
		id: 11,
		name: 'UIV',
		fullName: 'Ultra Immense Voltage',
		voltage: 33554432,
		textColor: 'Dark Green',
		hexColor: '#914E91'
	},
	{
		id: 12,
		name: 'UXV',
		fullName: 'Ultra Extreme Voltage',
		voltage: 134217728,
		textColor: 'Yellow',
		hexColor: '#488748'
	},
	{
		id: 13,
		name: 'OpV',
		fullName: 'Overpowered Voltage',
		voltage: 536870912,
		textColor: 'Bold Blue',
		hexColor: '#8C0000'
	},
	{
		id: 14,
		name: 'MAX',
		fullName: 'Maximum Voltage',
		voltage: 2147483648,
		textColor: 'Bold Red',
		hexColor: '#2828F5'
	}
];

export function energyTierFromID(id: EnergyTierID): EnergyTier {
	return energyTiers.find((item) => item.id === id)!;
}

import { tv } from 'tailwind-variants';

export const energyTierVarient = tv({
	variants: {
		tier: {
			ULV: 'bg-neutral-600 border-neutral-700 text-white', // DARK_GRAY (#555555)
			LV: 'bg-neutral-400 border-neutral-500 text-black', // GRAY (#AAAAAA)
			MV: 'bg-cyan-300 border-cyan-400 text-black', // AQUA (#55FFFF)
			HV: 'bg-amber-500 border-amber-600 text-black', // GOLD (#FFAA00)
			EV: 'bg-purple-600 border-purple-700 text-white', // DARK_PURPLE (#AA00AA)
			IV: 'bg-blue-500 border-blue-600 text-white', // BLUE (#5555FF)
			LuV: 'bg-fuchsia-400 border-fuchsia-500 text-black', // LIGHT_PURPLE (#FF55FF)
			ZPM: 'bg-red-500 border-red-600 text-white', // RED (#FF5555)
			UV: 'bg-teal-600 border-teal-700 text-white', // DARK_AQUA (#00AAAA)
			UHV: 'bg-red-800 border-red-900 text-white', // DARK_RED (#AA0000)
			UEV: 'bg-green-400 border-green-500 text-black', // GREEN (#55FF55)
			UIV: 'bg-green-700 border-green-800 text-white', // DARK_GREEN (#00AA00)
			UXV: 'bg-yellow-300 border-yellow-400 text-black', // YELLOW (#FFFF55)
			OpV: 'bg-blue-600 border-blue-700 text-white font-bold', // BLUE BOLD (#5555FF)
			MAX: 'bg-red-600 border-red-700 text-white font-bold' // RED BOLD (#FF5555)
		}
	},
	defaultVariants: {
		tier: 'LV'
	}
});

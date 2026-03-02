import { tv, type VariantProps } from 'tailwind-variants';

export const iconVariants = tv({
	variants: {
		size: {
			sm: 'size-4',
			default: 'size-8'
		}
	},
	defaultVariants: {
		size: 'default'
	}
});
export type IconVariants = VariantProps<typeof iconVariants>;

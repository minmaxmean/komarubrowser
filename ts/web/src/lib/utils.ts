import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

export type DeepPartial<T> = T extends object
  ? {
      [K in keyof T]?: DeepPartial<T[K]>;
    }
  : T;

function isObject(item: any): item is Record<string, any> {
  return item && typeof item === 'object' && !Array.isArray(item);
}

export function deepMerge<T extends Record<string, any>>(target: T, override: DeepPartial<T>): T {
  // Create a shallow copy of target to avoid mutating the original
  const output = { ...target };

  if (isObject(target) && isObject(override)) {
    Object.keys(override).forEach((key) => {
      const overrideValue = (override as any)[key];
      const targetValue = (target as any)[key];

      if (isObject(overrideValue) && isObject(targetValue)) {
        // Recursive merge for nested objects
        (output as any)[key] = deepMerge(targetValue, overrideValue);
      } else if (overrideValue !== undefined) {
        // Override primitive value or entire object if target doesn't have it as an object
        (output as any)[key] = overrideValue;
      }
    });
  }

  return output;
}

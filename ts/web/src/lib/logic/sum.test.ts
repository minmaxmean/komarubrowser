import { expect, test } from 'vitest';
import { sum } from './sum.ts';

test('adds 1 + 2 equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});

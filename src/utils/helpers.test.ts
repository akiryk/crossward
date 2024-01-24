import { it, expect } from 'vitest';
import { getId } from './helpers';

it('returns a string from coords', () => {
	expect(getId({ x: 1, y: 2 })).toBe('1:2');
	expect(getId({ x: 2, y: 1 })).toBe('1:2');
	expect(getId({ x: 0, y: 0 })).toBe('0:0');
	expect(getId({ y: -1, x: -2 })).toBe('-2:-1');
});

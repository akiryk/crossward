import { it, expect } from 'vitest';
import { getId } from './crosswordHelpers';

it('returns a string from coords', () => {
	expect(getId(1, 2)).toBe('1:2');
	expect(getId(0, 0)).toBe('0:0');
	expect(getId(-1, -1)).toBe('-1:-1');
});

/**
 * General Helpers for all files
 */
import type { ID } from '$utils/types';

export function getId({ x, y }: { x: number; y: number }): ID {
	return `${x}:${y}`;
}

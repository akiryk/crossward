import type { PageLoad } from './$types';
import type { Grid } from '$utils/types';
import { getDynamicGrid } from '$lib/crossword/utils/DynamicGrid';

export const load: PageLoad = async (loadResponse) => {
	const grid: Grid | null = loadResponse?.data?.puzzle?.grid || null;
	const dynamicGrid = grid ? getDynamicGrid(grid) : null;

	if (loadResponse?.data?.puzzle) {
		return {
			puzzle: loadResponse.data.puzzle,
			isEditing: loadResponse.data.isEditing,
			isCreateSuccess: loadResponse.data.isCreateSuccess,
			dynamicGrid
		};
	}
};

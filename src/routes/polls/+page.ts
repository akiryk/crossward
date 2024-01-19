import type { PageLoad } from './$types';

export const load: PageLoad = async (loadResponse) => {
	return {
		grid: loadResponse.data.grid
	};
};

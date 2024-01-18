import type { PageLoad } from './$types';

export const load: PageLoad = async (loadResponse) => {
	return {
		puzzle: loadResponse.data.puzzle
	};
};

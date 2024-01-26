// PLAY CLIENT
import type { PageLoad } from '../$types';

export const load: PageLoad = async (loadResponse) => {
	if (loadResponse?.data?.puzzle) {
		return {
			puzzle: loadResponse.data.puzzle
		};
	}
};

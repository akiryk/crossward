import type { PageLoad } from './$types';

export const load: PageLoad = async (loadResponse) => {
	if (loadResponse?.data?.grid) {
		return {
			grid: loadResponse.data.grid,
			isEditing: loadResponse.data.isEditing,
			isCreateSuccess: loadResponse.data.isCreateSuccess
		};
	}
};

<script lang="ts">
	import { BannerType } from '$utils/types';

	export let message: string;
	export let bannerType: BannerType;
	export let onClose: () => void;

	let styles = getStyles();

	function getStyles() {
		switch (bannerType) {
			case BannerType.IS_SUCCESS:
				return 'flex items-center p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400';
			case BannerType.IS_ERROR:
				return 'flex items-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative';
			case BannerType.IS_INFO:
				return 'bg-gray-100 border mb-4 border-gray-400 text-gray-700 px-4 py-3 rounded relative';
			default:
				return 'bg-gray-100 border mb-4 border-gray-400 text-gray-700 px-4 py-3 rounded relative';
		}
	}
</script>

<div class={styles} role="alert">
	<p>{message}.</p>
	<button on:click={onClose} class="ml-auto btn-alt">Close</button>
</div>

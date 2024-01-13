<script lang="ts">
	export let type = 'primary';

	export let primary =
		'text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700';
	export let secondary = 'bg-lime-500 text-white';

	let classes: string;

	switch (type) {
		case 'primary':
			classes = primary;
			break;
		case 'secondary':
			classes = secondary;
			break;
		default:
			classes = primary;
	}
</script>

<button class={classes}><slot /></button>

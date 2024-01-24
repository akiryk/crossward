<script lang="ts">
	const PRIMARY = 'primary';
	const SECONDARY = 'secondary';
	const ALERT = 'alert';

	type ButtonType = 'button' | 'submit';

	type Style = typeof PRIMARY | typeof SECONDARY | typeof ALERT;

	const styles = {
		[PRIMARY]:
			'text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5',
		[SECONDARY]: 'bg-lime-500 text-white',
		[ALERT]: 'bg-red-500 text-white py-2 px-4'
	};

	export let style: Style = PRIMARY;
	export let buttonType: ButtonType = 'submit';
	export let handler: () => void = () => {};
	let classes: string = styles[style];
</script>

<button on:click={buttonType === 'button' ? handler : null} type={buttonType} class={classes}
	><slot /></button
>

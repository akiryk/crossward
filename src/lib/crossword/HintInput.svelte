<script lang="ts">
	export let hint: string;
	export let answer: string;
	export let displayNumber: number;
	export let onInput: (event: Event, displayNumber: number) => void;
	export let showHintErrors = false;

	$: styles = getStyles(showHintErrors, hint);

	function getStyles(showHintErrors: boolean, hint: string) {
		let styles =
			'leading-10 border border-gray-300 text-gray-900 pl-10 focus:border-blue-500 block w-full';
		if (showHintErrors && !hint) {
			styles += ' border-red-600 bg-red-50 placeholder:text-red-300';
		}
		return styles;
	}
</script>

<div class="items-center my-2">
	<div class="relative">
		<label
			for={`acrossHintFor${displayNumber}`}
			class="absolute left-4 top-0.5 text-xs leading-10 block font-medium text-gray-600"
		>
			{displayNumber}.
		</label>
		<input
			type="text"
			placeholder={answer}
			value={hint}
			name="hint"
			on:input={(event) => onInput(event, displayNumber)}
			id={`acrossHintFor${displayNumber}`}
			class={styles}
		/>
	</div>
</div>

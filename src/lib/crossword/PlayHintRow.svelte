<script lang="ts">
	export let hint: string;
	export let displayNumber: number;
	export let direction: string;
	export let onClick: ({
		displayNumber,
		direction
	}: {
		displayNumber: number;
		direction: string;
	}) => void;
</script>

<button on:click={() => onClick({ displayNumber, direction })} class="text-left flex">
	<div class="mb-3 flex items-baseline">
		<div class="text-sm font-bold w-6">{displayNumber}.</div>
		<span class="font-light">{hint}</span>
	</div>
</button>

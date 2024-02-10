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

<div class="mb-3 flex items-baseline">
	<div class="text-sm font-bold w-4">{displayNumber}.</div>
	<button on:click={() => onClick({ displayNumber, direction })} class="font-light text-left">
		{hint}
	</button>
</div>

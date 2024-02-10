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

<p class="mb-3">
	<button on:click={() => onClick({ displayNumber, direction })} class="font-light">
		<span class="text-sm font-bold mr-2">{displayNumber}.</span>
		{hint}
	</button>
</p>

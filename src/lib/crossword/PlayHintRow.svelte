<script lang="ts">
	export let hint: string;
	export let displayNumber: number;
	export let direction: string;
	export let isSelected: boolean;
	export let onClick: ({
		displayNumber,
		direction
	}: {
		displayNumber: number;
		direction: string;
	}) => void;
</script>

<button
	on:click={() => onClick({ displayNumber, direction })}
	class={`text-left flex p-2 w-full dark:focus-visible:border-transparent ${
		isSelected && ' bg-cyan-100'
	}`}
>
	<div class="flex items-baseline">
		<div class="text-sm font-bold w-6">{displayNumber}.</div>
		<span class="font-light flex-1">{hint}</span>
	</div>
</button>

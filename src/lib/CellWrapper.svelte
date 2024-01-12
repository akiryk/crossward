<script lang="ts">
	export let displayNumber: number;
</script>

<td class="relative" role="gridcell">
	<slot />
	{#if !!displayNumber}
		<span class="absolute left-0.5 top-px text-xs text-slate-600 pointer-events-none">
			{displayNumber}
		</span>
	{/if}
</td>

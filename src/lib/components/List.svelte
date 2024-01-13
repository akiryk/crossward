<script lang="ts">
	export let type: 'ul' | 'ol';
</script>

{#if type === 'ul'}
	<ul class="w-96">
		<slot />
	</ul>
{:else}
	<ul class="w-96">
		<slot />
	</ul>
{/if}

<script>
	import { page } from '$app/stores';
</script>

<div>
	{#if $page.data.session?.user}
		<slot />
	{:else}
		<p>Look buddy,you need to log in before you access this special section</p>
		<p>Hint: go <a class="text-sky-600" href="/">home</a> and try again</p>
	{/if}
</div>

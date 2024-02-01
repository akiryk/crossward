<script>
	import { page } from '$app/stores';
</script>

{#if $page.status && $page.status >= 400 && $page.status <= 500}
	<h1>Oh, bummer</h1>
	<p>This page doesn't really exist 😡😡😡😡😡😡</p>
	<p>Maybe try visiting the <a href="/">home page</a> and starting again?</p>
{:else}
	<h1>Sad day</h1>
{/if}

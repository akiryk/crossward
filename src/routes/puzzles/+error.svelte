<script>
	import { page } from '$app/stores';
</script>

{#if $page.status && $page.status >= 400 && $page.status < 500}
	<h1>Oh, bummer</h1>
	<p>Are you looking for a 🔠 crossword page?</p>
	<p>Maybe try visiting the <a href="/puzzles">puzzles page</a> and starting again?</p>
{:else}
	<h1>Sad day</h1>
	<p>You experienced some kind of error. <span class="text-lg">🤷</span></p>
	<p>Maybe visit the <a href="/">home page</a> and try again?</p>
{/if}

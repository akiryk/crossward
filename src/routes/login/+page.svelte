<script lang="ts">
	import type { PageData } from './$types';
	import { signIn, signOut } from '@auth/sveltekit/client';

	export let data: PageData;

	$: ({ session } = data);

	export let classes =
		'mr-4 text-white text-md bg-lime-600 border border-green-700 focus:outline-none hover:bg-green-700 focus:ring-4 focus:ring-pink-300 font-medium rounded-lg px-5 py-2.5 ';
</script>

<div class="p-4">
	{#if session?.user}
		<h1 class="mr-4 mt-0 mb-2 text-xl font-medium leading-tight text-primary font-serif">
			You're in!
		</h1>
		<p class="mb-1">
			You're already logged in! Strange, you should have been redirected to the puzzles page.
		</p>
		<p class="mb-10">No matter, <a class="text-blue-500" href="/">go to puzzles page</a></p>
		<button type="button" on:click={() => signOut()} class={classes}>Sign Out</button>
	{:else}
		<h1 class="mr-4 mt-0 mb-2 text-xl font-medium leading-tight text-primary font-serif">Log in</h1>
		<p class="mb-10">Before you can play, please... do us the honor.</p>
		<button type="button" on:click={() => signIn('google')} class={classes}
			>Sign In With Google</button
		>
	{/if}
</div>

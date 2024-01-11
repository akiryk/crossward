<script lang="ts">
	import type { PageData } from './$types';
	import { signIn, signOut } from '@auth/sveltekit/client';

	export let data: PageData;

	$: ({ session } = data);

	export let classes =
		'text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700';
</script>

<div>
	<h1>Login page</h1>
	{#if session?.user}
		<p>Actually, you're already logged in. Were you hoping to log out?</p>
		<button type="button" on:click={() => signOut()} class={classes}>Sign Out</button>
	{:else}
		<p>You need to login, right?</p>
		<button type="button" on:click={() => signIn('google')} class={classes}>Sign In</button>
	{/if}
</div>

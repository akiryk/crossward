<script>
	import { signIn, signOut } from '@auth/sveltekit/client';
	import { page } from '$app/stores';
	import '../app.css';
</script>

<div class="p-4 max-w-screen-xl">
	<nav class="bg-white border-gray-200">
		<div class="flex flex-wrap items-center justify-between mx-auto py-4">
			<a href="/" class="flex items-center space-x-3 rtl:space-x-reverse">
				<span class="self-center text-2xl font-bold whitespace-nowrap font-sans">Crossward</span>
			</a>
			<button
				data-collapse-toggle="navbar-default"
				type="button"
				class="btninline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
				aria-controls="navbar-default"
				aria-expanded="false"
			>
				<span class="sr-only">Open main menu</span>
				<svg
					class="w-5 h-5"
					aria-hidden="true"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 17 14"
				>
					<path
						stroke="currentColor"
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M1 1h15M1 7h15M1 13h15"
					/>
				</svg>
			</button>
			<div class="hidden w-full md:block md:w-auto" id="navbar-default">
				<ul
					class="font-medium flex flex-col items-center p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white"
				>
					<li>
						{#if $page.data.session?.user}
							<button
								type="button"
								on:click={() => signOut()}
								title={`signed in as ${$page.data.session.user?.name}`}
								class="btn">Sign Out</button
							>
						{:else}
							<button type="button" on:click={() => signIn('google')} class="btn">Sign In</button>
						{/if}
					</li>
				</ul>
			</div>
		</div>
	</nav>
</div>
<slot />

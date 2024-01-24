<script lang="ts">
	import Button from '$components/Button.svelte';
</script>

<h3 class="font-medium text-lg">Hints go here</h3>
<div>Here is where we have hints and answers!</div>
<div class="mb-5 flex">
	<Button buttonType="submit">Save for later</Button>
	<button
		formaction="?/publish"
		class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 "
		>Publish</button
	>
</div>

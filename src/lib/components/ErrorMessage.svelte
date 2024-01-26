<script lang="ts">
	export let errorMessage: string;
</script>

<div
	class="bg-red-100 border mb-4 border-red-400 text-red-700 px-4 py-3 rounded relative"
	role="alert"
>
	<span class="block sm:inline">{errorMessage}</span>
</div>

<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import './layout.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>Eros Vector</title>
	<meta name="description" content="A 4D relationship mapping tool" />
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

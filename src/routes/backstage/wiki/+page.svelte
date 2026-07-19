<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

{#if 'empty' in data && data.empty}
	<p class="empty">No wiki articles found in <code>docs/wiki/</code>.</p>
{/if}

<style>
	.empty {
		margin: 0;
		color: var(--muted);
	}

	code {
		font-size: 0.85em;
	}
</style>

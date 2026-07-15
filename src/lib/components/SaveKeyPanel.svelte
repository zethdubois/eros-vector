<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { exportSurveyKey, importSurveyKey, survey } from '$lib/store';
	import { SAVE_KEY_TOOLTIP } from '$lib/saveKey';

	let open = $state(false);
	let mode = $state<'save' | 'restore'>('save');
	let inputKey = $state('');
	let notice = $state<{ kind: 'ok' | 'err'; text: string } | null>(null);

	const saveKey = $derived(exportSurveyKey($survey));

	function toggle() {
		open = !open;
		if (open) notice = null;
	}

	async function copyKey() {
		notice = null;
		try {
			await navigator.clipboard.writeText(saveKey);
			notice = { kind: 'ok', text: 'Key copied to clipboard.' };
		} catch {
			notice = { kind: 'err', text: 'Could not copy — select and copy the key manually.' };
		}
	}

	function restoreKey() {
		notice = null;
		const result = importSurveyKey(inputKey);
		if (!result.ok) {
			notice = { kind: 'err', text: result.error };
			return;
		}
		notice = { kind: 'ok', text: 'Progress restored from key.' };
		if (page.url.pathname === '/' && result.phase !== 'intake') {
			goto('/survey');
		}
	}
</script>

<div class="save-key-root">
	<button
		type="button"
		class="toggle"
		aria-expanded={open}
		aria-controls="save-key-panel"
		onclick={toggle}
	>
		{open ? 'Close key' : 'Save / restore key'}
	</button>

	{#if open}
		<section id="save-key-panel" class="panel" aria-label="Save or restore survey key">
			<div class="switch" role="tablist" aria-label="Key mode">
				<button
					type="button"
					role="tab"
					class:active={mode === 'save'}
					aria-selected={mode === 'save'}
					onclick={() => {
						mode = 'save';
						notice = null;
					}}
				>
					Save key
				</button>
				<button
					type="button"
					role="tab"
					class:active={mode === 'restore'}
					aria-selected={mode === 'restore'}
					onclick={() => {
						mode = 'restore';
						notice = null;
					}}
				>
					Enter key
				</button>
			</div>

			<p class="privacy">
				<span class="info-wrap">
					<button type="button" class="info" aria-describedby="save-key-tip">ⓘ</button>
					<span id="save-key-tip" class="tip" role="tooltip">{SAVE_KEY_TOOLTIP}</span>
				</span>
				<span class="privacy-short">Private key — nothing stored on our servers.</span>
			</p>

			{#if mode === 'save'}
				<label class="field">
					<span class="label">Your private key</span>
					<textarea readonly rows={4} value={saveKey} onclick={(e) => e.currentTarget.select()}></textarea>
				</label>
				<button type="button" class="action" onclick={copyKey}>Copy key</button>
			{:else}
				<label class="field">
					<span class="label">Paste your key</span>
					<textarea bind:value={inputKey} rows={4} placeholder="ev1.…"></textarea>
				</label>
				<button type="button" class="action" onclick={restoreKey} disabled={!inputKey.trim()}>
					Restore progress
				</button>
			{/if}

			{#if notice}
				<p class="notice" class:err={notice.kind === 'err'} role="status">{notice.text}</p>
			{/if}
		</section>
	{/if}
</div>

<style>
	.save-key-root {
		position: fixed;
		top: 1rem;
		right: 1rem;
		z-index: 40;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.5rem;
		max-width: min(22rem, calc(100vw - 2rem));
	}

	.toggle {
		padding: 0.5rem 0.85rem;
		border: 1px solid var(--border);
		border-radius: 999px;
		background: var(--surface);
		color: var(--text);
		font-size: 0.82rem;
		font-weight: 600;
		cursor: pointer;
		box-shadow: 0 4px 18px rgba(28, 26, 23, 0.08);
	}

	.toggle:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	.panel {
		width: 100%;
		padding: 0.85rem;
		border: 1px solid var(--border);
		border-radius: 10px;
		background: var(--surface);
		box-shadow: 0 8px 28px rgba(28, 26, 23, 0.12);
	}

	.switch {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.35rem;
		margin-bottom: 0.65rem;
		padding: 0.2rem;
		border-radius: 8px;
		background: var(--bg);
	}

	.switch button {
		padding: 0.4rem 0.5rem;
		border: none;
		border-radius: 6px;
		background: transparent;
		color: var(--muted);
		font-size: 0.82rem;
		font-weight: 600;
		cursor: pointer;
	}

	.switch button.active {
		background: var(--surface);
		color: var(--text);
		box-shadow: 0 1px 3px rgba(28, 26, 23, 0.08);
	}

	.privacy {
		display: flex;
		gap: 0.4rem;
		align-items: flex-start;
		margin: 0 0 0.65rem;
		font-size: 0.75rem;
		line-height: 1.35;
		color: var(--muted);
	}

	.info-wrap {
		position: relative;
		flex-shrink: 0;
	}

	.info {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.1rem;
		height: 1.1rem;
		padding: 0;
		border: none;
		background: transparent;
		color: inherit;
		cursor: help;
		font-size: 0.85rem;
		line-height: 1;
	}

	.tip {
		position: absolute;
		right: 0;
		top: calc(100% + 0.35rem);
		width: max-content;
		max-width: 16rem;
		padding: 0.45rem 0.55rem;
		border-radius: 6px;
		background: var(--navy);
		color: var(--cream);
		font-size: 0.72rem;
		line-height: 1.35;
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.15s ease;
		z-index: 1;
	}

	.info-wrap:hover .tip,
	.info-wrap:focus-within .tip {
		opacity: 1;
	}

	.privacy-short {
		flex: 1;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		margin-bottom: 0.55rem;
	}

	.label {
		font-size: 0.78rem;
		font-weight: 600;
		color: var(--muted);
	}

	textarea {
		width: 100%;
		padding: 0.45rem 0.55rem;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--bg);
		color: var(--text);
		font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, monospace;
		font-size: 0.72rem;
		line-height: 1.35;
		resize: vertical;
		min-height: 4.5rem;
	}

	textarea:focus {
		outline: 2px solid var(--accent-soft);
		border-color: var(--accent);
	}

	.action {
		width: 100%;
		padding: 0.45rem 0.75rem;
		border: 1px solid var(--accent);
		border-radius: 6px;
		background: var(--accent);
		color: #fff;
		font-size: 0.82rem;
		font-weight: 600;
		cursor: pointer;
	}

	.action:hover:not(:disabled) {
		filter: brightness(1.05);
	}

	.action:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	.notice {
		margin: 0.55rem 0 0;
		font-size: 0.78rem;
		color: var(--accent);
	}

	.notice.err {
		color: var(--danger);
	}
</style>

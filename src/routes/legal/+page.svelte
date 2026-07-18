<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	type Tab = 'privacy' | 'terms';

	function tabFromUrl(value: string | null): Tab {
		return value === 'terms' ? 'terms' : 'privacy';
	}

	const active = $derived(tabFromUrl(page.url.searchParams.get('tab')));

	function select(tab: Tab) {
		const url = new URL(page.url);
		if (tab === 'privacy') url.searchParams.delete('tab');
		else url.searchParams.set('tab', 'terms');
		goto(`${url.pathname}${url.search}`, { replaceState: true, noScroll: true, keepFocus: true });
	}
</script>

<main class="legal">
	<a class="back" href="/">← Eros Vector</a>

	<header>
		<h1>Legal</h1>
		<p class="lede">How we handle your data, and the terms for using this invite-only beta.</p>
	</header>

	<div class="switch" role="tablist" aria-label="Legal documents">
		<button
			type="button"
			role="tab"
			aria-selected={active === 'privacy'}
			class:active={active === 'privacy'}
			onclick={() => select('privacy')}
		>
			Privacy
		</button>
		<button
			type="button"
			role="tab"
			aria-selected={active === 'terms'}
			class:active={active === 'terms'}
			onclick={() => select('terms')}
		>
			Terms
		</button>
	</div>

	{#if active === 'privacy'}
		<article class="doc" aria-label="Privacy notice">
			<h2>Privacy notice</h2>
			<p class="updated">Draft — last updated July 2026. Not formal legal advice.</p>

			<section>
				<h3>What this product is</h3>
				<p>
					Eros Vector is an invite-only relationship-mapping survey. You do not create an
					account with email or password. Your progress can stay on your device, and we may
					also save survey answers on our servers so we can improve the product.
				</p>
			</section>

			<section>
				<h3>How we recognize return visits</h3>
				<p>
					We use a simple browser cookie with a random ID so we can tell that the same
					browser came back — without knowing who you are. That is not an advertising
					tracker, and we do not share it with ad networks.
				</p>
			</section>

			<section>
				<h3>IP address and region</h3>
				<p>
					When you visit, our servers see your IP address as part of normal web traffic. We
					may use it to guess a broad region (for example, country) and to help spot abuse
					or duplicate activity. We turn the address into a one-way code and discard the
					original. <strong>We do not keep your raw IP address on file.</strong>
				</p>
			</section>

			<section>
				<h3>Survey answers</h3>
				<p>
					As you answer, we may save your responses — including partial progress and final
					results — linked only to that anonymous browser ID, not to a name or email. Your
					browser also keeps a local copy so you can continue if the connection drops.
				</p>
			</section>

			<section>
				<h3>What we do not collect</h3>
				<ul>
					<li>Email, password, or social-login identity</li>
					<li>Payment information</li>
					<li>Precise GPS location</li>
					<li>Detailed device fingerprints — at most a rough note like browser or phone vs computer</li>
				</ul>
			</section>

			<section>
				<h3>Retention</h3>
				<p>
					We keep anonymous visit and survey records while they remain useful for research
					and keeping the service healthy. We may delete or summarize older records. If you
					want data from a particular browser removed, contact us with enough context to
					find it — we cannot turn an IP code back into an address.
				</p>
			</section>

			<section>
				<h3>Contact</h3>
				<p>
					For privacy questions about this beta, contact the person who invited you, or
					reach out through the project channel listed on your invite.
				</p>
			</section>
		</article>
	{:else}
		<article class="doc" aria-label="Terms of use">
			<h2>Terms of use</h2>
			<p class="updated">Draft — last updated July 2026. Not formal legal advice.</p>

			<section>
				<h3>Invite-only beta</h3>
				<p>
					Access is granted by shared invite passwords. Credentials may be rotated or revoked
					at any time. The product may change, break, or be withdrawn without notice.
				</p>
			</section>

			<section>
				<h3>Age</h3>
				<p>
					You must be old enough to use adult relationship and sexuality content in your
					jurisdiction (typically 18+). Do not use the service if you are not.
				</p>
			</section>

			<section>
				<h3>Not advice</h3>
				<p>
					Eros Vector is a reflective mapping tool, not medical, therapeutic, legal, or
					relationship advice. Archetype labels are descriptive heuristics, not diagnoses.
					Decisions about your relationships remain yours alone.
				</p>
			</section>

			<section>
				<h3>Acceptable use</h3>
				<ul>
					<li>Do not attempt to break access controls, scrape, or overload the service</li>
					<li>Do not use the service to harm, harass, or exploit others</li>
					<li>Do not submit others’ private information without their consent</li>
				</ul>
			</section>

			<section>
				<h3>Your content</h3>
				<p>
					Survey answers you submit may be stored and analyzed in aggregate or individually
					(still without account identity) to improve the product. Portable save keys are
					your responsibility to keep private.
				</p>
			</section>

			<section>
				<h3>Disclaimer</h3>
				<p>
					The service is provided “as is,” without warranties of any kind. To the fullest
					extent permitted by law, the operators are not liable for indirect or consequential
					damages arising from your use of the beta.
				</p>
			</section>
		</article>
	{/if}
</main>

<style>
	.legal {
		max-width: 40rem;
		margin: 0 auto;
		padding: 2rem 1.25rem 4rem;
		color: var(--text);
	}

	.back {
		display: inline-block;
		margin-bottom: 1.5rem;
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--muted);
		text-decoration: none;
	}

	.back:hover {
		color: var(--accent);
	}

	header h1 {
		margin: 0;
		font-family: 'Fraunces', Georgia, serif;
		font-size: 2rem;
		letter-spacing: -0.02em;
	}

	.lede {
		margin: 0.5rem 0 0;
		color: var(--muted);
		line-height: 1.5;
	}

	.switch {
		display: flex;
		gap: 0.35rem;
		margin: 1.75rem 0 1.5rem;
		padding: 0.25rem;
		border: 1px solid var(--border);
		border-radius: 10px;
		background: var(--surface);
		width: fit-content;
	}

	.switch button {
		appearance: none;
		border: 0;
		background: transparent;
		color: var(--muted);
		font: inherit;
		font-weight: 600;
		font-size: 0.95rem;
		padding: 0.55rem 1.1rem;
		border-radius: 8px;
		cursor: pointer;
	}

	.switch button.active {
		background: var(--bg);
		color: var(--text);
		box-shadow: 0 0 0 1px var(--border);
	}

	.switch button:hover:not(.active) {
		color: var(--text);
	}

	.doc h2 {
		margin: 0 0 0.35rem;
		font-family: 'Fraunces', Georgia, serif;
		font-size: 1.45rem;
	}

	.updated {
		margin: 0 0 1.5rem;
		font-size: 0.85rem;
		color: var(--muted);
	}

	.doc section {
		margin-bottom: 1.35rem;
	}

	.doc h3 {
		margin: 0 0 0.4rem;
		font-size: 1.05rem;
	}

	.doc p,
	.doc li {
		margin: 0;
		line-height: 1.55;
		color: color-mix(in srgb, var(--text) 92%, var(--muted));
	}

	.doc ul {
		margin: 0.35rem 0 0;
		padding-left: 1.2rem;
	}

	.doc li + li {
		margin-top: 0.35rem;
	}

	.doc code {
		font-size: 0.88em;
		padding: 0.1em 0.35em;
		border-radius: 4px;
		background: var(--surface);
		border: 1px solid var(--border);
	}
</style>

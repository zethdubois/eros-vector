import { marked } from 'marked';

const modules = import.meta.glob('../../../docs/wiki/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

const manifestModules = import.meta.glob('../../../docs/wiki/_manifest.json', {
	import: 'default',
	eager: true
}) as Record<string, string[]>;

export type WikiArticleMeta = {
	/** Filename without extension — used as the contents label. */
	slug: string;
	/** Display label: `slug.md` */
	filename: string;
};

function slugFromPath(filePath: string): string | null {
	const match = filePath.match(/\/([^/]+)\.md$/i);
	return match?.[1] ?? null;
}

function isSafeSlug(slug: string): boolean {
	return /^[a-z0-9][a-z0-9_-]*$/i.test(slug);
}

/** Ordered slug list from _manifest.json, or [] if absent. */
function manifestOrder(): string[] {
	const entry = Object.values(manifestModules)[0];
	return Array.isArray(entry) ? entry : [];
}

function allArticles(): { slug: string; markdown: string }[] {
	const out: { slug: string; markdown: string }[] = [];
	for (const [filePath, markdown] of Object.entries(modules)) {
		const slug = slugFromPath(filePath);
		if (!slug || !isSafeSlug(slug)) continue;
		out.push({ slug, markdown });
	}
	const order = manifestOrder();
	return out.sort((a, b) => {
		const ia = order.indexOf(a.slug);
		const ib = order.indexOf(b.slug);
		// Both in manifest → manifest order
		if (ia !== -1 && ib !== -1) return ia - ib;
		// Only one in manifest → manifest entry wins
		if (ia !== -1) return -1;
		if (ib !== -1) return 1;
		// Neither in manifest → alphabetical
		return a.slug.localeCompare(b.slug);
	});
}

export function listWikiArticles(): WikiArticleMeta[] {
	return allArticles().map(({ slug }) => ({
		slug,
		filename: `${slug}.md`
	}));
}

export async function loadWikiArticle(
	slug: string
): Promise<{ slug: string; filename: string; html: string } | null> {
	if (!isSafeSlug(slug)) return null;
	const found = allArticles().find((a) => a.slug === slug);
	if (!found) return null;
	const html = await marked.parse(found.markdown, { gfm: true, breaks: false });
	return {
		slug,
		filename: `${slug}.md`,
		html
	};
}

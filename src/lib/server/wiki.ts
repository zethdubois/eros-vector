import { marked } from 'marked';

const modules = import.meta.glob('../../../../docs/wiki/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

export type WikiArticleMeta = {
	slug: string;
	title: string;
	summary: string;
};

const TITLE_OVERRIDES: Record<string, string> = {
	archetypes: 'Archetypes',
	blurb: 'Blurb',
	pitch: 'Pitch'
};

function slugFromPath(filePath: string): string | null {
	const match = filePath.match(/\/([^/]+)\.md$/i);
	return match?.[1] ?? null;
}

function isSafeSlug(slug: string): boolean {
	return /^[a-z0-9][a-z0-9_-]*$/i.test(slug);
}

function titleFromMarkdown(slug: string, markdown: string): string {
	const heading = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim();
	if (heading) return heading.replace(/\*+/g, '').trim();
	const bold = markdown.match(/^\*\*(.+?)\*\*/m)?.[1]?.trim();
	if (bold) return bold;
	return TITLE_OVERRIDES[slug] ?? slug;
}

function summaryFromMarkdown(markdown: string): string {
	const lines = markdown
		.split(/\r?\n/)
		.map((l) => l.trim())
		.filter((l) => l && !l.startsWith('#') && !l.startsWith('***'));
	const first = lines[0] ?? '';
	return first.replace(/\*+/g, '').slice(0, 160);
}

function allArticles(): { slug: string; markdown: string }[] {
	const out: { slug: string; markdown: string }[] = [];
	for (const [filePath, markdown] of Object.entries(modules)) {
		const slug = slugFromPath(filePath);
		if (!slug || !isSafeSlug(slug)) continue;
		out.push({ slug, markdown });
	}
	return out;
}

export function listWikiArticles(): WikiArticleMeta[] {
	return allArticles()
		.map(({ slug, markdown }) => ({
			slug,
			title: titleFromMarkdown(slug, markdown),
			summary: summaryFromMarkdown(markdown)
		}))
		.sort((a, b) => a.title.localeCompare(b.title));
}

export async function loadWikiArticle(
	slug: string
): Promise<{ title: string; html: string; markdown: string } | null> {
	if (!isSafeSlug(slug)) return null;
	const found = allArticles().find((a) => a.slug === slug);
	if (!found) return null;
	const html = await marked.parse(found.markdown, { gfm: true, breaks: false });
	return {
		title: titleFromMarkdown(slug, found.markdown),
		html,
		markdown: found.markdown
	};
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

export interface ProjectMeta {
	slug: string;
	link: string;
	description: string;
	featured?: boolean;
}

export interface Post {
	slug: string;
	title: string;
	date: string;
	tags: string[];
	excerpt: string;
	project?: ProjectMeta;
}

export type ProjectPost = Post & { project: ProjectMeta };

export function isProjectPost(post: Post): post is ProjectPost {
	return (
		typeof post.project === 'object' &&
		post.project !== null &&
		typeof post.project.slug === 'string' &&
		typeof post.project.link === 'string' &&
		typeof post.project.description === 'string'
	);
}

interface PostModule {
	metadata: {
		title: string;
		date: string;
		tags?: string[];
		project?: ProjectMeta;
	};
}

function stripMarkdown(raw: string): string {
	return raw
		.replace(/^---[\s\S]*?---\r?\n/, '')
		.replace(/```[\s\S]*?```/g, '')
		.replace(/`([^`]+)`/g, '$1')
		.replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		.replace(/^#{1,6}\s+/gm, '')
		.replace(/^\s*[-*+]\s+/gm, '')
		.replace(/^\s*\d+\.\s+/gm, '')
		.replace(/^\s*>\s?/gm, '')
		.replace(/[*_~|]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

export function excerptFromMarkdown(raw: string, maxLength = 180): string {
	const text = stripMarkdown(raw);
	if (text.length <= maxLength) return text;

	const cut = text.slice(0, maxLength);
	const lastSpace = cut.lastIndexOf(' ');
	const snippet = (lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trimEnd();
	return `${snippet}…`;
}

const rawPosts = import.meta.glob('/src/posts/*.md', {
	eager: true,
	query: '?raw',
	import: 'default'
}) as Record<string, string>;

export function getPostExcerpt(slug: string): string {
	const entry = Object.entries(rawPosts).find(([path]) => path.endsWith(`/${slug}.md`));
	return entry ? excerptFromMarkdown(entry[1]) : '';
}

export function getPosts(): Post[] {
	const modules = import.meta.glob('/src/posts/*.md', { eager: true });
	const posts: Post[] = [];

	for (const [path, module] of Object.entries(modules)) {
		const slug = path.split('/').pop()?.replace('.md', '') ?? '';
		const meta = (module as PostModule).metadata;

		posts.push({
			slug,
			title: meta.title,
			date: meta.date,
			tags: meta.tags ?? [],
			excerpt: getPostExcerpt(slug),
			project: meta.project
		});
	}

	return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getProjects(): ProjectPost[] {
	return getPosts().filter(isProjectPost);
}

export function getFeaturedProjects(projects: ProjectPost[], limit = 3): ProjectPost[] {
	const featured = projects.filter((project) => project.project.featured);
	return (featured.length > 0 ? featured : projects).slice(0, limit);
}

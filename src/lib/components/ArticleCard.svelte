<script lang="ts">
	import { resolve } from '$app/paths';

	interface Post {
		slug: string;
		date: string;
		tags: string[];
		title: string;
	}

	let { post }: { post: Post } = $props();
</script>

<article class="group">
	<a
		href={resolve(`/blog/${post.slug}`)}
		class="block rounded-lg border border-border p-6 transition-colors hover:bg-accent"
	>
		<div class="flex items-center gap-3 text-sm text-muted-foreground">
			<time>{post.date}</time>
			<span>·</span>
			<div class="flex gap-2">
				{#each post.tags as tag (tag)}
					<span class="rounded-full bg-secondary px-2 py-0.5 text-xs">{tag}</span>
				{/each}
			</div>
		</div>
		<h3 class="mt-2 text-xl font-semibold group-hover:text-primary transition-colors">
			{post.title}
		</h3>
	</a>
</article>

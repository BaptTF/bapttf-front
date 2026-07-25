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
		class="block overflow-hidden rounded-lg border border-border p-6 transition-colors hover:bg-accent"
	>
		<h3 class="text-xl font-semibold transition-colors group-hover:text-primary">
			{post.title}
		</h3>
		<time class="mt-2 block text-sm text-muted-foreground">{post.date}</time>
		{#if post.tags.length}
			<div class="mt-4 flex flex-wrap gap-2">
				{#each post.tags as tag (tag)}
					<span class="rounded-full bg-secondary px-2 py-0.5 text-xs">{tag}</span>
				{/each}
			</div>
		{/if}
	</a>
</article>

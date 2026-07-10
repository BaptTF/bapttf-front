<script lang="ts">
	import { ArrowRight } from '@lucide/svelte';
	import type { ProjectPost } from '$lib/utils';

	interface Props {
		post: ProjectPost;
	}

	let { post }: Props = $props();
</script>

<a
	href="/blog/{post.slug}"
	class="group relative flex flex-col rounded-lg border border-border p-6 transition-colors hover:bg-accent"
>
	<div class="flex items-start justify-between">
		<h2 class="font-semibold group-hover:text-primary transition-colors">{post.title}</h2>
		<ArrowRight
			class="size-5 text-muted-foreground group-hover:text-primary transition-colors"
		/>
	</div>
	<p class="mt-2 text-sm text-muted-foreground flex-1">{post.project.description}</p>
	<div class="mt-4 flex flex-wrap gap-2">
		{#each post.tags as tag (tag)}
			<span class="rounded-full bg-secondary px-3 py-1 text-xs">{tag}</span>
		{/each}
	</div>
</a>

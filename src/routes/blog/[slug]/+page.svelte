<script lang="ts">
	import { ArrowUpRight } from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let Post = $derived(data.content);
</script>

<article class="prose prose-neutral max-w-none dark:prose-invert">
	<header class="mb-8 not-prose">
		<a href={resolve('/blog')} class="text-sm text-muted-foreground hover:text-foreground">← Retour au blog</a>
		<h1 class="mt-4 text-3xl font-bold tracking-tight">{data.meta.title}</h1>
		<div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
			<time class="shrink-0">{data.meta.date}</time>
			{#if data.meta.tags}
				<div class="flex min-w-0 flex-wrap gap-2">
					{#each data.meta.tags as tag (tag)}
						<span class="rounded-full bg-secondary px-2 py-0.5 text-xs">{tag}</span>
					{/each}
				</div>
			{/if}
			{#if data.meta.project?.link}
				<span>·</span>
				<a
					href={data.meta.project.link}
					target="_blank"
					rel="external noopener noreferrer"
					class="inline-flex items-center gap-1 hover:text-foreground"
				>
					Voir le projet
					<ArrowUpRight class="size-3.5" />
				</a>
			{/if}
		</div>
	</header>
	<Post />
</article>

<script lang="ts">
	import ArticleCard from '$lib/components/ArticleCard.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Blog - Baptiste</title>
</svelte:head>

<header class="mb-12">
	<h1 class="text-3xl font-bold tracking-tight">Blog</h1>
	<p class="mt-2 text-muted-foreground">Articles</p>
</header>

<div class="space-y-8">
	{#each data.posts as post (post.slug)}
		<ArticleCard {post} />
	{/each}
</div>

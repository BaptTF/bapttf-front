<script lang="ts">
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Projects — Baptiste</title>
</svelte:head>

<header class="mb-12">
	<h1 class="text-3xl font-bold tracking-tight">Projets</h1>
	<p class="mt-2 text-muted-foreground">Un article de blog spécifique à un projet</p>
</header>

<div class="grid gap-6 md:grid-cols-2">
	{#each data.projects as project (project.slug)}
		<ProjectCard post={project} />
	{/each}
</div>

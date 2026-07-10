<script lang="ts">
    import Terminal from "$lib/components/Terminal.svelte";
    import type { PageData } from "./$types";
    import ProjectCard from "$lib/components/ProjectCard.svelte";
    import ArticleCard from "$lib/components/ArticleCard.svelte";

    let { data }: { data: PageData } = $props();
</script>

<svelte:head>
    <title>Baptiste</title>
</svelte:head>

<!-- Hero -->
<section class="flex min-h-[40vh] flex-col justify-center">
    <h1
        class="mb-6 text-5xl font-bold tracking-tight text-foreground md:text-7xl"
    >
        Baptiste JULLIEN
    </h1>
    <p
        class="mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed"
    >
        J’aime comprendre toute la stack : Linux → NixOS → APIs → k8s.
    </p>
</section>

<!-- Projects -->
<section class="mt-0">
    <h2 class="mb-8 text-2xl font-bold tracking-tight">Projets</h2>
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {#each data.featuredProjects as project (project.slug)}
            <ProjectCard post={project} />
        {/each}
    </div>
</section>

<!-- Latest Posts -->
<section class="mt-16">
    <h2 class="mb-8 text-2xl font-bold tracking-tight">Derniers articles</h2>
    <div class="space-y-6">
        {#each data.posts as post (post.slug)}
            <ArticleCard {post} />
        {/each}
    </div>
</section>

<!-- Terminal -->
<section class="mt-24 mb-12">
    <h2 class="mb-6 text-2xl font-bold tracking-tight">Terminal</h2>
    <p class="mb-4 text-sm text-muted-foreground">
        Il y a quelque chose ici. Essayez de voir ce que vous trouvez.
    </p>
    <Terminal />
</section>

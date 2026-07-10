<script lang="ts">
	import { resolve } from '$app/paths';

	interface Rooter {
		pseudo: string;
		timestamp: string;
	}

	let rooters: Rooter[] = $state([]);
	let loading = $state(true);
	let error = $state('');

	const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:1323/api/v1';

	$effect(() => {
		fetchRooters();
	});

	async function fetchRooters() {
		try {
			const response = await fetch(`${API_URL}/hall-of-root`);
			if (!response.ok) throw new Error('Failed to fetch');
			const data = await response.json();
			rooters = data.users || [];
		} catch {
			error = 'Le Hall of Root est temporairement indisponible.';
		} finally {
			loading = false;
		}
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('fr-FR', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>Hall of Root — Baptiste</title>
</svelte:head>

<header class="mb-12">
	<h1 class="text-3xl font-bold tracking-tight">Hall of Root</h1>
	<p class="mt-2 text-muted-foreground">
		La liste des personnes qui ont trouvé le mot de passe du terminal.
	</p>
</header>

{#if loading}
	<p class="text-muted-foreground">Chargement...</p>
{:else if error}
	<p class="text-red-500">{error}</p>
{:else if rooters.length === 0}
	<p class="text-muted-foreground">
		Personne n'a encore obtenu les privilèges root. 
		<a href={resolve('/')} class="text-primary hover:underline">Serez-vous le premier ?</a>
	</p>
{:else}
	<div class="space-y-4">
		{#each rooters as rooter (rooter.pseudo)}
			<div class="flex items-center justify-between rounded-lg border border-border p-4">
				<div>
					<p class="font-mono text-lg font-semibold text-green-600">{rooter.pseudo}</p>
					<p class="text-xs text-muted-foreground">Privilèges root obtenus le {formatDate(rooter.timestamp)}</p>
				</div>
				<div class="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
					root
				</div>
			</div>
		{/each}
	</div>
{/if}

<div class="mt-12">
	<a href={resolve('/')} class="text-sm text-muted-foreground hover:text-foreground">← Retour à l'accueil</a>
</div>

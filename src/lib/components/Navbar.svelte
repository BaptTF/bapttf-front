<script lang="ts">
	import { page } from '$app/stores';
	import { resolve } from '$app/paths';

	type Route = '/' | '/projects' | '/blog';
	const navItems: Array<{ href: Route; label: string }> = [
		{ href: '/', label: 'Home' },
		{ href: '/projects', label: 'Projects' },
		{ href: '/blog', label: 'Blog' }
	];
</script>

<nav class="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
	<div class="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
		<a href={resolve('/')} class="text-xl font-semibold text-foreground hover:text-primary transition-colors">
			Baptiste
		</a>
		<ul class="flex gap-8">
			{#each navItems as item, i (i)}
				{@const isActive = $page.url.pathname === item.href}
				<li>
					<a
						href={resolve(item.href)}
						class="text-sm transition-colors hover:text-foreground {isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}"
					>
						{item.label}
					</a>
				</li>
			{/each}
		</ul>
	</div>
</nav>

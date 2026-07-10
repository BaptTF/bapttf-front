<script lang="ts">
	import { Github, Linkedin, Mail } from '@lucide/svelte';
</script>

<footer class="border-t border-border pt-8 pb-8">
	<div class="flex flex-col items-center justify-center gap-8 md:flex-row">
		<p class="text-sm text-muted-foreground">
			© {new Date().getFullYear()} Baptiste
		</p>
		<div class="flex items-center gap-6">
			<a
				href="https://github.com/BaptTF"
				target="_blank"
				rel="noopener noreferrer"
				class="text-muted-foreground hover:text-foreground transition-colors"
				aria-label="GitHub"
			>
				<Github class="size-5" />
			</a>
			<a
				href="https://linkedin.com"
				target="_blank"
				rel="noopener noreferrer"
				class="text-muted-foreground hover:text-foreground transition-colors"
				aria-label="LinkedIn"
			>
				<Linkedin class="size-5" />
			</a>
			<a
				href="mailto:contact@example.com"
				class="text-muted-foreground hover:text-foreground transition-colors"
				aria-label="Email"
			>
				<Mail class="size-5" />
			</a>
		</div>
	</div>
</footer>

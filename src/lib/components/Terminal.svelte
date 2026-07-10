<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	// WebSocket state
	let ws: WebSocket | null = $state(null);
	let connected = $state(false);
	let isRoot = $state(false);
	let showPseudoPopup = $state(false);
	let pseudoInput = $state('');
	let pseudoError = $state('');
	
	// Terminal display
	let output: string[] = $state([]);
	let currentPrompt = $state('$');
	let isPasswordPrompt = $state(false);
	let awaitingPseudo = $state(false);
	
	// Input
	let inputValue = $state('');
	let inputRef: HTMLInputElement | null = $state(null);

	const WS_URL = import.meta.env.PUBLIC_WS_URL || 'ws://localhost:1323/ws/terminal';

	onMount(() => {
		connect();
		return () => {
			disconnect();
		};
	});

	function connect() {
		try {
			ws = new WebSocket(WS_URL);
			
			ws.onopen = () => {
				connected = true;
				addOutput('', false);
			};

			ws.onmessage = (event) => {
				const msg = JSON.parse(event.data);
				handleMessage(msg);
			};

			ws.onclose = () => {
				connected = false;
				addOutput('Connection closed.', false);
			};

			ws.onerror = () => {
				connected = false;
				addOutput('Connection error.', false);
			};
		} catch {
			addOutput('Failed to connect to terminal.', false);
		}
	}

	function disconnect() {
		if (ws) {
			ws.close();
			ws = null;
		}
	}

	function handleMessage(msg: { type: string; data: string }) {
		switch (msg.type) {
			case 'output':
				addOutput(msg.data, false);
				break;
			case 'error':
				addOutput(msg.data, false);
				break;
			case 'prompt':
				addOutput(msg.data, false);
				isPasswordPrompt = true;
				break;
			case 'root_granted':
				isRoot = true;
				currentPrompt = '#';
				addOutput('', false);
				break;
			case 'pseudo_request':
				awaitingPseudo = true;
				showPseudoPopup = true;
				break;
			case 'success':
				showPseudoPopup = true;
				break;
			default:
				addOutput(msg.data, false);
		}
	}

	function addOutput(text: string, isInput: boolean) {
		if (isInput) {
			output = [...output, `${currentPrompt} ${text}`];
		} else {
			output = [...output, text];
		}
		scrollToBottom();
	}

	function scrollToBottom() {
		// Auto-scroll handled by CSS
	}

	function sendCommand() {
		if (!ws || !inputValue.trim()) return;
		
		const cmd = inputValue.trim();
		addOutput(cmd, true);
		
		if (awaitingPseudo && isRoot) {
			// We're in root and server expects a pseudo next
			// Actually, according to spec, pseudo is sent as command after pseudo_request
			ws.send(JSON.stringify({ type: 'command', cmd }));
		} else {
			ws.send(JSON.stringify({ type: 'command', cmd }));
		}
		
		inputValue = '';
		isPasswordPrompt = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			sendCommand();
		}
	}

	function focusInput() {
		if (inputRef) inputRef.focus();
	}

	function handleKeyDownOnTerminal(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			focusInput();
		}
	}

	function submitPseudo() {
		if (!pseudoInput.trim() || !ws) return;
		
		ws.send(JSON.stringify({ type: 'command', cmd: pseudoInput.trim() }));
		pseudoInput = '';
		showPseudoPopup = false;
	}

	function goToRoot() {
		goto(resolve('/root'));
	}
</script>

{#if showPseudoPopup}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
		<div class="w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-lg">
			<h3 class="text-xl font-bold">Welcome to the Hall of Root</h3>
			<p class="mt-2 text-sm text-muted-foreground">
				Félicitations, vous avez obtenu les privilèges root.
			</p>
			<div class="mt-4">
				<input
					type="text"
					placeholder="Entrez votre pseudo"
					bind:value={pseudoInput}
					onkeydown={(e) => e.key === 'Enter' && submitPseudo()}
					class="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
				/>
			</div>
			{#if pseudoError}
				<p class="mt-2 text-sm text-red-500">{pseudoError}</p>
			{/if}
			<div class="mt-4 flex gap-3">
				<button
					onclick={submitPseudo}
					class="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90"
				>
					Confirmer
				</button>
				<button
					onclick={goToRoot}
					class="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent"
				>
					Voir le Hall of Root
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Terminal window -->
<div
	class="w-full overflow-hidden rounded-lg border border-border bg-black font-mono text-sm text-green-400 shadow-lg"
	onclick={focusInput}
	onkeydown={handleKeyDownOnTerminal}
	role="button"
	tabindex="0"
>
    <!-- Terminal header -->
    <div class="relative flex items-center border-b border-border/50 bg-zinc-900 px-4 py-2">
        <!-- Status (gauche) -->
        <div class="shrink-0">
            {#if connected}
                <span class="text-xs text-green-500">● connected</span>
            {:else}
                <span class="text-xs text-red-500">● disconnected</span>
            {/if}
        </div>

        <!-- Titre (centre) -->
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span class="text-xs text-muted-foreground">baptiste@bapttf.com:~</span>
        </div>

        <!-- Boutons de fenêtre (droite) -->
        <div class="ml-auto flex items-center gap-1">
            <div class="inline-flex h-6 w-6 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-zinc-700 hover:text-zinc-200" title="Minimize">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="0" y1="5" x2="10" y2="5"/></svg>
            </div>
            <div class="inline-flex h-6 w-6 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-zinc-700 hover:text-zinc-200" title="Maximize">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="1" width="8" height="8"/></svg>
            </div>
            <div class="inline-flex h-6 w-6 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-zinc-700 hover:text-zinc-200" title="Close">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="0" y1="0" x2="10" y2="10"/><line x1="10" y1="0" x2="0" y2="10"/></svg>
            </div>
        </div>
    </div>

	<!-- Terminal body -->
	<div class="h-96 overflow-y-auto p-4">
		{#each output as line, i (i)}
			<div class="whitespace-pre-wrap break-all">{line}</div>
		{/each}
		
		<!-- Input line -->
		{#if connected}
			<div class="flex items-center gap-2">
				<span class="shrink-0 text-green-400">{currentPrompt}</span>
				<input
					bind:this={inputRef}
					bind:value={inputValue}
					onkeydown={handleKeydown}
					type={isPasswordPrompt ? 'password' : 'text'}
					class="flex-1 bg-transparent text-green-400 outline-none"
					autocomplete="off"
					autocorrect="off"
					autocapitalize="off"
					spellcheck="false"
				/>
			</div>
		{/if}
	</div>
</div>

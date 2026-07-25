<script lang="ts">
    import "./layout.css";
    import favicon from "$lib/assets/favicon.svg";
    import Navbar from "$lib/components/Navbar.svelte";
    import Footer from "$lib/components/Footer.svelte";

    let { children } = $props();
</script>

<svelte:head>
    <link rel="icon" href={favicon} type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <meta name="theme-color" content="#121826" media="(prefers-color-scheme: dark)" />
    <meta name="theme-color" content="#f4f6f8" media="(prefers-color-scheme: light)" />
    <title>BaptTF</title>
    <script>
        function updateTheme() {
            document.documentElement.classList.toggle(
                "dark",
                window.matchMedia("(prefers-color-scheme: dark)").matches,
            );
        }
        updateTheme();
        window
            .matchMedia("(prefers-color-scheme: dark)")
            .addEventListener("change", updateTheme);
    </script>
</svelte:head>

<div class="min-h-screen flex flex-col">
    <Navbar />

    <main class="mx-auto max-w-5xl px-6 pt-24 pb-16 grow w-full min-w-0">
        {@render children()}
    </main>

    <Footer />
</div>

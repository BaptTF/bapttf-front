<script lang="ts">
    import "./layout.css";
    import favicon from "$lib/assets/favicon.svg";
    import Navbar from "$lib/components/Navbar.svelte";
    import Footer from "$lib/components/Footer.svelte";

    let { children } = $props();
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
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

    <main class="mx-auto max-w-5xl px-6 pt-24 pb-16 grow w-full">
        {@render children()}
    </main>

    <Footer />
</div>

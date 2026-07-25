<script lang="ts">
	import { page } from '$app/state';
	import { site, type SeoData } from '$lib/seo';

	let {
		title = site.name,
		description = site.description,
		type = 'website',
		image = site.ogImage
	}: SeoData = $props();

	const url = $derived(new URL(page.url.pathname, site.url).href);
	const imageUrl = $derived(
		image.startsWith('http') ? image : new URL(image, site.url).href
	);
	const fullTitle = $derived(title === site.name ? title : `${title} - Baptiste`);
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />

	<meta property="og:site_name" content={site.name} />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={url} />
	<meta property="og:type" content={type} />
	<meta property="og:image" content={imageUrl} />
	<meta property="og:locale" content="fr_FR" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={fullTitle} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={imageUrl} />

	<link rel="canonical" href={url} />
</svelte:head>

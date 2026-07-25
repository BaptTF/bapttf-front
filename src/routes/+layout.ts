import { defaultSeo } from '$lib/seo';

export const prerender = true;

export const load = () => ({
	seo: defaultSeo
});

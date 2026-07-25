export type SeoData = {
	title: string;
	description: string;
	type?: 'website' | 'article';
	image?: string;
};

export const site = {
	name: 'Baptiste JULLIEN',
	url: import.meta.env.PUBLIC_SITE_URL || 'https://bapttf.com',
	description: "J'aime comprendre toute la stack : Linux → NixOS → APIs → k8s.",
	ogImage: '/og.png'
} as const;

export const defaultSeo: SeoData = {
	title: site.name,
	description: site.description,
	type: 'website'
};

import adapter from '@sveltejs/adapter-static';
import { mdsvex } from 'mdsvex';
import { rehypeWrapTables } from './src/lib/markdown/rehype-wrap-tables.js';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.svx', '.md'],
	preprocess: [
		mdsvex({
			extensions: ['.md', '.svx'],
			rehypePlugins: [rehypeWrapTables]
		})
	],
	kit: {
		paths: {
			relative: false
		},
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: undefined,
			precompress: true,
			strict: true
		})
	}
};

export default config;

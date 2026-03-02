import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import * as path from 'path';

const __ALLOW_SERVE = path.join(__dirname, '/../../node_modules');
// console.log('===DEBUG===', { cwd: process.cwd(), env: process.env, ALLOW_SERVE:__ALLOW_SERVE });

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		fs: {
			allow: [__ALLOW_SERVE],
		}
	}
});

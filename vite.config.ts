import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		watch: {
			// Registry JSON is generated into static/r during dev; ignore it so Vite
			// does not full-reload the app on every jsrepo rebuild.
			ignored: ['**/static/r/**']
		}
	}
});

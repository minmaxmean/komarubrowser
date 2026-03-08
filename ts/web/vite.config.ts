import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, searchForWorkspaceRoot } from 'vite';
import { watchNodeModules } from 'vite-plugin-watch-node-modules';

// Bazel-specific path resolution
const execRoot = process.env.JS_BINARY__EXECROOT;
const workspaceRoot = process.env.BUILD_WORKSPACE_DIRECTORY;
console.debug('===DEBUG===', { cwd: process.cwd(), execRoot, workspaceRoot });

export default defineConfig({
  plugins: [tailwindcss(), sveltekit(), watchNodeModules(['@komarubrowser/common'])],
  server: {
    fs: {
      allow: [
        // Allow the Vite project root
        searchForWorkspaceRoot(process.cwd()),
        // Allow the physical location of symlinked node_modules in Bazel
        ...(execRoot ? [execRoot] : []),
        ...(workspaceRoot ? [workspaceRoot] : []),
      ],
    },
  },
});

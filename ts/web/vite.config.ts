import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, searchForWorkspaceRoot } from 'vite';
import { watchNodeModules } from 'vite-plugin-watch-node-modules';
import * as path from 'path';

// Bazel-specific path resolution
const execRoot = process.env.JS_BINARY__EXECROOT;
const workspaceRoot = process.env.BUILD_WORKSPACE_DIRECTORY;
console.log('===DEBUG===', { cwd: process.cwd(), execRoot, workspaceRoot });
// console.log('===DEBUG===', { cwd: process.cwd(), env: process.env, ALLOW_SERVE: __ALLOW_SERVE });

export default defineConfig({
  plugins: [tailwindcss(), sveltekit(), watchNodeModules(['@komarubrowser/common'])],
  server: {
    fs: {
      allow: [
        // Allow the Vite project root
        searchForWorkspaceRoot(process.cwd()),
        // Allow the physical location of symlinked node_modules in Bazel
        ...(execRoot ? [execRoot] : []),
        ...(workspaceRoot ? [workspaceRoot] : [])
      ]
    }
  }
});

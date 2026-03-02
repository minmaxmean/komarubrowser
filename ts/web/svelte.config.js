import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      fallback: '404.html',
      pages: 'dist',
      assets: 'dist'
    })
  },
  compilerOptions: {
    experimental: {
      async: true
    }
  }
};

export default config;

import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      fallback: '404.html',
      pages: 'dist',
      assets: 'dist',
    }),
    paths: {
      base: process.env.KIT_BASE ?? (process.argv.includes('dev') ? '' : '/komarubrowser'),
    },
  },
  compilerOptions: {
    experimental: {
      async: true,
    },
  },
};

const SHOULD_ALIAS = !!process.env['SHOULD_ALIAS'];
console.debug({ SHOULD_ALIAS });

if (SHOULD_ALIAS) {
  config.kit.alias = {
    '@komarubrowser/common': '../common',
  };
}

export default config;

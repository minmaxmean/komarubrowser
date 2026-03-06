import { type Config } from 'prettier';

const config: Config = {
  useTabs: false,
  tabWidth: 2,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
  plugins: [
    'prettier-plugin-svelte',
    'prettier-plugin-tailwindcss',
    '@trivago/prettier-plugin-sort-imports',
  ],
  overrides: [
    {
      files: '*.svelte',
      options: {
        parser: 'svelte',
        trailingComma: 'all',
      },
    },
  ],
  tailwindStylesheet: './src/routes/layout.css',
  importOrder: ['^@komarubrowser/(.*)$', '^[\$lib]', '^[./]'],
  // importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};

export default config;

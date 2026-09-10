import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sanity from '@sanity/astro';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadLocalEnv() {
  const file = resolve(process.cwd(), '.env');
  if (!existsSync(file)) return {};

  return Object.fromEntries(
    readFileSync(file, 'utf8')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const index = line.indexOf('=');
        const key = line.slice(0, index);
        const value = line.slice(index + 1).replace(/^["']|["']$/g, '');
        return [key, value];
      }),
  );
}

const env = { ...loadLocalEnv(), ...process.env };
const projectId = env.PUBLIC_SANITY_PROJECT_ID || 'placeholder';
const dataset = env.PUBLIC_SANITY_DATASET || 'production';
const apiVersion = env.PUBLIC_SANITY_API_VERSION || '2026-06-25';
const site = env.PUBLIC_SITE_URL || 'https://austrobuam.at';
const base = env.PUBLIC_SITE_BASE || undefined;

export default defineConfig({
  site,
  base,
  output: 'static',
  integrations: [
    sanity({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
      studioBasePath: '/admin',
    }),
    react(),
  ],
});

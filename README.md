# Original Austrobuam Website

Static Astro website for the Austrian Austropop band Original Austrobuam, with Sanity CMS content support and GitHub Pages deployment.

## Local Development

```bash
pnpm install
pnpm run dev
```

The site has local fallback content so it can run before Sanity is configured.

## Sanity

Set these public environment variables when connecting the real Sanity project:

```bash
PUBLIC_SANITY_PROJECT_ID=your-project-id
PUBLIC_SANITY_DATASET=production
PUBLIC_SANITY_API_VERSION=2026-06-25
```

The embedded Studio is available at `/admin`. Add local and production URLs to Sanity CORS settings for authenticated Studio use.

## Contact Form

The contact form uses Web3Forms when `PUBLIC_WEB3FORMS_ACCESS_KEY` is set. Without it, the contact section falls back to email contact copy.

## Deploy

GitHub Pages deployment is configured in `.github/workflows/deploy.yml`. For a custom domain, set `PUBLIC_SITE_URL` to the domain and add `public/CNAME`.

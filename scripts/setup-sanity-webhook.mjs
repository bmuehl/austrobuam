import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';

if (existsSync('.env')) process.loadEnvFile('.env');
const require = createRequire(import.meta.url);
const projectId = process.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.PUBLIC_SANITY_DATASET || 'production';
const url = 'https://api.github.com/repos/bmuehl/austrobuam/actions/workflows/deploy.yml/dispatches';
const name = 'Austrobuam published content deploy';
const definition = {
  type: 'document', name, url, dataset,
  description: 'Rebuild GitHub Pages when published website content changes. Drafts and release versions are excluded.',
  httpMethod: 'POST', apiVersion: '2025-02-19',
  includeDrafts: false, includeAllVersions: false, isDisabledByUser: false,
  rule: {
    on: ['create', 'update', 'delete'],
    // before() keeps unpublishing and deletion events in scope.
    filter: 'coalesce(after()._type, before()._type) in ["siteSettings", "bandMember", "concert", "galleryImage", "legalPage"] && !(coalesce(after()._id, before()._id) in path("drafts.**")) && !(coalesce(after()._id, before()._id) in path("versions.**"))',
    projection: '{"ref": "main"}',
  },
};

async function main() {
  if (process.argv.includes('--dry-run')) {
    console.log(JSON.stringify(definition, null, 2));
    return;
  }
  if (!projectId || !process.env.GITHUB_DEPLOY_TOKEN) {
    throw new Error('Missing project ID or dedicated GitHub deployment token');
  }
  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${process.env.GITHUB_DEPLOY_TOKEN}`,
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  const client = require('sanity/cli').getCliClient({
    projectId, dataset, apiVersion: '2025-02-19',
  }).withConfig({useProjectHostname: false});
  const uri = `/hooks/projects/${projectId}`;
  const hooks = await client.request({uri});
  const matches = hooks.filter(hook => !hook.deletedAt && hook.name === name && hook.dataset === dataset);
  if (matches.length > 1) throw new Error('Duplicate webhook definitions need review');

  // Verify dispatch permission without changing any Sanity content.
  const response = await fetch(url, {method: 'POST', headers, body: JSON.stringify({ref: 'main'})});
  if (!response.ok) throw new Error('GitHub workflow dispatch failed');
  const body = {...definition, headers};
  const saved = await client.request({
    uri: matches.length ? `${uri}/${matches[0].id}` : uri,
    method: matches.length ? 'PATCH' : 'POST', body,
  });
  const readback = await client.request({uri: `${uri}/${saved.id || matches[0]?.id}`});
  if (readback.isDisabled || readback.isDisabledByUser || readback.rule?.projection !== definition.rule.projection) {
    throw new Error('Webhook verification failed');
  }
  console.log('Published-content webhook enabled. GitHub accepted a test deployment.');
  console.log('Publish a website document in Sanity and check the webhook delivery log for an end-to-end test.');
}

main().catch(() => {
  // API error objects can contain request authorization headers.
  console.error('Webhook setup failed. Check the dedicated token (repository Actions: write), Sanity CLI login, and project settings. No credentials logged.');
  process.exitCode = 1;
});

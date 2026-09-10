# Automatic deployments

GitHub Pages rebuilds on pushes to main, manual workflow dispatch, and daily at
03:17 UTC (04:17 CET / 05:17 CEST). Scheduled Actions may be delayed; this is not
an exact-time scheduler. Public repositories can have schedules disabled after
60 days without repository activity; re-enable the workflow if necessary.

The daily build refreshes upcoming/past concert lists even without content edits.

## Sanity publish webhook

Create a fine-grained GitHub token restricted to `bmuehl/austrobuam`, with only
repository **Actions: read and write** (plus mandatory metadata read). Choose an
expiry and rotate it before expiration. Do not use a broad CLI or classic token.

Add `GITHUB_DEPLOY_TOKEN` to the ignored local `.env`, then run:

```sh
pnpm exec sanity exec scripts/setup-sanity-webhook.mjs --with-user-token
```

This sends the dedicated token to Sanity's webhook configuration, not to the
dataset, Git history, or frontend bundle. It tests GitHub workflow dispatch and
creates or updates the named webhook, avoiding duplicates. Rerun to rotate its
token. The script requires a Sanity CLI login with webhook-management permission.

The webhook targets production by default (or `PUBLIC_SANITY_DATASET`). It watches
published site settings, members, concerts, gallery images and legal pages.
Creation, updates, deletion and unpublishing trigger builds; drafts, release
versions and standalone asset uploads do not. The payload is only `{"ref":"main"}`.

Preview the non-secret definition without making network requests:

```sh
node scripts/setup-sanity-webhook.mjs --dry-run
```

After setup, publish an intended content change and check both Sanity's webhook
delivery log and the GitHub Actions run. Draft-only changes should not trigger a
run. The existing workflow concurrency group serializes deployments and avoids
interrupting the active deployment. GitHub may consolidate pending runs.

Troubleshooting: a 401/403 delivery usually means the GitHub token expired or lacks
permission. Check dataset/type filters if publishing produces no delivery.
Disable the named webhook in Sanity to pause publish-triggered deployment.

References:
- https://www.sanity.io/docs/http-reference/webhooks
- https://docs.github.com/en/rest/actions/workflows#create-a-workflow-dispatch-event
- https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule

import type { APIRoute } from 'astro';
import { getConcerts } from '../lib/content';
import { calendarFeed } from '../lib/calendar';
import { sitePath } from '../lib/paths';

export const GET: APIRoute = async ({ site, url }) => new Response(
  calendarFeed(await getConcerts(), new URL(sitePath('/auftritte/'), site || url.origin).href),
  { headers: { 'Content-Type': 'text/calendar; charset=utf-8' } },
);

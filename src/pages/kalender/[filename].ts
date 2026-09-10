import type { APIRoute, GetStaticPaths } from 'astro';
import { getConcerts, type Concert } from '../../lib/content';
import { calendarFeed, calendarFiles } from '../../lib/calendar';
import { sitePath } from '../../lib/paths';

export const getStaticPaths: GetStaticPaths = async () => {
  const concerts = await getConcerts();
  const files = calendarFiles(concerts);
  return concerts.map((concert) => ({ params: { filename: files[concert._id] }, props: { concert } }));
};

export const GET: APIRoute = ({ props, site, url }) => new Response(
  calendarFeed([props.concert as Concert], new URL(sitePath('/auftritte/'), site || url.origin).href),
  { headers: { 'Content-Type': 'text/calendar; charset=utf-8' } },
);

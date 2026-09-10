import ical, { ICalEventStatus } from 'ical-generator';
import type { Concert } from './content';
import { createHash } from 'node:crypto';

export function calendarFiles(concerts: Concert[]) {
  const counts = new Map<string, number>();
  for (const concert of concerts) {
    const name = calendarFilename(concert);
    counts.set(name, (counts.get(name) || 0) + 1);
  }
  return Object.fromEntries(concerts.map((concert) => {
    const name = calendarFilename(concert);
    // Distinguish multiple concerts on the same day without exposing document IDs.
    const suffix = createHash('sha256').update(concert._id).digest('hex').slice(0, 12);
    return [concert._id, counts.get(name)! > 1 ? name.replace('.ics', `-${suffix}.ics`) : name];
  }));
}

export function calendarFilename(concert: Concert) {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'Europe/Vienna', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date(concert.startsAt));
  const date = ['year', 'month', 'day'].map((type) => parts.find((part) => part.type === type)?.value).join('-');
  return `Original-Austrobuam-${date}.ics`;
}

export function concertLocation(concert: Concert) {
  const address = concert.postalAddress;
  const structured = [address?.street, [address?.postalCode, address?.city].filter(Boolean).join(' '), address?.country];
  return [concert.venue, ...(address?.street || address?.city || address?.postalCode ? structured : [concert.address])]
    .filter(Boolean).join(', ');
}

export function concertEnd(concert: Concert) {
  return concert.endsAt && new Date(concert.endsAt) > new Date(concert.startsAt) ? concert.endsAt : undefined;
}

function description(concert: Concert, pageUrl: string) {
  return ['Original Austrobuam', concert.status === 'cancelled' ? 'Abgesagt' : '',
    concert.status === 'soldOut' ? 'Ausverkauft' : '',
    !concertEnd(concert) ? 'Endzeit noch nicht bekannt.' : '', concert.infoUrl, pageUrl].filter(Boolean).join('\n');
}

export function calendarFeed(concerts: Concert[], pageUrl: string) {
  const calendar = ical({ name: 'Original Austrobuam – Auftritte', prodId: { company: 'Original Austrobuam', product: 'Auftritte', language: 'DE' }, ttl: 3600 });
  for (const concert of concerts) {
    const end = concertEnd(concert);
    calendar.createEvent({
      id: `${concert._id}@austrobuam.at`,
      start: new Date(concert.startsAt),
      ...(end ? { end: new Date(end) } : {}),
      stamp: new Date(concert._updatedAt),
      lastModified: new Date(concert._updatedAt),
      summary: `${concert.status === 'cancelled' ? 'Abgesagt: ' : ''}${concert.title} – Original Austrobuam`,
      location: concertLocation(concert),
      description: description(concert, pageUrl),
      url: concert.infoUrl || pageUrl,
      status: concert.status === 'cancelled' ? ICalEventStatus.CANCELLED : ICalEventStatus.CONFIRMED,
    });
  }
  return calendar.toString();
}

export function googleCalendarUrl(concert: Concert, pageUrl: string) {
  const date = (value: string) => new Date(value).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  return `https://calendar.google.com/calendar/render?${new URLSearchParams({
    action: 'TEMPLATE', text: `${concert.title} – Original Austrobuam`,
    dates: `${date(concert.startsAt)}/${date(concertEnd(concert) || concert.startsAt)}`,
    ctz: 'Europe/Vienna', location: concertLocation(concert), details: description(concert, pageUrl),
  })}`;
}

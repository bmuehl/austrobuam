import assert from 'node:assert/strict';
import { calendarFeed, calendarFilename, calendarFiles, googleCalendarUrl } from '../src/lib/calendar.ts';

const event = {
  _id: 'concert.test', _updatedAt: '2026-09-10T12:00:00Z',
  title: 'Musik, Spaß; live', startsAt: '2026-09-18T18:30:00+02:00',
  endsAt: '2026-09-18T21:00:00+02:00', venue: 'Café Test',
  postalAddress: { street: 'Testgasse 1', postalCode: '2700', city: 'Wiener Neustadt', country: 'Österreich' },
};
const url = 'https://bmuehl.github.io/austrobuam/auftritte/';
assert.equal(calendarFilename(event), 'Original-Austrobuam-2026-09-18.ics');
assert.equal(calendarFiles([event])[event._id], 'Original-Austrobuam-2026-09-18.ics');
const sameDay = { ...event, _id: 'concert.other' };
const files = calendarFiles([event, sameDay]);
assert.notEqual(files[event._id], files[sameDay._id]);
assert.deepEqual(files, calendarFiles([sameDay, event]));
assert.equal(calendarFilename({ ...event, startsAt: '2026-09-18T23:30:00Z' }), 'Original-Austrobuam-2026-09-19.ics');
const feed = calendarFeed([event], url);
assert.match(feed, /UID:concert.test@austrobuam.at/);
assert.match(feed, /DTSTART:20260918T163000Z/);
assert.match(feed, /DTEND:20260918T190000Z/);
assert.match(feed, /SUMMARY:Musik\\, Spaß\\; live/);
assert.match(feed, /URL;VALUE=URI:https:\/\/bmuehl.github.io\/austrobuam\/auftritte\//);
assert.equal(calendarFeed([event], url), feed);
assert.match(calendarFeed([{ ...event, status: 'cancelled' }], url), /STATUS:CANCELLED/);
assert.doesNotMatch(calendarFeed([{ ...event, endsAt: undefined }], url), /DTEND:/);
assert.doesNotMatch(calendarFeed([], url), /BEGIN:VEVENT/);
const google = new URL(googleCalendarUrl(event, url));
assert.equal(google.searchParams.get('dates'), '20260918T163000Z/20260918T190000Z');
assert.match(google.searchParams.get('location'), /2700 Wiener Neustadt/);
const winter = new URL(googleCalendarUrl({ ...event, startsAt: '2026-12-18T18:30:00+01:00', endsAt: undefined }, url));
assert.equal(winter.searchParams.get('dates'), '20261218T173000Z/20261218T173000Z');
console.log('Calendar tests passed.');

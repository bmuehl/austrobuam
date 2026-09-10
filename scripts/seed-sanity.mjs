import { createClient } from '@sanity/client';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const env = { ...loadLocalEnv(), ...process.env };
const apiVersion = env.PUBLIC_SANITY_API_VERSION || '2026-06-25';
const projectId = env.PUBLIC_SANITY_PROJECT_ID;
const dataset = env.PUBLIC_SANITY_DATASET || 'production';

if (!projectId) {
  throw new Error('PUBLIC_SANITY_PROJECT_ID is missing.');
}

const client = await getClient();

const documents = [
  {
    _id: 'siteSettings.main',
    _type: 'siteSettings',
    title: 'Original Austrobuam',
    tagline: 'Austropop von A bis Z',
    intro:
      'Wir bringen Austropop-Klassiker und seltenere Perlen auf die Bühne: ehrlich, handgemacht und mit Freude an Songs, die in Österreich Geschichte geschrieben haben.',
    bookingEmail: 'buchung@austrobuam.at',
    socialLinks: [
      { _key: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/AustroBuam/' },
      {
        _key: 'youtube',
        label: 'YouTube',
        url: 'https://www.youtube.com/channel/UCNqAX7zKffNJz8VQXOcm1GQ',
      },
      { _key: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/austrobuam/' },
      { _key: 'soundcloud', label: 'SoundCloud', url: 'https://soundcloud.com/user-736106400' },
    ],
  },
  {
    _id: 'bandMember.gottfried-hoinig',
    _type: 'bandMember',
    name: 'Gottfried Hoinig',
    role: 'Lead-Gesang & Gitarre',
    bio: 'Die Stimme der Austrobuam: verwurzelt in Wiener Bandgeschichte und zuhause zwischen Austropop, Rock und den großen Songs der 60er bis 90er.',
    sortOrder: 10,
  },
  {
    _id: 'bandMember.bernhard-muehl',
    _type: 'bandMember',
    name: 'Bernhard Mühl',
    role: 'Sologitarre',
    bio: 'Gitarrist, Arrangeur und Produzent mit einem Ohr für Melodie und einem sicheren Gespür für den Sound der Austropop-Klassiker.',
    sortOrder: 20,
  },
  {
    _id: 'bandMember.peter-zimmermann',
    _type: 'bandMember',
    name: 'Peter Zimmermann',
    role: 'Bass',
    bio: 'Sorgt für Fundament, Druck und Ruhe im Maschinenraum der Band, wenn die Bühne bebt und der Austropop rockt.',
    sortOrder: 30,
  },
  {
    _id: 'bandMember.christian-eberl',
    _type: 'bandMember',
    name: 'Christian Eberl',
    role: '6- & 12-saitige Gitarre',
    bio: 'Gitarrist, Technikmensch und Klangtüftler mit Liebe zu Austropop, Rock und sauberem Bühnen-Sound.',
    sortOrder: 40,
  },
  {
    _id: 'bandMember.wolfgang-halbritter',
    _type: 'bandMember',
    name: 'Wolfgang Halbritter',
    role: 'Percussions',
    bio: 'Zuständig für Rhythmus und Time, vielseitig unterwegs von Jazz über Blues und Rock bis Folk-Rock.',
    sortOrder: 50,
  },
  {
    _id: 'concert.2026-09-12-sommerabend',
    _type: 'concert',
    title: 'Sommerabend mit Austropop',
    venue: 'Wien und Umgebung',
    startsAt: '2026-09-12T19:30:00+02:00',
    address: 'Details folgen',
    status: 'scheduled',
  },
  {
    _id: 'concert.2026-11-07-revival-live',
    _type: 'concert',
    title: 'Austropop Revival Live',
    venue: 'Niederösterreich',
    startsAt: '2026-11-07T20:00:00+01:00',
    address: 'Details folgen',
    status: 'scheduled',
  },
  {
    _id: 'galleryImage.logo',
    _type: 'galleryImage',
    title: 'Original Austrobuam Logo',
    alt: 'Original Austrobuam Logo mit Musiknotenbaum',
    caption: 'Austropop, handgemacht und bunt.',
    featured: true,
    sortOrder: 10,
  },
  {
    _id: 'legalPage.impressum',
    _type: 'legalPage',
    slug: { _type: 'slug', current: 'impressum' },
    title: 'Impressum',
    body: [
      block('Platzhalter für die verpflichtenden Angaben des Medieninhabers bzw. Diensteanbieters.'),
      block(
        'Vor dem Launch bitte Name/Firma, geografische Anschrift, schnelle Kontaktmöglichkeit inklusive E-Mail, ggf. Firmenbuch, UID, Aufsichtsbehörde, Kammer- oder Berufsangaben und die grundlegende Richtung der Website ergänzen.',
      ),
      block('Diese Vorlage ersetzt keine Rechtsberatung.'),
    ],
  },
  {
    _id: 'legalPage.datenschutz',
    _type: 'legalPage',
    slug: { _type: 'slug', current: 'datenschutz' },
    title: 'Datenschutzerklärung',
    body: [
      block('Diese Website ist als statische Website geplant. Personenbezogene Daten werden nur verarbeitet, wenn Besucher aktiv Kontakt aufnehmen.'),
      block('Bei Nutzung des Kontaktformulars werden die eingegebenen Daten an den konfigurierten Formularanbieter übermittelt und zur Bearbeitung der Anfrage verwendet.'),
      block('Sanity wird als Content-Management-System genutzt. GitHub Pages wird für das Hosting verwendet. Es sind in Version 1 keine Analytics- oder Marketing-Cookies vorgesehen.'),
      block('Vor dem Launch bitte Anbieter, Verantwortlichen, Rechtsgrundlagen, Speicherdauer und Betroffenenrechte final prüfen und ergänzen.'),
    ],
  },
];

function block(text) {
  return {
    _type: 'block',
    _key: keyFrom(text),
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: `${keyFrom(text)}Span`, text, marks: [] }],
  };
}

function keyFrom(value) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w]+/g, '')
    .slice(0, 24);
}

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

async function getClient() {
  if (env.SANITY_AUTH_TOKEN) {
    return createClient({
      projectId,
      dataset,
      apiVersion,
      token: env.SANITY_AUTH_TOKEN,
      useCdn: false,
    });
  }

  const { getCliClient } = await import('sanity/cli');
  return getCliClient({ apiVersion });
}

const transaction = client.transaction();

for (const document of documents) {
  transaction.createOrReplace(document);
}

await transaction.commit();

console.log(`Seeded ${documents.length} documents into Sanity.`);

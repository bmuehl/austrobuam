import { createClient } from '@sanity/client';

export interface SiteSettings {
  title: string;
  tagline: string;
  intro: string;
  homepagePhoto?: GalleryImage;
  bookingEmail: string;
  socialLinks: Array<{ label: string; url: string }>;
}

export interface BandMember {
  name: string;
  role?: string;
  bio?: string;
  portrait?: string;
}

export interface Concert {
  _id: string;
  _updatedAt: string;
  title: string;
  venue?: string;
  startsAt: string;
  endsAt?: string;
  address?: string;
  postalAddress?: { street?: string; postalCode?: string; city?: string; country?: string };
  poster?: GalleryImage;
  infoUrl?: string;
  status?: 'scheduled' | 'cancelled' | 'soldOut';
}

export interface GalleryImage {
  width?: number;
  height?: number;
  title?: string;
  image?: string;
  alt: string;
  caption?: string;
  featured?: boolean;
}

export interface LegalPage {
  title: string;
  body: any[];
}

const emptySiteSettings: SiteSettings = {
  title: 'Original Austrobuam',
  tagline: '',
  intro: '',
  bookingEmail: '',
  socialLinks: [],
};

const emptyLegalPages: Record<'impressum' | 'datenschutz', LegalPage> = {
  impressum: { title: 'Impressum', body: [] },
  datenschutz: { title: 'Datenschutz', body: [] },
};

const sanityReady =
  Boolean(import.meta.env.PUBLIC_SANITY_PROJECT_ID) &&
  import.meta.env.PUBLIC_SANITY_PROJECT_ID !== 'placeholder';

const contentClient = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID || 'placeholder',
  dataset: import.meta.env.PUBLIC_SANITY_DATASET || 'production',
  apiVersion: import.meta.env.PUBLIC_SANITY_API_VERSION || '2026-06-25',
  token: import.meta.env.SANITY_AUTH_TOKEN,
  useCdn: false,
});

async function fetchFromSanity<T>(query: string, params?: Record<string, unknown>): Promise<T | null> {
  if (!sanityReady) return null;

  try {
    return params ? await contentClient.fetch<T>(query, params) : await contentClient.fetch<T>(query);
  } catch {
    // Client errors may include authorization headers; never log the raw error.
    if (import.meta.env.PROD) throw new Error('Sanity fetch failed; refusing to publish empty content.');
    console.warn('Sanity fetch failed, using empty content.');
    return null;
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const settings = await fetchFromSanity<Partial<SiteSettings>>(
    `*[_type == "siteSettings"][0]{
      title,
      tagline,
      intro,
      homepagePhoto->{title, "image": image.asset->url, "width": image.asset->metadata.dimensions.width, "height": image.asset->metadata.dimensions.height, alt, caption},
      bookingEmail,
      socialLinks[]{label, url}
    }`,
  );

  return {
    ...emptySiteSettings,
    ...settings,
    socialLinks: settings?.socialLinks || [],
  };
}

export async function getBandMembers(): Promise<BandMember[]> {
  return (await fetchFromSanity<BandMember[]>(
    `*[_type == "bandMember"] | order(sortOrder asc, name asc){
      name,
      role,
      bio,
      "portrait": portrait.asset->url
    }`,
  )) || [];
}

export async function getConcerts(): Promise<Concert[]> {
  const concerts = (await fetchFromSanity<Concert[]>(
    `*[_type == "concert"] | order(startsAt asc){
      _id,
      _updatedAt,
      title,
      venue,
      startsAt,
      endsAt,
      address,
      postalAddress{street, postalCode, city, country},
      "poster": poster{"image": asset->url, alt},
      infoUrl,
      status
    }`,
  )) || [];

  return [...concerts].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
}

export async function getGalleryImages(): Promise<GalleryImage[]> {
  return (await fetchFromSanity<GalleryImage[]>(
    `*[_type == "galleryImage"] | order(featured desc, sortOrder asc, title asc){
      title,
      "image": image.asset->url,
      alt,
      caption,
      featured
    }`,
  )) || [];
}

export async function getLegalPage(slug: 'impressum' | 'datenschutz'): Promise<LegalPage> {
  const page = await fetchFromSanity<LegalPage>(
    `*[_type == "legalPage" && slug.current == $slug][0]{
      title,
      body
    }`,
    { slug },
  );

  return {
    ...emptyLegalPages[slug],
    ...page,
    body: page?.body || [],
  };
}

export function getUpcomingConcerts(concerts: Concert[]) {
  const now = Date.now();
  return concerts.filter((concert) => new Date(concert.startsAt).getTime() >= now);
}

export function getPastConcerts(concerts: Concert[]) {
  const now = Date.now();
  return concerts.filter((concert) => new Date(concert.startsAt).getTime() < now).reverse();
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('de-AT', {
    timeZone: 'Europe/Vienna',
    weekday: 'short',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

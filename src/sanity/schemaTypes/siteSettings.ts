import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'siteSettings',
  title: 'Website Einstellungen',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Seitentitel', type: 'string' }),
    defineField({ name: 'tagline', title: 'Claim', type: 'string' }),
    defineField({ name: 'intro', title: 'Kurzbeschreibung', type: 'text', rows: 4 }),
    defineField({ name: 'homepagePhoto', title: 'Foto auf der Startseite', type: 'reference', to: [{ type: 'galleryImage' }] }),
    defineField({ name: 'bookingEmail', title: 'Buchungs-E-Mail', type: 'string' }),
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string' }),
            defineField({ name: 'url', title: 'URL', type: 'url' }),
          ],
        },
      ],
    }),
  ],
});

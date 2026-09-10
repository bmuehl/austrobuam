import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'galleryImage',
  title: 'Galeriebild',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Titel', type: 'string' }),
    defineField({ name: 'image', title: 'Bild', type: 'image', options: { hotspot: true }, validation: (rule) => rule.required() }),
    defineField({ name: 'alt', title: 'Alternativtext', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'caption', title: 'Bildunterschrift', type: 'string' }),
    defineField({ name: 'featured', title: 'Hervorgehoben', type: 'boolean', initialValue: false }),
    defineField({ name: 'sortOrder', title: 'Sortierung', type: 'number', initialValue: 100 }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'caption', media: 'image' },
  },
});

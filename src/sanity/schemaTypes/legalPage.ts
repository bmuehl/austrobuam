import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'legalPage',
  title: 'Rechtliche Seite',
  type: 'document',
  fields: [
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'title', title: 'Titel', type: 'string', validation: (rule) => rule.required() }),
    defineField({
      name: 'body',
      title: 'Inhalt',
      type: 'array',
      of: [{ type: 'block' }],
    }),
  ],
});

import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'bandMember',
  title: 'Bandmitglied',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'role', title: 'Instrument/Rolle', type: 'string' }),
    defineField({ name: 'bio', title: 'Biografie', type: 'text', rows: 5 }),
    defineField({ name: 'portrait', title: 'Portrait', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'sortOrder', title: 'Sortierung', type: 'number', initialValue: 100 }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'role', media: 'portrait' },
  },
});

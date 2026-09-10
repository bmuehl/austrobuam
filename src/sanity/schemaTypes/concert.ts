import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'concert',
  title: 'Auftritt',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Titel', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'venue', title: 'Ort/Location', type: 'string' }),
    defineField({ name: 'startsAt', title: 'Datum und Uhrzeit', type: 'datetime', validation: (rule) => rule.required() }),
    defineField({ name: 'address', title: 'Adresse', type: 'string' }),
    defineField({ name: 'infoUrl', title: 'Info/Tickets URL', type: 'url' }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Geplant', value: 'scheduled' },
          { title: 'Abgesagt', value: 'cancelled' },
          { title: 'Ausverkauft', value: 'soldOut' },
        ],
      },
      initialValue: 'scheduled',
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'venue' },
  },
});

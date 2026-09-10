import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'concert',
  title: 'Auftritt',
  type: 'document',
  initialValue: { postalAddress: { country: 'Österreich' } },
  fields: [
    defineField({ name: 'title', title: 'Titel', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'venue', title: 'Ort/Location', type: 'string' }),
    defineField({ name: 'startsAt', title: 'Datum und Uhrzeit', type: 'datetime', validation: (rule) => rule.required() }),
    defineField({
      name: 'endsAt', title: 'Ende (optional)', type: 'datetime',
      validation: (rule) => rule.custom((value, context) => {
        const start = context.document?.startsAt;
        return !value || typeof start !== 'string' || new Date(value) > new Date(start)
          ? true : 'Das Ende muss nach dem Beginn liegen.';
      }),
    }),
    defineField({
      name: 'postalAddress', title: 'Adresse', type: 'object',
      initialValue: { country: 'Österreich' },
      fields: [
        defineField({ name: 'street', title: 'Straße und Hausnummer', type: 'string' }),
        defineField({ name: 'postalCode', title: 'Postleitzahl', type: 'string' }),
        defineField({ name: 'city', title: 'Ort', type: 'string' }),
        defineField({ name: 'country', title: 'Land', type: 'string', initialValue: 'Österreich' }),
      ],
    }),
    defineField({
      // Retain the legacy schema field to avoid unknown-field warnings on existing documents.
      name: 'address', type: 'string',
      hidden: true,
      readOnly: true,
    }),
    defineField({
      name: 'poster', title: 'Plakat', type: 'image',
      // Keep existing values recognized without exposing a separate description field.
      fields: [defineField({ name: 'alt', type: 'string', hidden: true, readOnly: true })],
    }),
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
    select: { title: 'title', subtitle: 'venue', media: 'poster' },
  },
});

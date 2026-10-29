import { boolean, pgTable, text } from 'drizzle-orm/pg-core';

/**
 * Reference data shared by search, booking and the vet directory. Rows come from the labelled
 * training seed (is_training_data) and never carry any trust signal.
 */
export const neighbourhoods = pgTable('neighbourhoods', {
  id: text('id').primaryKey(),
  nameEn: text('name_en').notNull(),
  nameBn: text('name_bn').notNull(),
  isTrainingData: boolean('is_training_data').notNull().default(true),
});

export const vetClinics = pgTable('vet_clinics', {
  id: text('id').primaryKey(),
  neighbourhoodId: text('neighbourhood_id')
    .notNull()
    .references(() => neighbourhoods.id),
  nameEn: text('name_en').notNull(),
  nameBn: text('name_bn').notNull(),
  addressEn: text('address_en').notNull(),
  addressBn: text('address_bn').notNull(),
  phone: text('phone').notNull(),
  hoursEn: text('hours_en').notNull(),
  hoursBn: text('hours_bn').notNull(),
  species: text('species').array().notNull(),
  isTrainingData: boolean('is_training_data').notNull().default(true),
});

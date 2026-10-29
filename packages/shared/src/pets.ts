/**
 * Pet profiles and the structured care plan (FR-6, DR-4). One definition shared by the API (validation)
 * and the web form (options), so a rule is written once. Dogs and cats only (PRD §5).
 */
import { z } from 'zod';

export const SPECIES = ['dog', 'cat'] as const;
export const SEX = ['male', 'female', 'unknown'] as const;
export const VACCINATION = ['up_to_date', 'not_up_to_date', 'not_known', 'not_applicable'] as const;
export const ENERGY = ['calm', 'moderate', 'high'] as const;
export const GOOD_WITH = ['dogs', 'cats', 'children', 'strangers'] as const;
export const DIET_TYPES = [
  'low-carb-kibble',
  'dry',
  'wet',
  'raw',
  'home-cooked',
  'mixed',
  'other',
] as const;
export const DOG_OUTDOOR = ['indoor_only', 'yard', 'garden'] as const;
export const LITTER_BOX = ['covered', 'open', 'any'] as const;
export const INDOOR_OUTDOOR = ['indoor', 'outdoor', 'both'] as const;
export const CAT_COMPANY = ['single', 'multi_ok'] as const;

export const MAX_PHOTOS = 5;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

const text = (max: number) => z.string().trim().max(max);
const requiredText = (max: number) => z.string().trim().min(1).max(max);
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use a time such as 08:00');

export const medicationSchema = z.strictObject({
  name: requiredText(80),
  dose: requiredText(60),
  schedule: z.array(time).min(1).max(6),
  notes: text(300).optional(),
});

export const carePlanSchema = z.strictObject({
  conditions: z
    .array(z.strictObject({ name: requiredText(80), notes: text(300).optional() }))
    .max(10)
    .default([]),
  medications: z.array(medicationSchema).max(10).default([]),
  allergies: z.array(requiredText(60)).max(10).default([]),
  anxiety: z
    .strictObject({ triggers: text(500), comfort: text(500) })
    .nullable()
    .default(null),
  diet: z
    .strictObject({
      type: z.enum(DIET_TYPES),
      brand: text(80).optional(),
      schedule: text(120).optional(),
      treats: text(200).optional(),
      restrictions: z.array(requiredText(60)).max(10).default([]),
      notes: text(300).optional(),
    })
    .nullable()
    .default(null),
  senior: z.boolean().default(false),
  extraAttention: z.boolean().default(false),
  instructions: text(1000).default(''),
  vet: z
    .strictObject({
      name: requiredText(80),
      clinic: text(80).optional(),
      phone: text(30).optional(),
    })
    .nullable()
    .default(null),
});
export type CarePlan = z.infer<typeof carePlanSchema>;

export const emptyCarePlan = (): CarePlan => carePlanSchema.parse({});

export const behaviourSchema = z.strictObject({
  energy: z.enum(ENERGY).default('moderate'),
  goodWith: z.array(z.enum(GOOD_WITH)).default([]),
  triggers: text(500).default(''),
  notes: text(500).default(''),
});

export const dogDetailsSchema = z.strictObject({
  walksPerDay: z.number().int().min(0).max(6),
  outdoorAccess: z.enum(DOG_OUTDOOR),
});
export const catDetailsSchema = z.strictObject({
  litterBox: z.enum(LITTER_BOX),
  indoorOutdoor: z.enum(INDOOR_OUTDOOR),
  company: z.enum(CAT_COMPANY),
});

export const petInputSchema = z
  .strictObject({
    name: requiredText(60),
    species: z.enum(SPECIES),
    breed: requiredText(80),
    ageYears: z.number().int().min(0).max(30),
    weightKg: z.number().min(0.1).max(100),
    sex: z.enum(SEX),
    neutered: z.boolean(),
    vaccination: z.enum(VACCINATION),
    behaviour: behaviourSchema.default(() => behaviourSchema.parse({})),
    dogDetails: dogDetailsSchema.nullable().default(null),
    catDetails: catDetailsSchema.nullable().default(null),
    carePlan: carePlanSchema.default(() => emptyCarePlan()),
  })
  .superRefine((pet, ctx) => {
    if (pet.species === 'cat' && pet.dogDetails)
      ctx.addIssue({
        code: 'custom',
        path: ['dogDetails'],
        message: 'Dog details do not apply to a cat',
      });
    if (pet.species === 'dog' && pet.catDetails)
      ctx.addIssue({
        code: 'custom',
        path: ['catDetails'],
        message: 'Cat details do not apply to a dog',
      });
  });
export type PetInput = z.infer<typeof petInputSchema>;

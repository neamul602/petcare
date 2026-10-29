CREATE TABLE "neighbourhoods" (
	"id" text PRIMARY KEY NOT NULL,
	"name_en" text NOT NULL,
	"name_bn" text NOT NULL,
	"is_training_data" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vet_clinics" (
	"id" text PRIMARY KEY NOT NULL,
	"neighbourhood_id" text NOT NULL,
	"name_en" text NOT NULL,
	"name_bn" text NOT NULL,
	"address_en" text NOT NULL,
	"address_bn" text NOT NULL,
	"phone" text NOT NULL,
	"hours_en" text NOT NULL,
	"hours_bn" text NOT NULL,
	"species" text[] NOT NULL,
	"is_training_data" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "vet_clinics" ADD CONSTRAINT "vet_clinics_neighbourhood_id_neighbourhoods_id_fk" FOREIGN KEY ("neighbourhood_id") REFERENCES "public"."neighbourhoods"("id") ON DELETE no action ON UPDATE no action;
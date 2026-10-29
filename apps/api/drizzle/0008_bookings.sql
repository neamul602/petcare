CREATE TABLE "bookings" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"pet_id" text NOT NULL,
	"pet_snapshot" jsonb NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"nights" integer NOT NULL,
	"price_per_night_poisha" integer NOT NULL,
	"total_poisha" integer NOT NULL,
	"payment_method" text NOT NULL,
	"care_plan" jsonb NOT NULL,
	"instructions" text DEFAULT '' NOT NULL,
	"state" text NOT NULL,
	"confirmation_deadline" timestamp with time zone,
	"decline_reason" text,
	"submission_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bookings_owner_key" UNIQUE("owner_id","submission_key")
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE no action ON UPDATE no action;
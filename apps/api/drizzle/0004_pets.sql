CREATE TABLE "care_history" (
	"id" text PRIMARY KEY NOT NULL,
	"pet_id" text NOT NULL,
	"booking_id" text,
	"provider_id" text,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"outcome" text NOT NULL,
	"decline_reason" text,
	"care_plan_snapshot" jsonb NOT NULL,
	"review_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pet_photos" (
	"id" text PRIMARY KEY NOT NULL,
	"pet_id" text NOT NULL,
	"storage_id" text NOT NULL,
	"content_type" text NOT NULL,
	"size" integer NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pets" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"name" text NOT NULL,
	"species" text NOT NULL,
	"breed" text NOT NULL,
	"age_years" integer NOT NULL,
	"weight_kg" double precision NOT NULL,
	"sex" text NOT NULL,
	"neutered" boolean NOT NULL,
	"vaccination" text NOT NULL,
	"behaviour" jsonb NOT NULL,
	"dog_details" jsonb,
	"cat_details" jsonb,
	"care_plan" jsonb NOT NULL,
	"archived_at" timestamp with time zone,
	"is_training_data" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "care_history" ADD CONSTRAINT "care_history_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pet_photos" ADD CONSTRAINT "pet_photos_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pets" ADD CONSTRAINT "pets_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
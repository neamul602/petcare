CREATE TABLE "provider_status_events" (
	"id" text PRIMARY KEY NOT NULL,
	"provider_id" text NOT NULL,
	"kind" text NOT NULL,
	"from_value" text,
	"to_value" text NOT NULL,
	"reason" text NOT NULL,
	"admin_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "providers" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"slug" text NOT NULL,
	"name_en" text NOT NULL,
	"name_bn" text NOT NULL,
	"tier" text NOT NULL,
	"status" text DEFAULT 'applied' NOT NULL,
	"neighbourhood_id" text NOT NULL,
	"species" text[] NOT NULL,
	"capacity_small" integer DEFAULT 0 NOT NULL,
	"price_per_night_poisha" integer,
	"capabilities" text[] DEFAULT '{}' NOT NULL,
	"experience_en" text DEFAULT '' NOT NULL,
	"experience_bn" text DEFAULT '' NOT NULL,
	"is_training_data" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "providers_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "providers_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "provider_status_events" ADD CONSTRAINT "provider_status_events_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "providers" ADD CONSTRAINT "providers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "providers" ADD CONSTRAINT "providers_neighbourhood_id_neighbourhoods_id_fk" FOREIGN KEY ("neighbourhood_id") REFERENCES "public"."neighbourhoods"("id") ON DELETE no action ON UPDATE no action;
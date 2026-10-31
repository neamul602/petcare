CREATE TABLE "defection_signals" (
	"id" text PRIMARY KEY NOT NULL,
	"provider_id" text NOT NULL,
	"source_type" text NOT NULL,
	"source_id" text,
	"note" text DEFAULT '' NOT NULL,
	"by" text NOT NULL,
	"at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "provider_outreach" (
	"id" text PRIMARY KEY NOT NULL,
	"provider_id" text NOT NULL,
	"flag" text NOT NULL,
	"outreach" text NOT NULL,
	"outcome" text NOT NULL,
	"by" text NOT NULL,
	"at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "defection_signals" ADD CONSTRAINT "defection_signals_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_outreach" ADD CONSTRAINT "provider_outreach_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;
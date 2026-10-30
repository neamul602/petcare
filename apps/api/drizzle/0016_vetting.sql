CREATE TABLE "vetting_appeals" (
	"id" text PRIMARY KEY NOT NULL,
	"provider_id" text NOT NULL,
	"note" text NOT NULL,
	"outcome" text DEFAULT 'pending' NOT NULL,
	"recorded_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vetting_records" (
	"provider_id" text PRIMARY KEY NOT NULL,
	"identity_done" boolean DEFAULT false NOT NULL,
	"address_done" boolean DEFAULT false NOT NULL,
	"capability_done" boolean DEFAULT false NOT NULL,
	"references_note" text DEFAULT '' NOT NULL,
	"outreach_note" text DEFAULT '' NOT NULL,
	"artifacts" text[] DEFAULT '{}' NOT NULL,
	"awaiting_info" boolean DEFAULT false NOT NULL,
	"info_request" text DEFAULT '' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "vetting_appeals" ADD CONSTRAINT "vetting_appeals_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vetting_records" ADD CONSTRAINT "vetting_records_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;
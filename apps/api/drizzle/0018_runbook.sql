CREATE TABLE "acute_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"language" text NOT NULL,
	"text" text NOT NULL,
	"sent_by" text NOT NULL,
	"sent_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "acute_post_mortems" (
	"event_id" text PRIMARY KEY NOT NULL,
	"timeline_accuracy" text NOT NULL,
	"roles" text NOT NULL,
	"owner_communication" text NOT NULL,
	"directory_use" text NOT NULL,
	"gaps" text NOT NULL,
	"lessons" text NOT NULL,
	"written_by" text NOT NULL,
	"written_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "acute_steps" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"step" text NOT NULL,
	"status" text NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"by" text NOT NULL,
	"at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "acute_templates" (
	"language" text PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"updated_by" text NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "acute_events" ADD COLUMN "resolved_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "acute_messages" ADD CONSTRAINT "acute_messages_event_id_acute_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."acute_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "acute_post_mortems" ADD CONSTRAINT "acute_post_mortems_event_id_acute_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."acute_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "acute_steps" ADD CONSTRAINT "acute_steps_event_id_acute_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."acute_events"("id") ON DELETE no action ON UPDATE no action;
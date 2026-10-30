CREATE TABLE "acute_events" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"type" text NOT NULL,
	"severity" text NOT NULL,
	"observation" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"triggered_at" timestamp with time zone NOT NULL,
	"owner_notified_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "acute_events" ADD CONSTRAINT "acute_events_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;
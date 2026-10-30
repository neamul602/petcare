CREATE TABLE "book_again_timers" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"source_booking_id" text NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"submitted_at" timestamp with time zone,
	"booking_id" text
);
--> statement-breakpoint
ALTER TABLE "book_again_timers" ADD CONSTRAINT "book_again_timers_source_booking_id_bookings_id_fk" FOREIGN KEY ("source_booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;
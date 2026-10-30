CREATE TABLE "daily_updates" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_id" text NOT NULL,
	"day" date NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"care_log" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "update_photos" (
	"id" text PRIMARY KEY NOT NULL,
	"update_id" text NOT NULL,
	"storage_id" text NOT NULL,
	"content_type" text NOT NULL,
	"size" integer NOT NULL,
	"position" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "daily_updates" ADD CONSTRAINT "daily_updates_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "update_photos" ADD CONSTRAINT "update_photos_update_id_daily_updates_id_fk" FOREIGN KEY ("update_id") REFERENCES "public"."daily_updates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE FUNCTION daily_updates_immutable() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'daily updates cannot be changed after posting';
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TRIGGER daily_updates_no_change BEFORE UPDATE OR DELETE ON daily_updates
  FOR EACH ROW EXECUTE FUNCTION daily_updates_immutable();

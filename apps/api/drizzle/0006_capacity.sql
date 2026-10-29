CREATE TABLE "night_capacity" (
	"provider_id" text NOT NULL,
	"date" date NOT NULL,
	"capacity" integer,
	"booked" integer DEFAULT 0 NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "night_capacity_provider_id_date_pk" PRIMARY KEY("provider_id","date")
);
--> statement-breakpoint
CREATE TABLE "night_reservations" (
	"booking_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"date" date NOT NULL,
	"released_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "night_reservations_booking_id_date_pk" PRIMARY KEY("booking_id","date")
);
--> statement-breakpoint
ALTER TABLE "night_capacity" ADD CONSTRAINT "night_capacity_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "night_reservations" ADD CONSTRAINT "night_reservations_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "night_capacity" ADD CONSTRAINT "night_capacity_booked_not_negative" CHECK ("booked" >= 0);

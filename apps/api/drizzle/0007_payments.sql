CREATE TABLE "payments" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_id" text NOT NULL,
	"owner_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"method" text NOT NULL,
	"amount_poisha" integer NOT NULL,
	"status" text NOT NULL,
	"authorization_id" text,
	"gateway_payment_id" text,
	"gateway_ref" text,
	"last_error" text,
	"captured_at" timestamp with time zone,
	"released_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_booking_id_unique" UNIQUE("booking_id")
);

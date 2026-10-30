CREATE TABLE "payout_batches" (
	"id" text PRIMARY KEY NOT NULL,
	"run_key" text NOT NULL,
	"gateway_batch_id" text,
	"line_count" integer NOT NULL,
	"total_poisha" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payout_batches_run_key_unique" UNIQUE("run_key")
);
--> statement-breakpoint
CREATE TABLE "payouts" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"gross_poisha" integer NOT NULL,
	"commission_basis_points" integer NOT NULL,
	"commission_poisha" integer NOT NULL,
	"net_poisha" integer NOT NULL,
	"refunded_poisha" integer DEFAULT 0 NOT NULL,
	"status" text NOT NULL,
	"eligible_at" timestamp with time zone NOT NULL,
	"freeze_reason" text,
	"frozen_at" timestamp with time zone,
	"gateway_payout_id" text,
	"batch_id" text,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payouts_booking_id_unique" UNIQUE("booking_id")
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "commission_basis_points" integer;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "refunded_poisha" integer DEFAULT 0 NOT NULL;
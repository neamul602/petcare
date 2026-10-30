ALTER TABLE "reports" ADD COLUMN "resolution" jsonb;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "resolved_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "removed_reason" text;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "removed_by" text;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "removed_at" timestamp with time zone;
CREATE TABLE "event_log" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"actor" text NOT NULL,
	"action" text NOT NULL,
	"reason_code" text,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

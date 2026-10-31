CREATE TABLE "checkouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"payload" jsonb NOT NULL,
	"stripe_session_id" text,
	"order_id" uuid
);
--> statement-breakpoint
ALTER TABLE "checkouts" ENABLE ROW LEVEL SECURITY;

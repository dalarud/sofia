CREATE TABLE "accounts" (
	"number" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"order_id" uuid,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"qty" integer DEFAULT 1 NOT NULL,
	"waitlist" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" text PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"time" text NOT NULL,
	"kind" text NOT NULL,
	"label" text NOT NULL,
	"title" text NOT NULL,
	"place" text NOT NULL,
	"text" text NOT NULL,
	"price_ore" integer DEFAULT 0 NOT NULL,
	"seats" integer DEFAULT 0 NOT NULL,
	"booked" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"mime" text NOT NULL,
	"size" integer NOT NULL,
	"data" "bytea" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gift_cards" (
	"code" text PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"amount_ore" integer NOT NULL,
	"balance_ore" integer NOT NULL,
	"to_name" text,
	"from_name" text,
	"message" text,
	"order_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"number" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"date" date NOT NULL,
	"due_date" date NOT NULL,
	"customer" jsonb NOT NULL,
	"lines" jsonb NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"total_ore" integer NOT NULL,
	"vat_ore" integer NOT NULL,
	"status" text DEFAULT 'utkast' NOT NULL,
	"sent_at" timestamp with time zone,
	"paid_at" date,
	"paid_via" text,
	"pay_url" text,
	"verification_id" integer,
	"lead_id" integer
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"service" text NOT NULL,
	"pains" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"message" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'ny' NOT NULL,
	"note" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "login_attempts" (
	"ip" text NOT NULL,
	"at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"number" serial NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" text DEFAULT 'betald' NOT NULL,
	"stripe_session_id" text,
	"payment_intent_id" text,
	"customer_name" text DEFAULT '' NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"phone" text,
	"address" jsonb,
	"delivery" text DEFAULT 'ingen' NOT NULL,
	"items" jsonb NOT NULL,
	"total_ore" integer NOT NULL,
	"vat_ore" integer NOT NULL,
	"note" text,
	"handled_at" timestamp with time zone,
	"verification_id" integer
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"price_ore" integer NOT NULL,
	"vat_rate" integer DEFAULT 25 NOT NULL,
	"category" text DEFAULT 'dekor' NOT NULL,
	"text" text NOT NULL,
	"badge" text,
	"shape" text DEFAULT 'vas' NOT NULL,
	"glaze" text DEFAULT 'havre' NOT NULL,
	"stock" integer,
	"option" jsonb,
	"image_id" uuid,
	"sort" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "receipts" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" text DEFAULT 'att_gora' NOT NULL,
	"date" date,
	"supplier" text DEFAULT '' NOT NULL,
	"amount_ore" integer,
	"vat_rate" integer,
	"vat_ore" integer,
	"category" text,
	"paid_with" text DEFAULT 'foretag' NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"file_id" uuid,
	"verification_id" integer
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"short" text NOT NULL,
	"price_from" text NOT NULL,
	"body" text NOT NULL,
	"badge" text,
	"items" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"contact_label" text DEFAULT 'Boka' NOT NULL,
	"tone" text DEFAULT 'surface' NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stripe_events" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscribers" (
	"email" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"newsletter" boolean DEFAULT false NOT NULL,
	"source" text DEFAULT 'guide' NOT NULL,
	"unsubscribed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "texts" (
	"key" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"value" text NOT NULL,
	"multiline" boolean DEFAULT false NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tips" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "todos" (
	"id" serial PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"due" date,
	"done_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification_rows" (
	"id" serial PRIMARY KEY NOT NULL,
	"verification_id" integer NOT NULL,
	"account" integer NOT NULL,
	"debit_ore" integer DEFAULT 0 NOT NULL,
	"credit_ore" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"year" integer NOT NULL,
	"number" integer NOT NULL,
	"date" date NOT NULL,
	"text" text NOT NULL,
	"source" text NOT NULL,
	"source_ref" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"corrects_id" integer,
	"corrected_by_id" integer,
	"file_id" uuid
);
--> statement-breakpoint
CREATE UNIQUE INDEX "invoices_number_idx" ON "invoices" USING btree ("number");--> statement-breakpoint
CREATE INDEX "login_attempts_ip_idx" ON "login_attempts" USING btree ("ip","at");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_session_idx" ON "orders" USING btree ("stripe_session_id");--> statement-breakpoint
CREATE INDEX "verification_rows_ver_idx" ON "verification_rows" USING btree ("verification_id");--> statement-breakpoint
CREATE UNIQUE INDEX "verifications_year_number_idx" ON "verifications" USING btree ("year","number");--> statement-breakpoint
CREATE INDEX "verifications_date_idx" ON "verifications" USING btree ("date");
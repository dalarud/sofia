ALTER TABLE "invoices" ADD COLUMN "rut_ore" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "rut_paid_ore" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
INSERT INTO "accounts" ("number", "name") VALUES (1513, 'Kundfordringar – delad faktura (rutavdrag)') ON CONFLICT DO NOTHING;

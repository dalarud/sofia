import {
  pgTable, text, integer, serial, boolean, timestamp, date, jsonb, uuid, uniqueIndex, index, customType,
} from "drizzle-orm/pg-core";

// Alla belopp lagras i öre (heltal) för att undvika avrundningsfel.

const bytea = customType<{ data: Buffer; driverData: Buffer }>({ dataType: () => "bytea" });

/* ---------------------------------------------------------------- Innehåll */

/** Inställningar och företagsuppgifter, en rad per nyckel. */
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
});

/** Redigerbara texter på hemsidan, till exempel hero.title. */
export const texts = pgTable("texts", {
  key: text("key").primaryKey(),
  label: text("label").notNull(),
  value: text("value").notNull(),
  multiline: boolean("multiline").notNull().default(false),
  sort: integer("sort").notNull().default(0),
});

export type ServiceItem = { label: string; price: string };
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  short: text("short").notNull(),
  priceFrom: text("price_from").notNull(),
  body: text("body").notNull(),
  badge: text("badge"),
  items: jsonb("items").$type<ServiceItem[]>().notNull().default([]),
  contactLabel: text("contact_label").notNull().default("Boka"),
  tone: text("tone").notNull().default("surface"),
  sort: integer("sort").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

export type ProductOption = { id: string; label: string; priceOre: number };
export const products = pgTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  priceOre: integer("price_ore").notNull(),
  vatRate: integer("vat_rate").notNull().default(25),
  category: text("category").notNull().default("dekor"),
  text: text("text").notNull(),
  badge: text("badge"),
  shape: text("shape").notNull().default("vas"),
  glaze: text("glaze").notNull().default("havre"),
  stock: integer("stock"),
  option: jsonb("option").$type<ProductOption | null>(),
  imageId: uuid("image_id"),
  sort: integer("sort").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

export const events = pgTable("events", {
  id: text("id").primaryKey(),
  date: date("date").notNull(),
  time: text("time").notNull(),
  kind: text("kind").notNull(), // kurs | workshop | oppen
  label: text("label").notNull(),
  title: text("title").notNull(),
  place: text("place").notNull(),
  text: text("text").notNull(),
  priceOre: integer("price_ore").notNull().default(0),
  seats: integer("seats").notNull().default(0),
  booked: integer("booked").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

export const tips = pgTable("tips", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  sort: integer("sort").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

/* ---------------------------------------------------------------- Försäljning */

export type OrderItem = { id: string; name: string; qty: number; unitOre: number; vatRate: number; kind: "product" | "event" | "gift" | "shipping" | "invoice" };
export type Address = { line1?: string; line2?: string; postalCode?: string; city?: string; country?: string };

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  number: serial("number").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  status: text("status").notNull().default("betald"), // betald | skickad | klar | avbruten
  stripeSessionId: text("stripe_session_id"),
  paymentIntentId: text("payment_intent_id"),
  customerName: text("customer_name").notNull().default(""),
  email: text("email").notNull().default(""),
  phone: text("phone"),
  address: jsonb("address").$type<Address | null>(),
  delivery: text("delivery").notNull().default("ingen"), // ingen | post | hamtning
  items: jsonb("items").$type<OrderItem[]>().notNull(),
  totalOre: integer("total_ore").notNull(),
  vatOre: integer("vat_ore").notNull(),
  note: text("note"),
  handledAt: timestamp("handled_at", { withTimezone: true }),
  verificationId: integer("verification_id"),
}, (t) => [uniqueIndex("orders_session_idx").on(t.stripeSessionId)]);

export const eventBookings = pgTable("event_bookings", {
  id: serial("id").primaryKey(),
  eventId: text("event_id").notNull(),
  orderId: uuid("order_id"),
  name: text("name").notNull(),
  email: text("email").notNull(),
  qty: integer("qty").notNull().default(1),
  waitlist: boolean("waitlist").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const giftCards = pgTable("gift_cards", {
  code: text("code").primaryKey(),
  kind: text("kind").notNull(),
  amountOre: integer("amount_ore").notNull(),
  balanceOre: integer("balance_ore").notNull(),
  toName: text("to_name"),
  fromName: text("from_name"),
  message: text("message"),
  orderId: uuid("order_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: date("expires_at").notNull(),
});

/** Varukorgen sparas här när kunden går till Stripe, och läses när betalningen är klar. */
export const checkouts = pgTable("checkouts", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  payload: jsonb("payload").notNull(),
  stripeSessionId: text("stripe_session_id"),
  orderId: uuid("order_id"),
});

/* ---------------------------------------------------------------- Kunder och förfrågningar */

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  service: text("service").notNull(),
  pains: jsonb("pains").$type<string[]>().notNull().default([]),
  message: text("message").notNull().default(""),
  status: text("status").notNull().default("ny"), // ny | kontaktad | klar
  note: text("note").notNull().default(""),
});

export const subscribers = pgTable("subscribers", {
  email: text("email").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  newsletter: boolean("newsletter").notNull().default(false),
  source: text("source").notNull().default("guide"),
  unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
});

/* ---------------------------------------------------------------- Fakturor och kvitton */

export type InvoiceLine = { text: string; qty: number; unitOre: number; vatRate: number };
export type InvoiceCustomer = { name: string; email?: string; address?: string; orgNr?: string };

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  number: integer("number"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  date: date("date").notNull(),
  dueDate: date("due_date").notNull(),
  customer: jsonb("customer").$type<InvoiceCustomer>().notNull(),
  lines: jsonb("lines").$type<InvoiceLine[]>().notNull(),
  note: text("note").notNull().default(""),
  totalOre: integer("total_ore").notNull(),
  vatOre: integer("vat_ore").notNull(),
  status: text("status").notNull().default("utkast"), // utkast | skickad | betald | krediterad
  sentAt: timestamp("sent_at", { withTimezone: true }),
  paidAt: date("paid_at"),
  paidVia: text("paid_via"),
  payUrl: text("pay_url"),
  verificationId: integer("verification_id"),
  leadId: integer("lead_id"),
}, (t) => [uniqueIndex("invoices_number_idx").on(t.number)]);

export const files = pgTable("files", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  mime: text("mime").notNull(),
  size: integer("size").notNull(),
  data: bytea("data").notNull(),
  /** Produktbilder och porträtt får visas på hemsidan. Kvitton är aldrig publika. */
  isPublic: boolean("is_public").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const receipts = pgTable("receipts", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  status: text("status").notNull().default("att_gora"), // att_gora | bokford
  date: date("date"),
  supplier: text("supplier").notNull().default(""),
  amountOre: integer("amount_ore"),
  vatRate: integer("vat_rate"),
  vatOre: integer("vat_ore"),
  category: text("category"),
  paidWith: text("paid_with").notNull().default("foretag"), // foretag | privat
  note: text("note").notNull().default(""),
  fileId: uuid("file_id"),
  verificationId: integer("verification_id"),
});

/* ---------------------------------------------------------------- Bokföring */

export const accounts = pgTable("accounts", {
  number: integer("number").primaryKey(),
  name: text("name").notNull(),
});

/** Verifikationer kan aldrig ändras eller raderas, bara rättas med en ny verifikation. */
export const verifications = pgTable("verifications", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  number: integer("number").notNull(),
  date: date("date").notNull(),
  text: text("text").notNull(),
  source: text("source").notNull(), // order | faktura | kvitto | stripe | manuell | rattelse
  sourceRef: text("source_ref"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  correctsId: integer("corrects_id"),
  correctedById: integer("corrected_by_id"),
  fileId: uuid("file_id"),
}, (t) => [uniqueIndex("verifications_year_number_idx").on(t.year, t.number), index("verifications_date_idx").on(t.date)]);

export const verificationRows = pgTable("verification_rows", {
  id: serial("id").primaryKey(),
  verificationId: integer("verification_id").notNull(),
  account: integer("account").notNull(),
  debitOre: integer("debit_ore").notNull().default(0),
  creditOre: integer("credit_ore").notNull().default(0),
}, (t) => [index("verification_rows_ver_idx").on(t.verificationId)]);

/* ---------------------------------------------------------------- Hjälp för vardagen */

/** Egna att göra-punkter och avbockade påminnelser. */
export const todos = pgTable("todos", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  due: date("due"),
  doneAt: timestamp("done_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const stripeEvents = pgTable("stripe_events", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
});

export const loginAttempts = pgTable("login_attempts", {
  ip: text("ip").notNull(),
  at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("login_attempts_ip_idx").on(t.ip, t.at)]);


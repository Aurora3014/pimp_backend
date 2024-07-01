import {
  customType,
  pgTable,
  timestamp,
  varchar,
  bigint,
  boolean,
  jsonb,
  pgEnum,
  integer,
  text,
  primaryKey,
  bigserial,
  serial,
} from "drizzle-orm/pg-core";

interface Socials {
  twitter?: string;
  telegram?: string;
  website?: string;
}

export const users = pgTable("users", {
  id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
  wallet: text("wallet").unique().notNull(),
  username: varchar("username", { length: 20 }).unique().notNull(),
  pfpUrl: varchar("pfp_url", { length: 256 }),
  bio: varchar("bio", { length: 256 }),
  isBanned: boolean("is_banned").default(false).notNull(),
  referrer: text("referrer"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const tokens = pgTable("tokens", {
  address: text("address").primaryKey(),
  name: varchar("name", { length: 20 }).notNull(),
  symbol: varchar("symbol", { length: 10 }).notNull(),
  description: varchar("description", { length: 256 }),
  imageUri: varchar("image_uri", { length: 256 }).notNull(),
  metadataUri: varchar("metadata_uri", { length: 256 }),
  socials: jsonb("socials").$type<Socials>().default({}),
  isNsfw: boolean("is_nsfw").default(false).notNull(),
  isPremium: boolean("is_premium").default(false).notNull(),
  bondingCurve: text("bonding_curve").notNull(),
  creator: text("creator")
    // .references(() => users.wallet, {
    //   onDelete: "set null",
    // })
    
    .notNull(),
  tokenReserve: bigint("token_reserve", { mode: "bigint" }).notNull(),
  solReserve: bigint("sol_reserve", { mode: "bigint" }).notNull(),
  marketCap: bigint("market_cap", { mode: "bigint" }).notNull(),
  kothAt: timestamp("koth_at", { withTimezone: true }),
  maxBuyWallet: bigint("max_buy_wallet", { mode: "bigint" }).notNull(),
  startTimeUnix: integer("start_time_unix").notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  customTag1: boolean("custom_tag_1").default(false).notNull(),
  lastBuyAt: timestamp("last_buy_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const seededTokens = pgTable("seeded_tokens", {
  tokenAddress: text("token_address")
    .primaryKey()
    .references(() => tokens.address, {
      onDelete: "cascade",
    }),
  raydiumAmmId: text("raydium_amm_id").notNull(),
  createdTimestamp: timestamp("created_timestamp", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const tradeTypeEnum = pgEnum("trade_type", ["buy", "sell"]);

export const trades = pgTable("trades", {
  id: serial('id').notNull().primaryKey(),
  transactionSignature: varchar("transaction_signature", {
    length: 64,
  }).notNull(),
  user: text("user").notNull(),
  tokenAddress: text("token_address")
    .references(() => tokens.address, {
      onDelete: "cascade",
    })
    .notNull(),
  tradeType: tradeTypeEnum("trade_type").notNull(),
  amountIn: bigint("amount_in", { mode: "bigint" }).notNull(),
  amountOut: bigint("amount_out", { mode: "bigint" }).notNull(),
  solReserve: bigint("sol_reserve", { mode: "bigint" }).notNull(),
  tokenReserve: bigint("token_reserve", { mode: "bigint" }).notNull(),
  usdPerToken: bigint("tokens_per_sol", { mode: "bigint" }).notNull(),
  
  timestamp: timestamp("timestamp", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const tokenAth = pgTable("token_ath", {
  tokenAddress: text("token_address")
    .references(() => tokens.address, {
      onDelete: "cascade",
    })
    .unique()
    .notNull(),
  ath: integer("ath").notNull(),
  current: integer("current").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const stealthWallets = pgTable("stealth_wallets", {
  wallet: text("wallet").unique().notNull(),
  partner: text("partner").notNull(),
});
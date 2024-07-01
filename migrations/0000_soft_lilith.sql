DO $$ BEGIN
 CREATE TYPE "public"."trade_type" AS ENUM('buy', 'sell');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "seeded_tokens" (
	"token_address" text PRIMARY KEY NOT NULL,
	"created_timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tokens" (
	"address" text PRIMARY KEY NOT NULL,
	"name" varchar(20) NOT NULL,
	"symbol" varchar(10) NOT NULL,
	"description" varchar(256),
	"image_uri" varchar(256) NOT NULL,
	"metadata_uri" varchar(256),
	"socials" jsonb DEFAULT '{}'::jsonb,
	"is_nsfw" boolean DEFAULT false NOT NULL,
	"is_premium" boolean DEFAULT false NOT NULL,
	"bonding_curve" text NOT NULL,
	"creator" text NOT NULL,
	"token_reserve" bigint NOT NULL,
	"sol_reserve" bigint NOT NULL,
	"market_cap" bigint NOT NULL,
	"koth_at" timestamp with time zone,
	"max_buy_wallet" bigint NOT NULL,
	"start_time_unix" integer NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"custom_tag_1" boolean DEFAULT false NOT NULL,
	"last_buy_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "trades" (
	"transaction_signature" varchar(64) PRIMARY KEY NOT NULL,
	"user" text NOT NULL,
	"token_address" text NOT NULL,
	"trade_type" "trade_type" NOT NULL,
	"amount_in" bigint NOT NULL,
	"amount_out" bigint NOT NULL,
	"sol_reserve" bigint NOT NULL,
	"token_reserve" bigint NOT NULL,
	"tokens_per_sol" bigint NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"wallet" text NOT NULL,
	"username" varchar(20) NOT NULL,
	"pfp_url" varchar(256),
	"bio" varchar(256),
	"is_banned" boolean DEFAULT false NOT NULL,
	"referrer" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_wallet_unique" UNIQUE("wallet"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "seeded_tokens" ADD CONSTRAINT "seeded_tokens_token_address_tokens_address_fk" FOREIGN KEY ("token_address") REFERENCES "public"."tokens"("address") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trades" ADD CONSTRAINT "trades_token_address_tokens_address_fk" FOREIGN KEY ("token_address") REFERENCES "public"."tokens"("address") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

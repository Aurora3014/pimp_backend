CREATE TABLE IF NOT EXISTS "stealth_wallets" (
	"wallet" text NOT NULL,
	"partner" text NOT NULL,
	CONSTRAINT "stealth_wallets_wallet_unique" UNIQUE("wallet")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "token_ath" (
	"token_address" text NOT NULL,
	"ath" integer NOT NULL,
	"current" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "token_ath_token_address_unique" UNIQUE("token_address")
);
--> statement-breakpoint
/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'trades'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "trades" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
ALTER TABLE "trades" ADD COLUMN "id" serial NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "token_ath" ADD CONSTRAINT "token_ath_token_address_tokens_address_fk" FOREIGN KEY ("token_address") REFERENCES "public"."tokens"("address") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

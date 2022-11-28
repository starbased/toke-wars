-- DropForeignKey
ALTER TABLE "dao_addresses" DROP CONSTRAINT "dao_addresses_daos_name_fk";

-- CreateTable
CREATE TABLE "revenue_tokens" (
    "address" BYTEA NOT NULL,
    "symbol" TEXT NOT NULL,
    "gecko_id" TEXT NOT NULL,

    CONSTRAINT "revenue_tokens_pk" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "revenue_ignored_transactions" (
    "logIndex" INTEGER NOT NULL,
    "transactionHash" BYTEA NOT NULL,

    CONSTRAINT "revenue_ignored_transactions_pk" PRIMARY KEY ("transactionHash","logIndex")
);

-- AddForeignKey
ALTER TABLE "dao_addresses" ADD CONSTRAINT "dao_addresses_daos_name_fk" FOREIGN KEY ("dao_name") REFERENCES "daos"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "dao_addresses" (
    "dao_name" VARCHAR NOT NULL,
    "address" BYTEA NOT NULL,

    CONSTRAINT "dao_addresses_pk" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "daos" (
    "name" VARCHAR NOT NULL,
    "stage" INTEGER NOT NULL,
    "coin" VARCHAR NOT NULL DEFAULT E'TBD',
    "gecko_id" VARCHAR NOT NULL DEFAULT E'something',

    CONSTRAINT "daos_pk" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "reactors" (
    "symbol" VARCHAR NOT NULL,
    "coingecko_id" VARCHAR,
    "is_stablecoin" BOOLEAN DEFAULT false,
    "address" BYTEA NOT NULL,

    CONSTRAINT "reactors_pk" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "blocks" (
    "number" INTEGER NOT NULL,
    "timestamp" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "blocks_pk" PRIMARY KEY ("number")
);

-- CreateTable
CREATE TABLE "cycle_hashes" (
    "cycle" INTEGER NOT NULL,
    "hash" VARCHAR NOT NULL,

    CONSTRAINT "cycle_hashes_pk" PRIMARY KEY ("cycle")
);

-- CreateTable
CREATE TABLE "erc20_transfers" (
    "blockNumber" INTEGER NOT NULL,
    "transactionHash" BYTEA NOT NULL,
    "transactionIndex" INTEGER NOT NULL,
    "address" BYTEA NOT NULL,
    "to" BYTEA NOT NULL,
    "from" BYTEA NOT NULL,
    "value" DECIMAL NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,

    CONSTRAINT "erc20_transfers_pk" PRIMARY KEY ("transactionHash","logIndex")
);

-- CreateTable
CREATE TABLE "toke_staking_deposits" (
    "blockNumber" INTEGER NOT NULL,
    "transactionHash" BYTEA NOT NULL,
    "transactionIndex" INTEGER NOT NULL,
    "address" BYTEA NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,
    "account" BYTEA NOT NULL,
    "scheduleIx" DECIMAL NOT NULL,
    "amount" DECIMAL NOT NULL,

    CONSTRAINT "toke_staking_deposit_pk" PRIMARY KEY ("transactionHash","logIndex")
);

-- CreateTable
CREATE TABLE "toke_staking_withdraw_completed" (
    "blockNumber" INTEGER NOT NULL,
    "transactionHash" BYTEA NOT NULL,
    "transactionIndex" INTEGER NOT NULL,
    "address" BYTEA NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,
    "account" BYTEA NOT NULL,
    "scheduleIdx" DECIMAL NOT NULL,
    "amount" DECIMAL NOT NULL,

    CONSTRAINT "toke_staking_withdraw_completed_pk" PRIMARY KEY ("transactionHash","logIndex")
);

-- CreateIndex
CREATE UNIQUE INDEX "dao_addresses_address_uindex" ON "dao_addresses"("address");

-- CreateIndex
CREATE UNIQUE INDEX "reactors_address_b_uindex" ON "reactors"("address");

-- CreateIndex
CREATE INDEX "erc20_transfers_address_index" ON "erc20_transfers"("address");

-- CreateIndex
CREATE INDEX "toke_staking_deposit_address_index" ON "erc20_transfers"("address");

-- AddForeignKey
ALTER TABLE "dao_addresses" ADD CONSTRAINT "dao_addresses_daos_name_fk" FOREIGN KEY ("dao_name") REFERENCES "daos"("name") ON DELETE CASCADE ON UPDATE NO ACTION;

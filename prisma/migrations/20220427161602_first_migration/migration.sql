-- CreateTable
CREATE TABLE "dao_addresses" (
    "address" VARCHAR NOT NULL,
    "dao_name" VARCHAR NOT NULL,

    CONSTRAINT "dao_addresses_pk" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "dao_transactions" (
    "id" SERIAL NOT NULL,
    "dao_address" VARCHAR NOT NULL,
    "value" DECIMAL NOT NULL,
    "transaction_hash" VARCHAR NOT NULL,
    "type" VARCHAR NOT NULL,
    "from" VARCHAR,
    "to" VARCHAR,
    "block_number" INTEGER NOT NULL,

    CONSTRAINT "dao_transactions_pk" PRIMARY KEY ("id")
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
CREATE TABLE "reactor_values" (
    "transaction_hash" VARCHAR NOT NULL,
    "contract_address" VARCHAR NOT NULL,
    "to" VARCHAR NOT NULL,
    "from" VARCHAR NOT NULL,
    "value" DECIMAL NOT NULL,
    "block_number" INTEGER NOT NULL,
    "id" SERIAL NOT NULL,

    CONSTRAINT "reactor_values_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reactors" (
    "address" VARCHAR NOT NULL,
    "symbol" VARCHAR NOT NULL,
    "coingecko_id" VARCHAR,
    "is_stablecoin" BOOLEAN DEFAULT false,

    CONSTRAINT "reactors_pk" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "blocks" (
    "number" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "blocks_pk" PRIMARY KEY ("number")
);

-- CreateTable
CREATE TABLE "cycle_hashes" (
    "cycle" INTEGER NOT NULL,
    "hash" VARCHAR NOT NULL,

    CONSTRAINT "cycle_hashes_pk" PRIMARY KEY ("cycle")
);

-- CreateIndex
CREATE UNIQUE INDEX "dao_addresses_address_uindex" ON "dao_addresses"("address");

-- CreateIndex
CREATE UNIQUE INDEX "dao_addresses_dao_name_address_uindex" ON "dao_addresses"("dao_name", "address");

-- CreateIndex
CREATE UNIQUE INDEX "dao_transactions_id_uindex" ON "dao_transactions"("id");

-- CreateIndex
CREATE INDEX "dao_transactions_dao_address_index" ON "dao_transactions"("dao_address");

-- CreateIndex
CREATE UNIQUE INDEX "daos_name_uindex" ON "daos"("name");

-- CreateIndex
CREATE INDEX "reactor_values_contract_address_index" ON "reactor_values"("contract_address");

-- CreateIndex
CREATE UNIQUE INDEX "reactors_address_uindex" ON "reactors"("address");

-- CreateIndex
CREATE UNIQUE INDEX "blocks_block_number_uindex" ON "blocks"("number");

-- CreateIndex
CREATE UNIQUE INDEX "cycle_hashes_cycle_uindex" ON "cycle_hashes"("cycle");

-- AddForeignKey
ALTER TABLE "dao_addresses" ADD CONSTRAINT "dao_addresses_daos_name_fk" FOREIGN KEY ("dao_name") REFERENCES "daos"("name") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "dao_transactions" ADD CONSTRAINT "dao_transactions_dao_addresses_address_fk" FOREIGN KEY ("dao_address") REFERENCES "dao_addresses"("address") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reactor_values" ADD CONSTRAINT "reactor_values_reactors_address_fk" FOREIGN KEY ("contract_address") REFERENCES "reactors"("address") ON DELETE NO ACTION ON UPDATE NO ACTION;

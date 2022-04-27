/*
  Warnings:

  - A unique constraint covering the columns `[type,block_number,transaction_hash,value]` on the table `dao_transactions` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "blocks_block_number_uindex";

-- DropIndex
DROP INDEX "cycle_hashes_cycle_uindex";

-- DropIndex
DROP INDEX "dao_addresses_address_uindex";

-- DropIndex
DROP INDEX "dao_transactions_id_uindex";

-- DropIndex
DROP INDEX "daos_name_uindex";

-- DropIndex
DROP INDEX "reactors_address_uindex";

-- CreateIndex
CREATE UNIQUE INDEX "dao_transactions_type_block_number_transaction_hash_value_uinde" ON "dao_transactions"("type", "block_number", "transaction_hash", "value");

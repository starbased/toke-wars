
delete from ipfs_rewards;

-- AlterTable
ALTER TABLE "ipfs_rewards" ADD COLUMN     "amount" DECIMAL NOT NULL,
ADD COLUMN     "cycle_total" DECIMAL NOT NULL,
ALTER COLUMN "data" SET DATA TYPE JSON;

-- CreateTable
CREATE TABLE "ipfs_rewards" (
    "address" BYTEA NOT NULL,
    "cycle" INTEGER NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "ipfs_rewards_pk" PRIMARY KEY ("cycle","address")
);

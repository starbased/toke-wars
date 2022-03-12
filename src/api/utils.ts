import { provider } from "../util/providers";

import untypedBlocks from "../cache/blocks.json";
const blocksCache: Record<string, number> = untypedBlocks;

(window as any).blocks = blocksCache;
export async function getBlockNumber(blockHash: string) {
  const cache = blocksCache[blockHash];
  if (cache) {
    return cache;
  }
  console.log("miss");
  const output = (await provider.getBlock(blockHash)).timestamp;
  (window as any).blocks = { ...(window as any).blocks, [blockHash]: output };
  return output;
}

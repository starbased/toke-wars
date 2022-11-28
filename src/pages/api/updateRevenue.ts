import ERC20 from "@/abi/ERC20.json";

import { addressToHex, getProvider, updateDbBlocks } from "@/utils";
import { prisma } from "utils/db";

import type { NextApiRequest, NextApiResponse } from "next";
import { load } from "utils/load";
import { ERC20__factory } from "@/typechain";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const tokens = (await prisma.revenueToken.findMany()).map((token) => ({
    ...token,
    address: addressToHex(token.address),
  }));

  for (const token of tokens) {
    const contract = ERC20__factory.connect(token.address, getProvider());

    await load(
      token.address,
      ERC20,
      "Transfer",
      prisma.erc20Transfer,
      contract.filters.Transfer(
        null,
        "0x8b4334d4812C530574Bd4F2763FcD22dE94A969B"
      )
    );
  }

  await updateDbBlocks();
  await res.revalidate("/revenue");

  res.status(200).json({});
}

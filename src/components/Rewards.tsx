import { RewardsHash__factory } from "../typechain";
import { providers } from "ethers";
import { useQuery } from "react-query";
import axios from "axios";
import knownCycleHashes from "../cache/cycleHashes.json";
import { useState } from "react";

import { UserInput } from "./RewardsUserInput";
import { Totals } from "./RewardsTotals";

import { Badge, Box } from "@chakra-ui/react";
import { Page } from "./Page";

export type CycleInfo = {
  payload: {
    cycle: number;
    amount: string;
  };
  summary: {
    breakdown: {
      description: string;
      amount: string;
    }[];
    cycleTotal: string;
  };
};

const contract = RewardsHash__factory.connect(
  "0x5ec3EC6A8aC774c7d53665ebc5DDf89145d02fB6",
  new providers.JsonRpcProvider(
    "https://mainnet.infura.io/v3/" + import.meta.env.VITE_INFURA_ID
  )
);

// @ts-ignore
window.contract = contract;

export function getCycleHash(cycle: number, enabled = true) {
  return {
    queryKey: ["cycleHash", cycle],
    queryFn: () => contract.cycleHashes(cycle),
    enabled,
    initialData: knownCycleHashes[cycle],
  };
}

export function getCycleInfo(
  address: string,
  cycle: number,
  cycleHash?: string[]
) {
  return {
    queryKey: ["cycleInfo", cycleHash, address],
    queryFn: async () => {
      if (!cycleHash) throw Error();

      try {
        const { data } = await axios.get<CycleInfo>(
          `https://ipfs.tokemaklabs.xyz/ipfs/${cycleHash[1]}/${address}.json`
        );

        if (cycle === 0) {
          data.payload.cycle = 0;
          data.summary = {
            cycleTotal: data.payload.amount,
            breakdown: [
              {
                description: "DeGenesis",
                amount: data.payload.amount,
              },
            ],
          };
        }

        return data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          return {
            payload: {
              cycle: cycle,
              amount: "0",
            },
            summary: {
              breakdown: [],
              cycleTotal: "0",
            },
          };
        }
        throw error;
      }
    },
    enabled: !!cycleHash && address !== "",
  };
}

export function Rewards() {
  const [address, setAddress] = useState("");

  const { data: latestCycle } = useQuery(
    "lastCycle",
    () => contract.latestCycleIndex(),
    { staleTime: 1000 * 60 * 60 } // 1 hour
  );

  return (
    <Page header="Rewards">
      <UserInput {...{ setAddress }} />
      <Box>
        {!latestCycle ? (
          <div>loading</div>
        ) : (
          <>
            {address !== "" ? (
              <>
                <Totals {...{ address, latestCycle }} />
                {/* <DetailedTable {...{ address, latestCycle }} /> */}
              </>
            ) : (
              <Badge>Enter an address to continue</Badge>
            )}
          </>
        )}
      </Box>
    </Page>
  );
}

// function DetailedTable({
//   latestCycle,
//   address,
// }: {
//   latestCycle: BigNumber;
//   address: string;
// }) {
//   const cycleArray = Array.from(
//     Array((latestCycle?.toNumber() || 0) + 1).keys()
//   );

//   return (
//     <>
//       <Heading>By Cycle</Heading>

//       <Box maxW="xl" borderWidth="1px" borderRadius="lg" shadow="md" p="6">
//         <Table variant="simple">
//           <Thead>
//             <Tr>
//               <Th>Cycle</Th>
//               <Th>Token</Th>
//               <Th isNumeric>Reward (TOKE)</Th>
//             </Tr>
//           </Thead>
//           <Tbody>
//             {latestCycle
//               ? cycleArray
//                   .reverse()
//                   .map((cycle) => (
//                     <Row cycle={cycle} key={cycle} address={address} />
//                   ))
//               : null}
//           </Tbody>

//           <Tfoot>
//             <Tr>
//               <Th>Name</Th>
//               <Th>Stage</Th>
//               <Th isNumeric>TOKE Holdings</Th>
//               <Th isNumeric>USD Value</Th>
//             </Tr>
//           </Tfoot>

//           <TableCaption>
//             Leaderboard tracks the DAOs with the top TOKE holdings
//           </TableCaption>
//         </Table>
//       </Box>
//     </>
//   );
// }

// function Row({ cycle, address }: { cycle: number; address: string }) {
//   const { data: cycleHash } = useQuery(getCycleHash(cycle));

//   const { data: cycleInfo, isLoading } = useQuery<CycleInfo, AxiosError>(
//     getCycleInfo(address, cycle, cycleHash)
//   );

//   if (isLoading) {
//     return null;
//   }

//   return (
//     <>
//       {cycleInfo?.summary.breakdown
//         .filter((info) => info.amount !== "0")
//         .map((info) => (
//           <Tr key={info.description}>
//             <Td>{cycle}</Td>
//             <Td>{info.description}</Td>
//             <Td>{formatEther(info.amount)}</Td>
//           </Tr>
//         ))}
//     </>
//   );
// }

import { formatDistanceStrict, getUnixTime, parseISO, set } from "date-fns";
import { provider } from "../util/providers";
import { useQuery } from "react-query";

function useGetBlock(date: Date, start = 2) {
  const time = getUnixTime(date);
  return useQuery(
    ["block", time],
    async () => {
      let end = await provider.getBlockNumber();

      while (start <= end) {
        let mid = Math.floor((start + end) / 2);

        const [block, previousBlock] = await Promise.all([
          await provider.getBlock(mid),
          await provider.getBlock(mid - 1),
        ]);

        if (previousBlock.timestamp < time && time <= block.timestamp) {
          return block;
        } else if (block.timestamp < time) {
          start = mid + 1;
        } else {
          end = mid - 1;
        }
      }
      throw Error("problem");
    },
    { retry: 0 }
  );
}

export function Test() {
  const date = parseISO("2020-01-01");
  const today = set(new Date(), {
    milliseconds: 0,
    seconds: 0,
    minutes: 0,
    hours: 0,
  });

  const { data: startBlock } = useGetBlock(date);
  const { data: currentBlock } = useGetBlock(today);

  if (!currentBlock || !startBlock) {
    return <div>loading</div>;
  }

  const days = parseInt(
    formatDistanceStrict(date, today, { unit: "day" }).split(" ")[0]
  );

  const blocks = currentBlock.number - startBlock.number;
  console.log(currentBlock);
  console.log(currentBlock.number - startBlock.number, days, blocks / days);

  return (
    <div>
      test{" "}
      {currentBlock ? (
        <>
          {currentBlock.number}{" "}
          {new Date(currentBlock.timestamp * 1000).toString()}
        </>
      ) : null}
    </div>
  );
}

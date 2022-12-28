import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { ManagerContract__factory } from "@/typechain";
import { TOKEMAK_MANAGER } from "@/constants";
import { getProvider } from "@/utils";
import { formatDuration, intervalToDuration } from "date-fns";
import { Page } from "components/Page";
import { useEffect, useState } from "react";
import { shortenAddress } from "utils/maths";
import Head from "next/head";

function average(numbers: number[]) {
  return numbers.reduce((a, b) => a + b, 0) / numbers.length;
}

function secondsToDuration(seconds: number) {
  return formatDuration(intervalToDuration({ start: 0, end: seconds * 1000 }), {
    zero: true,
    format: ["hours", "minutes", "seconds"],
  });
}

function Counter({ since }: { since: number }) {
  const [cycleDuration, setCycleDuration] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setCycleDuration(new Date().getTime() / 1000 - since),
      1000
    );
    return () => clearInterval(interval);
  }, [since]);

  return (
    <span>
      It has been {secondsToDuration(cycleDuration)} since the cycle started
      rolling over
    </span>
  );
}

export default function Wen({
  lastEvent,
  averageTimes,
  cycle,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  let totalAverage = average(averageTimes.map((obj) => obj.diff));
  let tenAverage = average(averageTimes.slice(0, 10).map((obj) => obj.diff));

  const inProgress = lastEvent.type === "CycleRolloverStarted";

  return (
    <>
      <Head>
        <title>Wen Cycle</title>
        <meta
          name="description"
          content="Information about how long tokemak cycles take"
        />
      </Head>

      <Page header="Wen Cycle Rollover Done??" className="items-center">
        {inProgress ? (
          <Counter since={lastEvent.timestamp} />
        ) : (
          <span className="text-4xl">It&apos;s done now</span>
        )}

        <h2 className="text-xl">Average time over all cycles</h2>
        {secondsToDuration(totalAverage)}
        <h2 className="text-xl">Average time over last 10 cycles</h2>
        {secondsToDuration(tenAverage)}

        <hr />
        <h2 className="text-xl">Previous Cycle Times</h2>
        <table className="styledTable">
          <thead>
            <tr>
              <th>Cycle</th>
              <th>Time (in hours)</th>
              <th>Start event</th>
              <th>End event</th>
            </tr>
          </thead>

          <tbody>
            {averageTimes.map((obj, i) => (
              <tr key={i}>
                <td>{cycle - i - 1}</td>
                <td>{secondsToDuration(obj.diff)}</td>
                <td>
                  {" "}
                  <a
                    href={`https://etherscan.io/tx/${obj.start}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {shortenAddress(obj.start)}
                  </a>
                </td>
                <td>
                  {" "}
                  <a
                    href={`https://etherscan.io/tx/${obj.end}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {shortenAddress(obj.end)}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Page>
    </>
  );
}

export async function getServerSideProps({ res }: GetServerSidePropsContext) {
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=60, stale-while-revalidate=300"
  );

  const contract = ManagerContract__factory.connect(
    TOKEMAK_MANAGER,
    getProvider()
  );

  const cycle = (await contract.currentCycleIndex()).toNumber();

  const startBlock = 14308978;

  const cycleStart = await contract.queryFilter(
    contract.filters.CycleRolloverStarted(),
    startBlock
  );

  const cycleEnd = await contract.queryFilter(
    contract.filters.CycleRolloverComplete(),
    startBlock
  );

  let lastStart: {
    txHash: string;
    timestamp: number;
    type: string | undefined;
  } | null = null;

  let times = [...cycleStart, ...cycleEnd]
    .map((obj) => ({
      txHash: obj.transactionHash,
      timestamp: obj.args.timestamp.toNumber(),
      type: obj.event,
    }))
    .sort(({ timestamp: a }, { timestamp: b }) => a - b);

  let averageTimes: { start: string; end: string; diff: number }[] = [];
  for (let time of times) {
    if (time.type === "CycleRolloverStarted") {
      lastStart = time;
      continue;
    }

    if (lastStart !== null && time.type === "CycleRolloverComplete") {
      averageTimes.push({
        start: lastStart.txHash,
        end: time.txHash,
        diff: time.timestamp - lastStart.timestamp,
      });
    }
  }

  averageTimes = averageTimes.reverse();

  const lastEvent = times.at(-1);
  if (!lastEvent) {
    throw Error("no events");
  }

  return {
    props: {
      lastEvent,
      averageTimes,
      cycle,
    },
  };
}

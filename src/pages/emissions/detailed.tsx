import { Page } from "components/Page";
import { GetStaticProps } from "next";
import { prisma } from "utils/db";
import Head from "next/head";
import { useState } from "react";

type Total = {
  cycle: number;
  description: string;
  rewards: string;
};

type Props = {
  totals: Total[];
};

export default function Leaderboard({ totals }: Props) {
  const [filter, setFilter] = useState("");

  const options = Array.from(new Set(totals.map((total) => total.description)));
  options.sort();

  let filteredTotals = totals;

  if (filter !== "") {
    filteredTotals = totals.filter(({ description }) => description === filter);
  }

  const groupedTotals = filteredTotals.reduce((acc, obj) => {
    return { ...acc, [obj.cycle]: [...(acc[obj.cycle] || []), obj] };
  }, {} as Record<string, Total[]>);

  return (
    <Page header="Reward Emissions" className="items-center">
      <Head>
        <title>Rewards Emissions</title>
        <meta
          name="description"
          content="See how Tokemak reward emissions are changing over time."
        />
      </Head>

      <div>
        <div>
          Filter:{" "}
          <select
            value={filter}
            onChange={(obj) => setFilter(obj.currentTarget.value)}
          >
            <option value=""></option>
            {options.map((description) => (
              <option key={description}>{description}</option>
            ))}
          </select>
        </div>

        {Object.entries(groupedTotals).map(([cycle, totals]) => (
          <div key={cycle} className="pt-5">
            <h1>Cycle {cycle}</h1>

            <table className="ml-4">
              <tbody>
                {totals.map(({ description, rewards }) => (
                  <tr key={description}>
                    <td>{description}</td>
                    <td>{rewards}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </Page>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const totals = await prisma.$queryRaw<Total[]>`
      select cycle, description, (trunc((sum(amount)/10^18)::numeric,2))::varchar as rewards
      from (select address,
                   cycle,
                   data as breakdown
            from ipfs_rewards
            where cycle > 0
            ) totals,
           json_to_recordset(totals.breakdown) as breakdown(amount decimal, description varchar)
      group by cycle, description
      order by cycle desc
  `;

  return {
    props: {
      totals,
    },
  };
};

import { formatNumber } from "@/utils/maths";
import { prisma } from "utils/db";

type Metric = {
  cycle: number;
  mean: number;
  median: number;
  max: number;
  standard_deviation: number;
  count: number;
};

export async function Metrics() {
  const metrics = await prisma.$queryRaw<Metric[]>`
      select cycle,
             avg(amount)                                         as mean,
             PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount) AS median,
             MAX(amount)                                         AS max,
             STDDEV(amount)                                      AS standard_deviation,
             count(*)::integer                                   as count
      from (select cycle, cycle_total / 10 ^ 18 as amount
            from ipfs_rewards
            where cycle > 200) cycles
      group by cycle
      order by cycle desc
  `;

  return (
    <div className="overflow-x-auto w-full md:w-auto">
      <h2 className="self-center text-2xl">Stats</h2>

      <table className="styledTable">
        <thead>
          <tr>
            <th>Cycle</th>
            <th>Mean</th>
            <th>Median</th>
            <th>Max</th>
            <th>Standard Deviation</th>
            <th>Wallets</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((metric) => (
            <tr key={metric.cycle}>
              <td>{metric.cycle}</td>
              <td>{formatNumber(metric.mean, 2)}</td>
              <td>{formatNumber(metric.median, 2)}</td>
              <td>{formatNumber(metric.max, 2)}</td>
              <td>{formatNumber(metric.standard_deviation, 2)}</td>
              <td>{metric.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

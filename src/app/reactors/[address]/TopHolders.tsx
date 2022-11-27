import { formatNumber } from "utils/maths";
import { prisma } from "utils/db";
import { toBuffer } from "@/pages/api/updateEvents";
import { Divider } from "components/Divider";

type Props = { address: string; decimal: number };

function getHolders({ address, decimal }: Props) {
  return prisma.$queryRaw<
    {
      account: string;
      total: number;
      named_account: string;
      percent: number;
    }[]
  >`
      select account::varchar,
             total,
             dao_name as named_account,
             (total / sum(total) over () * 100) as percent
      from (select account,
                   sum(adjusted_value) / 10^${decimal} as total
            from (select "transactionHash" as transaction_hash,
                         "blockNumber"     as block_number,
                         address,
                         "to"              as account,
                         value             as adjusted_value,
                         value
                  from erc20_transfers
                  union all
                  select "transactionHash" as transaction_hash,
                         "blockNumber"     as block_number,
                         address,
                         "from"            as account,
                         value * -1        as adjusted_value,
                         value
                  from erc20_transfers) foo
            where address = ${toBuffer(address)}
              and account != '\\x0000000000000000000000000000000000000000'
            group by account) totals
               left outer join dao_addresses da on da.address = totals.account
      where totals.total > 0
      order by total desc
      limit 10
  `;
}

export async function TopHolders(props: Props) {
  const holders = await getHolders(props);

  return (
    <>
      <Divider />
      <div className="w-full overflow-x-auto">
        <h2>Top Holders</h2>
        <table className="styledTable">
          <thead>
            <tr>
              <th>Account</th>
              <th>Amount</th>
              <th>Percent</th>
            </tr>
          </thead>
          <tbody>
            {holders
              .slice(0, 10)
              .map(({ named_account, account, total, percent }) => (
                <tr key={account}>
                  <td>{named_account || account.replace("\\", "0")}</td>
                  <td>{formatNumber(total, 2)}</td>
                  <td>{formatNumber(percent, 2)}%</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

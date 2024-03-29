import { intlFormat } from "date-fns";
import { shortenAddress } from "utils/maths";
import { Coin } from "components/coin";
import { Formatter } from "components/Formatter";
import { Card } from "components/Card";
import { TransactionExtended } from "@/pages/revenue";
import { groupBy, isEmpty, orderBy } from "lodash";
import { PropsWithChildren, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { MouseEvent } from "react";
import { useRouter } from "next/router";

type TransactionExtendedCoin = TransactionExtended & { coin: string };

type Props = {
  cycle: string;
  events: TransactionExtendedCoin[];
};

export function CycleRevenue({ cycle, events }: Props) {
  if (isEmpty(events)) {
    return null;
  }

  events = orderBy(events, (obj) => obj.coin.toLowerCase(), ["asc"]);

  const coins = groupBy(events, (obj) => obj.coin);

  const total = events.reduce((total, { usdValue }) => total + usdValue, 0);

  return (
    <Card className="overflow-x-auto w-full md:w-auto">
      <h2 className="text-xl">Cycle {cycle}</h2>

      <table className="styledTable">
        <thead>
          <tr>
            <th>Time</th>
            <th>Tx</th>
            <th>Coin</th>
            <th>Amount</th>
            <th>Current USD Value</th>
          </tr>
        </thead>

        <tbody>
          {Object.entries(coins)?.map(([coin, events]) => (
            <Row events={events} key={coin} />
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={5} className="text-right">
              <Formatter currency value={total} />
            </td>
          </tr>
        </tfoot>
      </table>
    </Card>
  );
}

function Row({ events }: { events: TransactionExtendedCoin[] }) {
  const totalAmount = events.reduce((acc, { value }) => acc + value, 0);
  const totalUsdValue = events.reduce((acc, { usdValue }) => acc + usdValue, 0);
  const coin = events[0].coin;

  const [expanded, setExpanded] = useState(false);

  function expand() {
    if (events.length === 1) {
      return;
    }
    setExpanded(!expanded);
  }

  if (events.length === 1) {
    return (
      <tr>
        <SingleRow event={events[0]} />
      </tr>
    );
  }

  return (
    <>
      <tr onClick={expand} className="cursor-pointer">
        <td>
          <FontAwesomeIcon
            width={10}
            icon={expanded ? faCaretDown : faCaretRight}
            className="pr-1"
          />
          Multiple
        </td>
        <td></td>
        <td>
          <Coin coin={coin}>{coin}</Coin>
        </td>
        <td>
          <Formatter
            value={totalAmount}
            options={{
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }}
          />
        </td>
        <td>
          <Formatter currency value={totalUsdValue} />
        </td>
      </tr>

      {expanded
        ? events.map((tx) => (
            <tr className="bg-gray-700" key={tx.value}>
              <SingleRow event={tx} hideCoin />
            </tr>
          ))
        : null}
    </>
  );
}

function SingleRow({
  event: tx,
  hideCoin,
  children,
}: PropsWithChildren<{
  event: TransactionExtendedCoin;
  hideCoin?: boolean;
}>) {
  const router = useRouter();

  async function onClick(event: MouseEvent) {
    if (!event.altKey || !router.query.hasOwnProperty("edit")) {
      return;
    }

    await fetch("/api/excludeRevenue", {
      method: "POST",
      body: JSON.stringify({
        transactionHash: tx.transactionHash,
        logIndex: tx.logIndex,
      }),
    });
  }

  return (
    <>
      {children ? (
        children
      ) : (
        <>
          <td onClick={onClick}>
            {intlFormat(new Date(tx.timestamp * 1000), {
              year: "2-digit",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
          </td>
          <td>
            <a
              href={`https://etherscan.io/tx/${tx.transactionHash}`}
              target="_blank"
              rel="noreferrer"
            >
              {shortenAddress(tx.transactionHash)}
            </a>
          </td>
        </>
      )}
      <td>{hideCoin ? null : <Coin coin={tx.coin}>{tx.coin}</Coin>}</td>

      <td>
        <Formatter
          value={tx.value}
          options={{
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }}
        />
      </td>
      <td>
        <Formatter currency value={tx.usdValue} />
      </td>
    </>
  );
}

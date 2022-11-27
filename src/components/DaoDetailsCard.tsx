import { formatMoney, formatNumber, shortenAddress } from "utils/maths";
import { useTokePrice } from "hooks/useTokenPrice";
import { StatCard } from "components/StatCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExternalLink,
  faCaretUp,
  faCaretDown,
} from "@fortawesome/free-solid-svg-icons";
import { SizeProp } from "@fortawesome/fontawesome-svg-core";
import { STAGE_MAP } from "@/constants";

interface StatsCardProps {
  title: string;
  total: number;
  changePercent: number;
  /* icon: ReactNode; */
}
function StatsCard({ title, total, changePercent }: StatsCardProps) {
  const toke_price = useTokePrice();

  const arrowCommon = {
    size: "lg" as SizeProp,
    className: "pr-1",
  };

  let arrow = null;
  if (changePercent < 0) {
    arrow = <FontAwesomeIcon icon={faCaretDown} color="red" {...arrowCommon} />;
  } else if (changePercent > 0) {
    arrow = <FontAwesomeIcon icon={faCaretUp} color="green" {...arrowCommon} />;
  }

  return (
    <StatCard
      top={title}
      middle={
        <div className="flex gap-1 items-center">
          {formatNumber(total)}
          <div className="text-sm font-light bg-gray-600 px-1 rounded">
            {formatMoney(total * toke_price)}
          </div>
        </div>
      }
      bottom={
        <>
          {arrow}
          {arrow ? changePercent.toFixed(2) + "%" : "No change"} over 30 days
        </>
      }
    />
  );
}

interface StageCardProps {
  title: string;
  stage: number;
  /* icon: ReactNode; */
}
function StageCard({ title, stage }: StageCardProps) {
  const stageText = STAGE_MAP[stage].title || "";

  return <StatCard top={title} middle={stage} bottom={stageText} />;
}

interface StatsLinkCardProps {
  title: string;
  addresses: string[];
}
function StatsLinkCard({ title, addresses }: StatsLinkCardProps) {
  return (
    <StatCard
      top={title}
      middle={addresses.map((address) => (
        <a
          href={"https://zapper.fi/account/" + address}
          target="_blank"
          key={address}
          className="underline"
          rel="noreferrer"
        >
          {shortenAddress(address, 7)}
          <FontAwesomeIcon icon={faExternalLink} className="ml-2" />
        </a>
      ))}
    />
  );
}

type Props = {
  addresses: string[];
  stage: number;
  total: number;
  changePercent: number;
};

export function DaoDetailsCard({
  addresses,
  stage,
  total,
  changePercent,
}: Props) {
  return (
    <div className="grid md:grid-cols-3">
      <StatsCard
        title="Total TOKE Owned"
        total={total}
        changePercent={changePercent}
      />
      <StageCard title="DAO Stage" stage={stage} />
      <StatsLinkCard
        title={`Tracked address${addresses.length > 1 ? "es" : ""}`}
        addresses={addresses}
      />
    </div>
  );
}

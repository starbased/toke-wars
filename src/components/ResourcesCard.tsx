import { LinkCard } from "./LinkCard";
import { faTwitter, faDiscord } from "@fortawesome/free-brands-svg-icons";
import { faBitcoin } from "@fortawesome/free-brands-svg-icons";
import { Divider } from "./Divider";

type Props = {
  geckoData: {
    id: string;
    name: string;
    links: {
      chat_url: string[];
      twitter_screen_name: string;
    };
  };
};

export function ResourcesCard({ geckoData: tokenInfo }: Props) {
  return (
    <>
      <Divider />

      <h2 className="text-center text-xl"> Resources for {tokenInfo?.name} </h2>

      <div className="gap-5 flex flex-wrap justify-center">
        <LinkCard
          title="Follow on Twitter"
          url={"https://twitter.com/" + tokenInfo?.links.twitter_screen_name}
          icon={faTwitter}
        />
        <LinkCard
          title="View on CoinGecko"
          url={"https://coingecko.com/coins/" + tokenInfo?.id}
          icon={faBitcoin}
        />
        <LinkCard
          title="Follow on Twitter"
          url={tokenInfo?.links.chat_url[0]}
          icon={faDiscord}
        />
      </div>
    </>
  );
}

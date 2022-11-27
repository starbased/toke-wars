import { LinkCard } from "@/components/LinkCard";
import { faTwitter, faDiscord } from "@fortawesome/free-brands-svg-icons";
import { faBitcoin } from "@fortawesome/free-brands-svg-icons";
import { Divider } from "@/components/Divider";
import { getGeckoData } from "utils/api/coinGecko";

export async function ResourcesCard({ geckoId }: { geckoId: string | null }) {
  if (!geckoId) {
    return null;
  }

  const geckoData = await getGeckoData(geckoId);

  return (
    <>
      <Divider />

      <h2 className="text-center text-xl"> Resources for {geckoData?.name} </h2>

      <div className="gap-5 flex flex-wrap justify-center">
        <LinkCard
          title="Follow on Twitter"
          url={"https://twitter.com/" + geckoData?.links.twitter_screen_name}
          icon={faTwitter}
        />
        <LinkCard
          title="View on CoinGecko"
          url={"https://coingecko.com/coins/" + geckoData?.id}
          icon={faBitcoin}
        />
        <LinkCard
          title="Chat on Discord"
          url={geckoData?.links.chat_url[0]}
          icon={faDiscord}
        />
      </div>
    </>
  );
}

import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Badge,
  Box,
  Flex,
  Link,
  SimpleGrid,
  Skeleton,
  Stack,
  Stat,
  StatArrow,
  StatGroup,
  StatHelpText,
  StatLabel,
  StatNumber,
  useColorModeValue,
} from "@chakra-ui/react";
import { ReactNode } from "react";
import { formatMoney, formatNumber, shortenAddress } from "../util/maths";
import { stageMap } from "../pages/stages";
import { useTokePrice } from "../util/api/tokemak";

type BaseCardProps = {
  title: string;
  children: ReactNode;
};

export function BaseCard({ title, children }: BaseCardProps) {
  return (
    <Stat
      px={{ base: 2, md: 4 }}
      py="5"
      shadow="xl"
      border="1px solid"
      borderColor={useColorModeValue("gray.800", "gray.500")}
      rounded="lg"
    >
      <Flex justifyContent="space-between">
        <Box pl={{ base: 2, md: 4 }}>
          <StatLabel fontWeight="medium" isTruncated>
            {title}
          </StatLabel>
          <StatGroup>{children}</StatGroup>
        </Box>
        <Box
          my="auto"
          color={useColorModeValue("gray.800", "gray.200")}
          alignContent="center"
        >
          {/* {icon} */}
        </Box>
      </Flex>
    </Stat>
  );
}

interface StatsCardProps {
  title: string;
  total: number;
  changePercent: number;
  /* icon: ReactNode; */
}
function StatsCard({ title, total, changePercent }: StatsCardProps) {
  const toke_price = useTokePrice();

  let arrow = null;
  if (total && total >= 0) {
    if (changePercent < 0) {
      arrow = <StatArrow type="decrease" />;
    } else if (changePercent > 0) {
      arrow = <StatArrow type="increase" />;
    }
  }

  return (
    <BaseCard title={title}>
      <Stat>
        <Skeleton isLoaded={total >= 0}>
          <StatNumber>
            {formatNumber(total)}
            <Badge ml="2" variant="subtle">
              {formatMoney(total * toke_price)}
            </Badge>
          </StatNumber>
        </Skeleton>
        <Skeleton isLoaded={total >= 0}>
          <StatHelpText>
            {arrow}
            {arrow ? changePercent.toFixed(2) + "%" : "No change"} over 30 days
          </StatHelpText>
        </Skeleton>
      </Stat>
    </BaseCard>
  );
}

interface StageCardProps {
  title: string;
  stage: number;
  /* icon: ReactNode; */
}
function StageCard({ title, stage }: StageCardProps) {
  const stageText = stageMap[stage].title || "";

  return (
    <BaseCard title={title}>
      <Stat>
        <StatNumber>{stage}</StatNumber>
        <StatHelpText>{stageText}</StatHelpText>
      </Stat>
    </BaseCard>
  );
}

interface StatsLinkCardProps {
  title: string;
  addresses: string[];
  /* icon: ReactNode; */
}
function StatsLinkCard({ title, addresses }: StatsLinkCardProps) {
  return (
    <BaseCard title={title}>
      <Stat>
        {addresses.map((address) => (
          <StatNumber fontSize={20} key={address}>
            <Link href={"https://zapper.fi/account/" + address} isExternal>
              {shortenAddress(address, 7)} <ExternalLinkIcon mx="2px" />
            </Link>
          </StatNumber>
        ))}
      </Stat>
    </BaseCard>
  );
}

interface SkeletonCardProps {}

function SkeletonCard({}: SkeletonCardProps) {
  return (
    <BaseCard title={""}>
      <Stat>
        <Stack>
          <Skeleton height="20px" width="225px" />
          <Skeleton height="20px" width="225px" />
          <Skeleton height="20px" width="225px" />
        </Stack>
      </Stat>
    </BaseCard>
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
  if (total < 0) {
    return (
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 5, lg: 8 }}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </SimpleGrid>
    );
  }

  return (
    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 5, lg: 8 }}>
      <StatsCard
        title="Total TOKE Owned"
        total={total}
        changePercent={changePercent}
        /* icon="┻┳" */
      />
      <StageCard
        title="DAO Stage"
        stage={stage}
        /* icon={<FiServer size={'3em'} />} */
      />
      <StatsLinkCard
        title={`Tracked address${addresses.length > 1 ? "es" : ""}`}
        addresses={addresses}
        /* icon={<GoLocation size={'3em'} />} */
      />
    </SimpleGrid>
  );
}

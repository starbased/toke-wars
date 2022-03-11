import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Badge,
  Box,
  chakra,
  Flex,
  Heading,
  Link,
  SimpleGrid,
  Stat,
  StatArrow,
  StatGroup,
  StatHelpText,
  StatLabel,
  StatNumber,
  useColorModeValue,
} from "@chakra-ui/react";
import { ReactNode } from "react";
import { BsPerson } from "react-icons/bs";
import { FiServer } from "react-icons/fi";
import { GoLocation } from "react-icons/go";

interface StatsCardProps {
  title: string;
  total: number;
  /* icon: ReactNode; */
}
function StatsCard(props: StatsCardProps) {
  const { title, total } = props;
  return (
    <Stat
      px={{ base: 2, md: 4 }}
      py={"5"}
      shadow={"xl"}
      border={"1px solid"}
      borderColor={useColorModeValue("gray.800", "gray.500")}
      rounded={"lg"}
    >
      <Flex justifyContent={"space-between"}>
        <Box pl={{ base: 2, md: 4 }}>
          <StatLabel fontWeight={"medium"} isTruncated>
            {title}
          </StatLabel>
          <StatGroup>
            <Stat>
              <StatNumber>{total}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                {/* 
                get percent increase
                if newStaking contains sum totals,
                can compare latest to previous
                */}
                {(((total - 10000) / total) * 100).toFixed(2)}%
              </StatHelpText>
            </Stat>
          </StatGroup>
        </Box>
        <Box
          my={"auto"}
          color={useColorModeValue("gray.800", "gray.200")}
          alignContent={"center"}
        >
          {/* {icon} */}
        </Box>
      </Flex>
    </Stat>
  );
}

interface StageCardProps {
  title: string;
  stage: string;
  /* icon: ReactNode; */
}
function StageCard(props: StageCardProps) {
  const { title, stage } = props;
  return (
    <Stat
      px={{ base: 2, md: 4 }}
      py={"5"}
      shadow={"xl"}
      border={"1px solid"}
      borderColor={useColorModeValue("gray.800", "gray.500")}
      rounded={"lg"}
    >
      <Flex justifyContent={"space-between"}>
        <Box pl={{ base: 2, md: 4 }}>
          <StatLabel fontWeight={"medium"} isTruncated>
            {title}
          </StatLabel>

          <StatGroup>
            <Stat>
              <StatNumber>{stage}</StatNumber>
              <StatHelpText>Stage {stage}: Incentivized Liquidity via Emissions</StatHelpText>
            </Stat>
          </StatGroup>
        </Box>
        <Box
          my={"auto"}
          color={useColorModeValue("gray.800", "gray.200")}
          alignContent={"center"}
        >
          {/* {icon} */}
        </Box>
      </Flex>
    </Stat>
  );
}

interface StatsLinkCardProps {
  title: string;
  addresses: string[];
  /* icon: ReactNode; */
}
function StatsLinkCard(props: StatsLinkCardProps) {
  const { title, addresses } = props;
  return (
    <Stat
      px={{ base: 2, md: 4 }}
      py={"5"}
      shadow={"xl"}
      border={"1px solid"}
      borderColor={useColorModeValue("gray.800", "gray.500")}
      rounded={"lg"}
    >
      <Flex justifyContent={"space-between"}>
        <Box pl={{ base: 2, md: 4 }}>
          <StatLabel fontWeight={"medium"} isTruncated>
            {title}
          </StatLabel>
          <StatGroup>
            <Stat>
              <StatNumber>
                <Link
                  href={"http://zapper.fi/account/" + addresses[0]}
                  isExternal
                >
                  Current Treasury <ExternalLinkIcon mx="2px" />
                </Link>
              </StatNumber>
              <StatHelpText>{addresses[0].substring(0,5)}</StatHelpText>
            </Stat>
          </StatGroup>

          <StatNumber fontSize={"2xl"} fontWeight={"medium"}></StatNumber>
        </Box>
        <Box
          my={"auto"}
          color={useColorModeValue("gray.800", "gray.200")}
          alignContent={"center"}
        >
          {/* {icon} */}
        </Box>
      </Flex>
    </Stat>
  );
}

type Props = {
  name: string;
  addresses: string[];
  stage: string;
  total: number;
};

export function DaoDetailsCard({ name, addresses, stage, total }: Props) {
  return (
    <Box maxW="7xl" mx={"auto"} pt={5} px={{ base: 2, sm: 12, md: 17 }}>
      <chakra.h1
        textAlign={"center"}
        fontSize={"4xl"}
        py={10}
        fontWeight={"bold"}
      >
        {name}
      </chakra.h1>
      {/*         <Heading as='h4' style={{ display: "flex", gap: "5px" }}>
          {addresses.map((address) => (
            <Badge key={address}>
              {address}
            </Badge>
          ))}
        </Heading> */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 5, lg: 8 }}>
        <StatsCard
          title={"Total TOKE Owned"}
          total={total}
          /* icon={"┻┳"} */
        />
        <StageCard
          title={"DAO Stage"}
          stage={stage}
          /* icon={<FiServer size={'3em'} />} */
        />
        <StatsLinkCard
          title={"Zapper"}
          addresses={addresses}
          /* icon={<GoLocation size={'3em'} />} */
        />
      </SimpleGrid>
    </Box>
  );
}
import { ReactNode } from "react";
import {
  Box,
  Flex,
  HStack,
  Link as DisplayLink,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  useColorModeValue,
  Stack,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import { sortBy } from "lodash";
import { DAOS } from "../constants";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";

const NavLink = ({ children, to }: { children: ReactNode; to: string }) => (
  <Link href={to} passHref>
    <DisplayLink
      px={2}
      py={1}
      rounded="md"
      _hover={{
        textDecoration: "none",
        bg: useColorModeValue("gray.200", "gray.700"),
      }}
    >
      {children}
    </DisplayLink>
  </Link>
);

export function Header() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();

  const links = (
    <>
      <NavLink to="/reactor/0xd3b5d9a561c293fb42b446fe7e237daa9bf9aa84">
        Reactors
      </NavLink>
      {["Leaderboard", "Revenue", "Stages", "Rewards"].map((link) => (
        <NavLink to={"/" + link.toLowerCase()} key={link}>
          {link}
        </NavLink>
      ))}
    </>
  );

  return (
    <Box
      as="nav"
      bg={useColorModeValue("gray.100", "gray.900")}
      px={4}
      zIndex={100}
    >
      <Flex h={16} alignItems="center" gap={2}>
        <IconButton
          size="md"
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label="Open Menu"
          display={{ md: "none" }}
          onClick={isOpen ? onClose : onOpen}
        />
        <Box
          onClick={() => router.push("/")}
          style={{ cursor: "pointer", display: "flex" }}
          mr="4"
        >
          <Image
            src="/images/tokewars.png" // Route of the image file
            height={22} // Desired size with correct aspect ratio
            width={160} // Desired size with correct aspect ratio
            alt="Toke Wars Logo"
          />
        </Box>

        <HStack spacing={4} display={{ base: "none", md: "flex" }}>
          {links}

          <Menu>
            <MenuButton as={Button} minW={0}>
              DAOs
            </MenuButton>
            <MenuList>
              {sortBy(DAOS, "name").map(({ name }) => (
                <MenuItem
                  key={name}
                  onClick={() => router.push(`daos/${name}`)}
                >
                  {name}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </HStack>
      </Flex>

      {isOpen ? (
        <Box pb={4} display={{ md: "none" }}>
          <Stack as="nav" spacing={4}>
            {links}
            <Menu>
              <MenuButton as={Button} minW={0}>
                DAOs
              </MenuButton>
              <MenuList>
                {sortBy(DAOS, "name").map(({ name }) => (
                  <MenuItem key={name}>
                    <Link href={`daos/${name}`}> {name}</Link>
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
}

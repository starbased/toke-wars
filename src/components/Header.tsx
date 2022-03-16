import { ReactNode } from "react";
import {
  Box,
  Flex,
  HStack,
  Link,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  useColorModeValue,
  Stack,
  Image,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import { NavLink as NavLinkReact } from "react-router-dom";
import { DAOS } from "../constants";
import { useNavigate } from "react-router-dom";
import { sortBy } from "lodash";

const Links = ["Reactors", "Leaderboard", "Stages", "Rewards"];

const NavLink = ({ children, to }: { children: ReactNode; to: string }) => (
  <Link
    px={2}
    py={1}
    as={NavLinkReact}
    to={to}
    rounded="md"
    _hover={{
      textDecoration: "none",
      bg: useColorModeValue("gray.200", "gray.700"),
    }}
    href="#"
  >
    {children}
  </Link>
);

export function Header() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

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
        <Box onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <Image src="/src/tokewars.png" alt="Toke Wars Logo" height={50} />
        </Box>

        <HStack spacing={4} display={{ base: "none", md: "flex" }}>
          {Links.map((link) => (
            <NavLink to={link} key={link}>
              {link}
            </NavLink>
          ))}

          <Menu>
            <MenuButton as={Button} minW={0}>
              DAOs
            </MenuButton>
            <MenuList>
              {sortBy(DAOS, "name").map(({ name }) => (
                <MenuItem key={name} onClick={() => navigate(`daos/${name}`)}>
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
            {Links.map((link) => (
              <NavLink key={link} to={link}>
                {link}
              </NavLink>
            ))}
            <Menu>
              <MenuButton as={Button} minW={0}>
                DAOs
              </MenuButton>
              <MenuList>
                {sortBy(DAOS, "name").map(({ name }) => (
                  <MenuItem key={name}>
                    <NavLinkReact to={`daos/${name}`}> {name}</NavLinkReact>
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

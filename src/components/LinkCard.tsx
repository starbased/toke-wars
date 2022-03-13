import { LinkBox, Button, LinkOverlay } from "@chakra-ui/react";
import { ReactElement } from "react";

interface LinkCardProps {
  title: string;
  url: string;
  icon: ReactElement;
}
export function LinkCard({ title, url, icon }: LinkCardProps) {
  return (
    <LinkBox>
      <Button w={"full"} maxW={"md"} variant={"outline"} leftIcon={icon}>
        <LinkOverlay href={url} isExternal>
          {title}
        </LinkOverlay>
      </Button>
    </LinkBox>
  );
}

import { Badge } from "@chakra-ui/react";
import { Page } from "../../components/Page";
import { UserInput } from "../../components/UserInput";

export default function Index() {
  return (
    <Page header="Index">
      <UserInput />
      <Badge>Enter an address to continue</Badge>
    </Page>
  );
}

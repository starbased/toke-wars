import { prisma } from "../../util/db";
import { Dao } from "@prisma/client";
import { Input } from "@chakra-ui/input";

type Props = {
  daos: Dao[];
};

export default function Index({ daos }: Props) {
  return (
    <>
      {daos.map((dao) => (
        <div key={dao.name}>{dao.name}</div>
      ))}

      <div>
        <form action="/api/hello" method="post">
          <Input type="text" name="name" placeholder="name" />
          <Input type="text" name="stage" placeholder="stage" />
          <Input type="text" name="addresses" placeholder="addresses" />
          <button type="submit">submit</button>
        </form>
      </div>
    </>
  );
}

export async function getServerSideProps() {
  const daos = await prisma.dao.findMany();

  // Pass data to the page via props
  return { props: { daos } };
}

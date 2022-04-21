import type { NextPage } from "next";
import { useTokePrice } from "../util/api/tokemak";

const Home: NextPage = () => {
  const { data } = useTokePrice();
  return <div>Toke price {data}</div>;
};

export default Home;

import { Dao } from "./components/Dao";
import { Routes, Route } from "react-router-dom";
import { Home } from "./components/Home";
import { DAOS } from "./constants";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Container } from "@chakra-ui/react";
import { LiquidityStages } from "./components/LiquidityStages";
import { Reactors } from "./components/Reactors";
import { Leaderboard } from "./components/Leaderboard";
import { Rewards } from "./components/Rewards/Rewards";
import { Test } from "./components/Test";
import { Revenue } from "./components/Revenue/Revenue";

function App() {
  return (
    <>
      <Header />
      <main>
        <Container maxW="container.xl" my="10">
          <Routes>
            {DAOS.map((dao) => (
              <Route
                path={`daos/${dao.name}`}
                key={dao.name}
                element={<Dao dao={dao} />}
              />
            ))}

            <Route path="/stages" element={<LiquidityStages />} />
            <Route path="/reactors" element={<Reactors />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/rewards/:address" element={<Rewards />} />
            <Route path="/test" element={<Test />} />
            <Route path="/revenue" element={<Revenue />} />
            <Route path="/" element={<Home />} />
          </Routes>
        </Container>
      </main>
      <Footer />
    </>
  );
}

export default App;

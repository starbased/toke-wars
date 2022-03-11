import { Dao } from "./components/Dao";
import { Routes, Route } from "react-router-dom";
import { Home } from "./components/Home";
import { DAOS } from "./constants";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Container, VStack } from "@chakra-ui/react";
import { LiquidityStages } from "./components/LiquidityStages";

function App() {
  return (
    <div className="App">
      <Header />
      <VStack spacing={20} align="stretch">
        <Container maxW="container.xl" as="main">
          <Routes>
            {DAOS.map((dao) => (
              <Route
                path={`daos/${dao.name}`}
                key={dao.name}
                element={<Dao dao={dao} />}
              />
            ))}

            <Route path="/stages" element={<LiquidityStages />} />
            <Route path="/" element={<Home />} />
          </Routes>
        </Container>
        <Footer />
      </VStack>
    </div>
  );
}

export default App;

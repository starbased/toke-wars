import { Dao } from "./components/Dao";
import { Routes, Route } from "react-router-dom";
import { Home } from "./components/Home";
import { DAOS } from "./constants";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Container, VStack } from '@chakra-ui/react'

function App() {
  return (
    <div className="App">
      <Header />
      <VStack
        spacing={20}
        align='stretch'
      >
        <Container maxW='container.xl' as="main">
          <Routes>
            {DAOS.map(({ addresses, name }) => (
              <Route
                path={`daos/${name}`}
                key={name}
                element={<Dao addresses={addresses} name={name} />}
              />
            ))}
            <Route path="/" element={<Home />} />
          </Routes>
        </Container>
        <Footer />
      </VStack>
    </div>
  );
}

export default App;

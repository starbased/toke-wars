import { Dao } from "./components/Dao";
import { Routes, Route } from "react-router-dom";
import { Home } from "./components/Home";
import { DAOS } from "./constants";
import { Header } from "./components/Header";
import { Col, Container, Row } from "react-bootstrap";

function App() {
  return (
    <div className="App">
      <Header />
      <Container as="main">
        <Row>
          <Col md={{ span: 10, offset: 1 }}>
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
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;

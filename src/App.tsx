import { Dao } from "./components/Dao";
import { Routes, Route } from "react-router-dom";
import { Home } from "./components/Home";
import { DAOS } from "./constants";
import { Header } from "./components/Header";

function App() {
  return (
    <div className="App">
      <Header />
      <main>
        <Routes>
          {DAOS.map(([address, name]) => (
            <Route
              path={`daos/${name}`}
              key={address}
              element={<Dao address={address} name={name} />}
            />
          ))}
          <Route path="/" element={<Home />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

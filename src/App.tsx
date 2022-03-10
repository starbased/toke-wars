import { Dao } from "./components/Dao";
import { Routes, Route, NavLink } from "react-router-dom";
import { Home } from "./components/Home";
import { DAOS } from "./constants";

function App() {
  return (
    <div className="App">
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "5px",
        }}
      >
        {DAOS.map(([_, name]) => (
          <NavLink to={`daos/${name}`} key={name}>
            {name}
          </NavLink>
        ))}
      </header>
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

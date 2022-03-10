import { Dao } from "./components/Dao";

function App() {
  const doas = [
    {
      address: "0x245cc372c84b3645bf0ffe6538620b04a217988b",
      name: "Olympus",
    },
    {
      address: "0x9e2b6378ee8ad2a4a95fe481d63caba8fb0ebbf9",
      name: "Alchemix",
    },
  ];

  return (
    <div className="App">
      <header>header</header>
      <main>
        {doas.map((obj) => (
          <Dao {...obj} key={obj.address} />
        ))}
      </main>
    </div>
  );
}

export default App;

import { Dao } from "./components/Dao";

function App() {
  const doas = [
    ["0x245cc372c84b3645bf0ffe6538620b04a217988b", "Olympus"],
    ["0x5180db0237291a6449dda9ed33ad90a38787621c", "Frax"],
    ["0x90a48d5cf7343b08da12e067680b4c6dbfe551be", "ShapeShift"],
    ["0x873ad91fA4F2aA0d557C0919eC3F6c9D240cDd05", "Lobis"],
    ["0xe94B5EEC1fA96CEecbD33EF5Baa8d00E4493F4f3", "Sushi"],
    ["0xa84918f3280d488eb3369cb713ec53ce386b6cba", "Tracer"],
    ["0xDbbfc051D200438dd5847b093B22484B842de9E7", "APWine"],
    ["0x99F4176EE457afedFfCB1839c7aB7A030a5e4A92", "Synthetix"],
    ["0x42e61987a5cba002880b3cc5c800952a5804a1c5", "SquidDAO"],
    ["0xde50fb295549eda934d222e7a24d5a8dd132444f", "Lobis"],
    ["0xf2c58cca8ce82df7a2A4f7F936608d61f45a9a47", "Gamma"],
    ["0x086C98855dF3C78C6b481b6e1D47BeF42E9aC36B", "Redacted"],
    ["0xA52Fd396891E7A74b641a2Cb1A6999Fcf56B077e", "Redacted"],
    ["0x95E8C5a56ACc8064311d79946c7Be87a1e90d17f", "Tracer"],
  ];

  return (
    <div className="App">
      <header>header</header>
      <main>
        {doas.map(([address, name]) => (
          <Dao address={address} name={name} key={address} />
        ))}
      </main>
    </div>
  );
}

export default App;

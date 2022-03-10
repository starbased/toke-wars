import { DAOS } from "../constants";
import { NavLink } from "react-router-dom";

export function Header() {
  return (
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
  );
}

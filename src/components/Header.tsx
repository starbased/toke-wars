import { DAOS } from "../constants";
import { NavLink } from "react-router-dom";
import { Navbar, Container, Nav, NavDropdown } from "react-bootstrap";

export function Header() {
  return (

    <Navbar bg="light" expand="lg">
  <Container>
    <Navbar.Brand href="#home">React-Bootstrap</Navbar.Brand>
    <Navbar.Toggle aria-controls="basic-navbar-nav" />
    <Navbar.Collapse id="basic-navbar-nav">
      <Nav className="me-auto">
      <Nav.Link href="/">Home</Nav.Link>
        {DAOS.map(([_, name]) => (
          <Nav.Link className="me-auto" key={name}>
            <NavLink  to={`daos/${name}`} key={name}>
              {name}
            </NavLink>
          </Nav.Link>
        ))}
      </Nav>
    </Navbar.Collapse>
  </Container>
</Navbar>
  );
}

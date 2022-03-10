import { DAOS } from "../constants";
import { LinkContainer } from "react-router-bootstrap";
import { Navbar, Container, Nav, NavDropdown } from "react-bootstrap";

export function Header() {
  return (
    <Navbar bg="light" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand href="/">Toke Wars</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {/*       <Nav.Link href="/reactors">Reactors</Nav.Link>
      <Nav.Link href="/leaderboard">Leaderboard</Nav.Link>
      <Nav.Link href="/stages">Liquidity Stages</Nav.Link> */}
            <NavDropdown title="DAOs" id="basic-nav-dropdown">
              {DAOS.map(({ name }) => (
                <LinkContainer to={`daos/${name}`} key={name}>
                  <NavDropdown.Item className="me-auto" key={name}>
                    {name}
                  </NavDropdown.Item>
                </LinkContainer>
              ))}
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

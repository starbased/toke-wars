import { Col, Container, Row } from "react-bootstrap";

export function Home() {
  return <div>
          <Container>
          <Row>
            <Col md={{ span: 10, offset: 1 }}>Welcome</Col>
          </Row>
          </Container>
        </div>;
}

import {
  Container,
  Row,
} from "reactstrap";

const Comments = () => {
  return (
    <Container className="mt-4" fluid>
      <Row>
        <div className="col">
          <h1>Comentários e Sugestões</h1>
          <iframe
            src="https://docs.google.com/forms/d/e/1FAIpQLScWkosurzk1ukkTV28Yv9dGzIcw4jlmY6zWfCf9CjbEHU3Fig/viewform?embedded=true"
            width="100%"
            height="535vh"
            frameborder="none"
            marginHeight="0"
            marginWidth="0"
          >
            Carregando…
          </iframe>
        </div>
      </Row>
    </Container>
  );
}

export default Comments;

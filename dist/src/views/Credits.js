import {
  Container,
  Row,
} from "reactstrap";

const Credits = () => {
  return (
    <Container className="mt-4" fluid>
      <Row>
        <div className="col">
          <h1>Créditos</h1>
          <p>
            Concepção e implementação:
            <a href="https://sites.google.com/site/nabormendonca/" target="_blank">Nabor Mendonça</a>
            (UNIFOR)
          </p>
          <p>Consultoria de conteúdo: Andréia Formico (UNIFOR)</p>
          <p>Consultoria técnica: Lucas Mendonça (Instituto Eldorado)</p>
          <p>Consultoria sobre a fonte de dados da CAPES: André Luiz F. Batista (IFTM-MG)</p>
          <p>Criação da fonte de dados da PUC-RS: Olimar Borges (PUC-RS)</p>
          <p>Logo: variação sobre os logos do Qualis e da Plataforma Lattes</p>
        </div>
      </Row>
    </Container>
  );
}

export default Credits;

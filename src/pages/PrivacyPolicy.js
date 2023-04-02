import '../App.css';

function PrivacyPolicy() {
  return (
    <div class="content">
      <p type="first">
        foi desenvolvida como um projeto pessoal, de
        <a href="https://github.com/nabormendonca/qlattes" target="_blank">código aberto</a>, sem qualquer vínculo com a CAPES, o CNPq ou outras entidades
        governamentais.
      </p>
      <p>
        A ferramenta incorpora e utiliza dados de classificação de periódicos
        publicamente disponíveis. A extração, a classificação, e o armazenamento
        dos dados das publicações são feitos internamente, no próprio navegador,
        sem acessar nenhuma API ou serviço remoto.
      </p>
    </div>
  );
}

export default PrivacyPolicy;

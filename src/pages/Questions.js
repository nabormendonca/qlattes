import '../App.css';

function Questions() {
  return (
    <div class="content content-text">
      <h1>Dúvidas frequentes</h1>
      <h4>
        Quando abro a página de um ou mais CV Lattes, não vejo nenhuma anotação ao
        lado dos dados dos artigos publicados em periódicos
      </h4>
      <p>Este problema pode acontecer em três situações:</p>
      <ol>
        <li>quando a extensão não foi devidamente instalada no navegador</li>
        <li>
          quando a extensão foi instalada mas não está habilitada no navegador
        </li>
        <li>
          quando a extensão foi instalada e habilitada no navegador, mas não tem
          permissão de acesso às páginas dos CVs na Plataforma Lattes
        </li>
      </ol>
      <p>
        No primeiro caso, a solução é simplesmente (re)instalar a extensão no
        navegador. No segundo caso, a solução é habilitar a extensão. Para isso,
        clique no ícone de extensões do navegador (no formato de uma peça de
        quebra-cabeça, localizado ao lado da barra de endereço) e certifique-se de
        que o botão ao lado do ícone da <img src="../images/qlattes-logo.png" class="logo-text"/> está 
        habilitado. No terceiro caso, a solução é dar permissão de acesso às
        páginas do Lattes à extensão. Para isso, clique no ícone de extensões do
        navegador e, em seguida, escolha a opção "Gerenciar extensão", ao lado do
        ícone da <img src="../images/qlattes-logo.png" class="logo-text"/> (os 
        nomes das opções podem mudar, a depender do navegador utilizado e da
        língua padrão com que o navegador está configurado). Na página de
        gerenciamento da extensão, certifique-se de que esta tem permissão de
        acesso às URLs "http://buscatextual.cnpq.br/*" e
        "https://buscatextual.cnpq.br/*". Após isso, atualize a(s) página(s) do(s)
        CV(s) para que a ferramenta possa anotar o Qualis dos artigos em
        periódicos e extrair os dados a serem visualizados.
      </p>
      <h4>
        Não estou conseguindo visualizar os dados de nenhum CV Lattes que
        consulto. Quando abro a página da ferramenta, a aba de visualização mostra
        a mensagem "Nenhum CV disponível"
      </h4>
      <p>
        Como explicado acima, <img src="../images/qlattes-logo.png" class="logo-text"/> precisa 
        de permissão para anotar o Qualis dos periódicos na página dos
        CVs. Nos navegadores compatíveis com o Chromium, essa permissão é
        geralmente dada por padrão, durante a instalação da ferramenta. Já no
        navegador Firefox, essa permissão precisa ser dada explicitamente pelo
        usuário, após a instalação. Para resolver o problema, é necessário dar
        permissão de acesso às páginas do Lattes à extensão, conforme explicado na
        resposta à duvida anterior.
      </p>
      <h4>
        A ferramenta não classificou (ou classificou no estrato errado) uma
        publicação cujo periódico está classificado no novo Qualis
      </h4>
      <p>
        <img src="../images/qlattes-logo.png" class="logo-text"/> classifica os 
        artigos com base unicamente no ISSN dos periódicos que
        extrai do CV Lattes. Portanto, se a ferramenta não classificou
        corretamente algum artigo cujo periódico está classificado no Qualis,
        muito provavelmente a razão é que o artigo está cadastrado no Lattes com
        um ISSN diferente daquele que consta no Qualis. Nesses casos, a solução é
        atualizar ou recadastrar o artigo no Lattes, certificando-se de que o ISSN
        cadastrado é o mesmo que consta no Qualis.
      </p>
      <h4>
        A ferramenta anotou uma publicação com um ISSN diferente do ISSN que
        consta no novo Qualis
      </h4>
      <p>
        O ISSN anotado pela ferramenta é o mesmo que está cadastrado no CV Lattes.
        Embora a página do Lattes não mostre o ISSN dos periódicos no modo de
        visualização padrão, este dado faz parte da estrutura HTML da página.
        Novamente, a solução é atualizar ou recadastrar o artigo no Lattes,
        certificando-se de que o ISSN cadastrado é o mesmo que consta no Qualis.
      </p>
      <h4>
        A ferramenta não classificou os artigos em periódicos aceitos para
        publicação
      </h4>
      <p>
        <img src="../images/qlattes-logo.png" class="logo-text"/> apenas classifica 
        o Qualis dos artigos em periódicos já publicados. Uma
        dificuldade para classificar os artigos aceitos é que nem todos os artigos
        aceitos cadastrados no Lattes possuem ISSN. Futuras versões da ferramenta
        poderão classificar os artigos aceitos que tiverem ISSN cadastrado.
      </p>
      <h4>Não encontrei respostas para a minha dúvida. E agora?</h4>
      <p>
        Ainda continua com dúvidas sobre a <img src="../images/qlattes-logo.png" class="logo-text"/>? 
        Utilize o formulário disponível na aba "Comentários" para enviar uma
        mensagem aos desenvolvedores relatando a sua dúvida e ajude a melhorar a
        ferramenta.
      </p>
    </div>
  );
}

export default Questions;

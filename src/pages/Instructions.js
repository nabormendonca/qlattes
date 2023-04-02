import '../App.css';

function Instructions() {
  return (
    <div class="content">
      <p type="first">
        Abra a página de um ou mais CV Lattes no seu navegador derivado da
        plataforma
        <a href="https://www.chromium.org/Home/" target="_blank">Chromium</a> (por
        exemplo,
        <a href="https://www.google.com/chrome/" target="_blank">Chrome</a>,
        <a href="https://www.microsoft.com/edge" target="_blank">Microsoft Edge</a>, <a href="https://www.opera.com/" target="_blank">Opera</a>, e
        <a href="https://brave.com/" target="_blank">Brave</a>) ou
        <a href="https://www.mozilla.org/firefox/" target="_blank">Mozilla Firefox</a>.
      </p>
      <p>
        automaticamente anotará o Qualis dos artigos em periódicos diretamente nas
        páginas dos CVs. Navegue até a seção de "Artigos completos publicados em
        periódicos" dos CVs para visualizar as anotações, localizadas logo abaixo
        das informações de cada artigo.
      </p>
      <p>
        As anotações adicionadas pela ferramenta incluem a classificação Qualis e
        o ISSN do periódico no qual o artigo foi publicado, a fonte de dados e o
        ano-base utilizados para classificar o periódico, um ícone  com um link
        para buscar o título do artigo no Google Acadêmico, e, quando disponível,
        um ícone  com um link para abrir a página do periódico no portal da Scopus.
      </p>
      <p>
        Artigos publicados em periódicos cujo ISSN não foi encontrado em nenhuma
        das fontes de dados utilizadas pela ferramenta são anotados nas páginas
        dos CVs como "Não classificado."
        representa os números referentes aos artigos não classificados
        atribuindo-lhes o estrato "N" nas diferentes visualizações que exibe.
      </p>
      <h4>Visualização dos dados</h4>
      <p>
        Para visualizar os dados de classificação dos artigos de forma
        consolidada, abra a página da ferramenta clicando no ícone da extensão. Em
        seguida, selecione um dos CVs disponíveis. Após um CV ter sido
        selecionado,
        oferecerá diferentes opções para o usuário filtrar e visualizar os dados
        do CV por período. Para ajustar o período de visualização, utilize as
        opções de manipulação dos anos inicial e final do período, ou escolha um
        dos períodos pré-selecionados pela ferramenta.
      </p>
      <p>A atual versão da ferramenta implementa seis tipos de visualização:</p>
      <ul>
        <li>Gráfico de classificação Qualis</li>
        <li>Tabela de classificação Qualis</li>
        <li>Gráfico de pontuação Qualis</li>
        <li>Tabela de pontuação Qualis</li>
        <li>5 melhores artigos</li>
        <li>10 melhores artigos</li>
      </ul>
      <p>
        As duas primeiras visualizações exibem, na forma de um gráfico e de uma
        tabela, respectivamente, a quantidade de artigos encontrados no CV para
        cada estrato do Qualis, consolidados por ano. As duas visualizações
        seguintes exibem, novamente, na forma de gráfico e tabela,
        respectivamente, a pontuação acumulada por estrato e por ano, de acordo
        com o peso ou pontos de cada estrato do Qualis, conforme regras
        estabelecidas pela CAPES e transcritas na tabela abaixo:
      </p>
      <table class="styled-table" id="score-rule-table">
        <thead>
            <tr>
                <th type="text">Estrato</th>
                <th type="text">Pontos</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>A1</td>
                <td>100</td>
            </tr>
            <tr>
                <td>A2</td>
                <td>85</td>
            </tr>
            <tr>
                <td>A3</td>
                <td>70
                </td>
            </tr>
            <tr>
                <td>A4</td>
                <td>55
                </td>
            </tr>
            <tr>
                <td>B1</td>
                <td>40
                </td>
            </tr>
            <tr>
                <td>B2</td>
                <td>30</td>
            </tr>
            <tr>
                <td>B3</td>
                <td>20
                </td>
            </tr>
            <tr>
                <td>B4</td>
                <td>10</td>
            </tr>
            <tr>
              <td>C</td>
              <td>0</td>
          </tr>
        </tbody>
    </table>
      <p>
        As duas últimas visualizações, como os nomes sugerem, mostram as
        informações dos 5/10 artigos mais bem classificadas no Qualis no período
        selecionado. O ranque das publicações é criado com base na classificação
        Qualis de cada publicação, com o ano de publicação sendo utilizado como
        critério de desempate (publicações mais recentes são exibidas à frente de
        publicações mais antigas).
      </p>
      <p>
        As visualizações da classificação e da pontuação Qualis oferecem a opção
        de exibir estatísticas como a média, a mediana, e a tendência calculadas
        sobre os valores de cada ano do período selecionado. A tendência é
        calculada pela inclinação da reta obtida via regressão linear sobre os
        valores de cada ano do período selecionado.
      </p>
      <p>
        Ambas as visualizações na forma de gráfico possuem elementos visuais
        ativos. Passe o mouse sobre os elementos do gráfico para revelar os
        respectivos valores. Clique nos elementos da legenda para ocultar/exibir
        os elementos do gráfico referentes a estratos específicos do Qualis.
      </p>
      <h4>Remoção dos dados</h4>
      <p>
        Os dados extraídos e consolidados pela
        podem ser removidos a qualquer momento pelo usuário. Para isso, basta
        clicar no ícone em formato de uma lixeira, localizado ao lado do nome da
        pessoa autora do CV. A ferramenta solicitará ao usuário que confirme a
        remoção dos dados do CV, antes de removê-los em definitivo. Uma vez
        confirmada a remoção dos dados, será necessário atualizar ou (re)abrir a
        página do CV no navegador para visualizar seus dados novamente.
      </p>
    </div>
  );
}

export default Instructions;

import '../App.css';

function DataInformation() {
  return (
    <div class="content content-text">
      <h1>Fonte de dados</h1>
      <p><img src="../images/qlattes-logo.png" class="logo-text"/> utiliza três fontes de dados para classificar os artigos em periódico, todas incluídas junto com a ferramenta:</p>
        <ul>
          <li>fonte de dados da CAPES</li>
          <li>fonte de dados da PUC-RS</li>
          <li>fonte de dados da Scopus</li>
        </ul>
      <h4>Fonte de dados da CAPES</h4>
      <p>Os dados desta fonte foram coletados da <a href="https://sucupira.capes.gov.br/sucupira/public/index.xhtml" target="_blank">Plataforma Sucupira</a> da CAPES, ao final de 2022, e incluem a classificação Qualis de 31.337 periódicos de todas as áreas do conhecimento (ano-base 2020).
      </p><h4>Fonte de dados da PUC-RS</h4>
      <p>Os dados desta fonte foram coletados da página do Qualis da <a href="https://ppgcc.github.io/discentesPPGCC/pt-BR/qualis/" target="_blank">PUC-RS</a>, em dezembro de 2022, e incluem a classificação Qualis e o percentil Scopus de 2.190 periódicos (ano-base 2021), predominantemente da área de Ciência da Computação. </p> 
      <h4>Fonte de dados da Scopus</h4>
      <p>Os dados desta fonte foram coletados do <a href="https://www.scopus.com/sources.uri" target="_blank">portal da Scopus</a>, em maio de 2021, e incluem os percentis de 25.990 periódicos internacionais de todas as áreas do conhecimento (ano-base 2020). <img src="../images/qlattes-logo.png" class="logo-text"/> classifica os periódicos encontrados exclusivamente nesta fonte tomando como base as <a href="https://www.in.gov.br/en/web/dou/-/portaria-n-145-de-10-de-setembro-de-2021-344468240" target="_blank">regras de distribuição de percentis</a> estabelecidas pela CAPES: </p>
      <br/>
      <table class="styled-table-text" id="percentil-rule-table">
        <thead>
          <tr>
            <th type="text">Estrato</th>
            <th type="text">Distribuição</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>A1</td>
            <td>percentil ≥ 87,5</td>
          </tr>
          <tr>
            <td>A2</td>
            <td>75 ≤ percentil &lt; 87,5 </td>
          </tr>
          <tr>
            <td>A3</td>
            <td>62,5 ≤ percentil &lt; 75
            </td>
          </tr>
          <tr>
            <td>A4</td>
            <td>50 ≤ percentil &lt; 62,5
            </td>
          </tr>
          <tr>
            <td>B1</td>
            <td>37,5 ≤ percentil &lt; 50
            </td>
          </tr>
          <tr>
            <td>B2</td>
            <td>25 ≤ percentil &lt; 37,5 </td>
          </tr>
          <tr>
            <td>B3</td>
            <td>12,5 ≤ percentil &lt; 25
            </td>
          </tr>
          <tr>
            <td>B4</td>
            <td>percentil &lt; 12,5</td>
          </tr>
        </tbody>
      </table>
      <h4>Método de busca</h4>
      <p><img src="../images/qlattes-logo.png" class="logo-text"/> consulta uma fonte de dados de cada vez, por ordem de atualização dos dados de cada fonte, da mais recente (CAPES) à mais antiga (Scopus), utilizando o ISSN dos periódicos extraído do CVs como chave de busca. Se os dados de um periódico não forem encontrados na primeira fonte de dados consultada, a ferramenta busca esses dados na próxima fonte de dados, e assim sucessivamente.</p>
      <h4>Critérios de Inclusão</h4>
      <p>Cada uma das três fontes de dados inclui apenas as informações referentes à melhor classificação no Qualis, ou o maior percentil, de cada periódico, independentemente de área de conhecimento. Esta decisão está em conformidade com a atual política de classificação de periódicos adotada pela CAPES, e foi tomada para melhorar a eficiência da ferramenta e reduzir seu consumo de recursos no navegador.</p>
      <br/>
      <p>Embora as três fontes possuam dados redundantes, com a classificação ou o percentil Scopus de muitos periódicos estando presente em mais de uma delas, o fato de cada fonte incluir dados de periódicos inexistentes nas outras fontes justifica a incorporação das três fontes pela ferramenta.</p>
    </div>
  );
}

export default DataInformation;

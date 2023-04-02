import '../App.css';

function FutureEnhancement() {
  return (
    <div class="content">
      <p type="first">
        Essas são algumas das melhorias sendo atualmente consideradas para futuras
        versões da
      </p>
      <ul>
        <li>exibição dos dados consolidados de múltiplos CVs</li>
        <li>
          integração com outras fontes de classificação de veículos científicos
        </li>
        <li>classificação dos artigos publicados em eventos</li>
        <li>armazenamento dos dados extraídos dos CVs em arquivo</li>
      </ul>
      <h4>Exibição dos dados de múltiplos CVs</h4>
      <p>
        Esta funcionalidade facilitaria a comparação da produção de um grupo de
        pessoas, por exemplo, os membros de um determinado corpo docente,
        departamento, ou instituição. Além de envolver o re-desenho das
        visualizações atualmente implementadas, outro desafio aqui é o fato da
        Plataforma Lattes (ou pelo menos a sua interface web nativa) não permitir
        o acesso aos dados dos CVS em bloco. Ou seja, mesmo que a ferramenta
        permitisse a visualização dos dados de múltiplos CVs simultaneamente,
        esses dados ainda teriam que ser extraídos abrindo-se as páginas dos CVs
        uma a uma.
      </p>
      <h4>Integração com outras fontes de métricas</h4>
      <p>
        Uma extensão natural da ferramenta seria permitir a visualização dos dados
        dos CVs integrados aos dados das mesmas pessoas obtidos de outras fontes
        de métricas acadêmicas, como
        <a href="https://scholar.google.com/" target="_blank">Google Acadêmico</a>
        e <a href="https://csindexbr.org/" target="_blank">CSIndexbr</a>. O
        desafio, nesse caso, seria a necessidade da ferramenta acessar essas
        fontes externas durante o processamento dos dados dos CVs, o que poderia
        afetar a sua eficiência e resiliência.
      </p>
      <h4>Classificação de eventos</h4>
      <p>
        O desafio aqui é o fato dos eventos não possuírem um identificador único,
        como o ISSN dos periódicos. Sem tal identificador, a classificação dos
        eventos tem que ser feita com base apenas na informação sobre os eventos
        registradas nos CVs, que, em essência, não possui uma estrutura bem
        definida. Isso aumenta o risco da classificação automática dos eventos
        conter muitos falsos positivos ou falsos negativos.
      </p>
      <p>
        Uma alternativa interessante seria utilizar a própria ferramenta como uma
        plataforma colaborativa para treinamento supervisionado de modelos de
        aprendizado de máquina criados especificamente para identificar eventos
        nas informações contidas nos CVs Lattes. Por exemplo, a ferramenta poderia
        sugerir a classificação dos eventos registrados no CV, e o usuário então
        confirmaria ou revisaria a classificação sugerida.
      </p>
      <h4>Armazenamento dos dados dos CVs em arquivo</h4>
      <p>
        Esta funcionalidade permitiria armazenar os dados extraídos dos CVs em
        arquivos externos, os quais poderiam ser novamente recuperados pela
        ferramenta posteriormente. Essa melhoria facilitaria a análise e
        visualização dos dados de um grande número de CVs, por exemplo, de todo o
        corpo docente de um departamento acadêmico, os quais poderiam ser
        extraídos e armazenados gradualmente. Outra vantagem seria a possibilidade
        de analisar os dados extraídos pela
        utilizando outras ferramentas e tecnologias.
      </p>
      <p>
        Voluntários e colaboradores para implementar essas e outras melhorias são
        muito bem vindos!
      </p>
    </div>
  );
}

export default FutureEnhancement;

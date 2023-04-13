import '../App.css';
import { useState } from 'react';
import QualisTableView from '../components/QualisTableView';
import QualisGraphicView from '../components/QualisGraphicView';
import ScoreGraphicView from '../components/ScoreGraphicView';
import ScoreTableView from '../components/ScoreTableView';
import TopView from '../components/TopView';
import { FaTrashAlt, FaUserAlt, FaChartBar, FaRegCalendarCheck } from 'react-icons/fa';
import { updateLattesData, getLattesAuthorStats } from '../Utils/utils';

function Analysis() {
  const [author, setAuthor] = useState("");
  const [authors, setAuthors] = useState([]);
  const [viewType, setViewType] = useState("");
  const [stats, setStats] = useState([]);
  const [pubInfo, setPubInfo] = useState([]);
  const [totalPubs, setTotalPubs] = useState(0);
  const [initYear, setInitYear] = useState(0);
  const [endYear, setEndYear] = useState(0);
  const [showStatistics, setShowStatistics] = useState(false);
  const [initYearInput, setInitYearInput] = useState(initYear);
  const [endYearInput, setEndYearInput] = useState(endYear);

  async function handleAuthorSelector(value) {
    setAuthor(value);

    // get author Lattes stats and publication info for selected author
    const authorStats = await getLattesAuthorStats(value);

    setInitYear(authorStats.minYear);
    setEndYear(authorStats.maxYear);
    setInitYearInput(authorStats.minYear);
    setEndYearInput(authorStats.maxYear);
    setStats(authorStats.stats);
    setPubInfo(authorStats.pubInfo);
    setTotalPubs(authorStats.totalPubs);
  }
  function handleSelectedPeriod(value) {
    setEndYearInput(endYear);
    switch (value) {
      case "last5":
        setInitYearInput(endYear-5);
        break;
      case "last10":
        setInitYearInput(endYear-10);
        break;
      case "all":
        setInitYearInput(initYear);
        break;
    }
  }

  updateLattesData().then((authorNameLinkList) => {
    if (authors.length == 0 && authorNameLinkList.length != 0) setAuthors(authorNameLinkList);
  });

  return (
    <div class="content">
      <form id="form-filters">
        <div class="select-icon">
          <FaUserAlt color='#415e98'/> 
          <select id="author-select" value={author} onChange={e => handleAuthorSelector(e.target.value)}>
            <option value="" disabled="true" selected="true" hidden="true">Selecione um CV</option>
            {authors.map(op => <option value={op.link}>{op.name}</option>)}
          </select>
        </div>
        { author != "" ? <>
          <button id="clear-data-button" title="Remover dados do CV" onClick={() => setAuthor("")}>
            <FaTrashAlt color='#415e98'/>
          </button>
          <div class="select-icon">
            <FaChartBar color='#415e98'/>
            <select id="view-type-select" value={viewType} onChange={e => setViewType(e.target.value)}>
              <option value="" disabled="true" selected="true" hidden="true"> Selecione uma visualização</option>
              <optgroup label="Classificação">
                <option value="qualisTableView">Tabela de classificação Qualis</option>
                <option value="qualisGraphicView">Gráfico de classificação Qualis</option>
              </optgroup>
              <optgroup label="Pontuação">
                <option value="scoreTableView">Tabela de pontuação Qualis</option>
                <option value="scoreGraphicView">Gráfico de pontuação Qualis</option>
              </optgroup>
              <optgroup label="Publicações">
                <option value="top5View">5 melhores artigos</option>
                <option value="top10View">10 melhores artigos</option>
              </optgroup>
            </select>
          </div>
          <input id="init-year-input" class="year-input" type="number" min={initYear} max={endYear} value={initYearInput} required="required" onChange={e => setInitYearInput(e.target.value)}/>
          <p> a </p>
          <input id="end-year-input" class="year-input" type="number" min={initYear} max={endYear} value={endYearInput} required="required" onChange={e => setEndYearInput(e.target.value)}/>
          <div class="select-icon">
            <FaRegCalendarCheck color='#415e98'/>
            <select id="period-select" onChange={e => handleSelectedPeriod(e.target.value)}>
              <option value="last5">Últimos 5 anos</option>
              <option value="last10">Últimos 10 anos</option>
              <option value="all" selected="true"> Todo o período do CV</option>
            </select>
          </div>
          {viewType != "top5View" && viewType != "top10View" ? (<div>
            <input id="showStatistics" type="checkbox" value={showStatistics} onChange={(e) =>setShowStatistics(!showStatistics)}/>
            <label for="showStatistics">Exibir estatísticas</label>
          </div>) : null }
        </> : null}
      </form>
      { author != "" && <p id="total-pubs-div">{totalPubs} artigos em periódicos entre {initYear} e {endYear}</p> }
      <div class="table-wrapper">
        {viewType == "qualisTableView" ? <QualisTableView init={initYearInput} end={endYearInput} stats={stats} showStatistics={showStatistics}/> : null}
        {viewType == "qualisGraphicView" ? <QualisGraphicView init={initYearInput} end={endYearInput} stats={stats} showStatistics={showStatistics}/> : null}
        {viewType == "scoreTableView" ? <ScoreTableView init={initYearInput} end={endYearInput} stats={stats} showStatistics={showStatistics}/> : null}
        {viewType == "scoreGraphicView" ? <ScoreGraphicView init={initYearInput} end={endYearInput} stats={stats} showStatistics={showStatistics}/> : null}
        {viewType == "top5View" ? <TopView topN={5} startYear={initYearInput} endYear={endYearInput} pubInfo={pubInfo}/> : null}
        {viewType == "top10View" ? <TopView topN={10} startYear={initYearInput} endYear={endYearInput} pubInfo={pubInfo}/> : null}
      </div>
    </div>
  );
}

export default Analysis;

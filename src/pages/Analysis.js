/*global chrome*/

import '../App.css';
import { useState } from 'react';
import QualisTableView from '../components/QualisTableView';
import QualisGraphicView from '../components/QualisGraphicView';
import ScoreGraphicView from '../components/ScoreGraphicView';
import ScoreTableView from '../components/ScoreTableView';
import TopView from '../components/TopView';
import { FaTrashAlt, FaUserAlt, FaChartBar, FaRegCalendarCheck, FaFileExport } from 'react-icons/fa';
import { getLattesAuthorStats, exportCV } from '../Utils/utils';

function Analysis(props) {
  const [author, setAuthor] = useState("");
  const [area, setArea] = useState(props.areaData.area);
  const [areaData, setAreaData] = useState(props.areaData);
  const [viewType, setViewType] = useState("");
  const [stats, setStats] = useState([]);
  const [pubInfo, setPubInfo] = useState([]);
  const [totalPubs, setTotalPubs] = useState(0);
  const [initYear, setInitYear] = useState(0);
  const [endYear, setEndYear] = useState(0);
  const [showStatistics, setShowStatistics] = useState(false);
  const [initYearInput, setInitYearInput] = useState(initYear);
  const [endYearInput, setEndYearInput] = useState(endYear);
  const allQualisScores = props.allQualisScores;
  const authors = props.authors;

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
        setInitYearInput(endYear-4);
        break;
      case "last10":
        setInitYearInput(endYear-9);
        break;
      case "all":
        setInitYearInput(initYear);
        break;
    }
  }
  function handleAreaChange(event) {
    // get previous area (if any)
    var prevArea = area;

    // get selected area
    const newArea = event.target.value;
    setArea(newArea);

    if (newArea === 'undefined') {
      // save area data to local store
      chrome.storage.local.set({ area_data: {
        area: newArea,
        scores: {},
        label: 'Sem Área do Conhecimento',
        source: {},
        base_year: '',
      }});
    } else {
      // find selected area data in Qualis score data
      var match = allQualisScores.find((elem) =>
        Object.keys(elem.areas).includes(newArea)
      );

      if (match) {
        if (Object.keys(match.areas[newArea].scores).length > 0) {
          const currAreaData = {
            area: newArea,
            ...match.areas[newArea]
          }
          setAreaData(currAreaData);

          // save area data to local store
          chrome.storage.local.set({ area_data: currAreaData});
        } else {
          // show no scores alert and reset area select to previous area (if any)
          alert(
            'Esta Área do Conhecimento não definiu pontuação específica para os estratos do Qualis.'
          );
          if (prevArea !== '') {
            // reset area select to previously selected option
            event.target.value = prevArea;
          } else {
            // reset area select to placeholder option
            event.target.selectedIndex = 0;
          }
        }
      }
    }
  }

  if (authors.length == 0) {
    return (
      <div class="content content-text">
        <h1>Ainda não temos dados de nenhum CV</h1>
        <p class="text-centered">Pesquise pelos CVs em <a href='http://buscatextual.cnpq.br/buscatextual/busca.do' target='0'>http://buscatextual.cnpq.br/buscatextual/busca.do</a>
        <br/>
        Se isso for um bug, entre cem contato conosco na sessão de <a href='chrome-extension://ifegfogoaejhohjphcacjchnoojelmak/index.html/comments'>Comentários e sugestões</a> </p>
      </div>
    );
  }

  return (
    <div class="content form">
      <form id="form-filters">
        <div class="select-icon">
          <FaUserAlt color='#415e98'/> 
          <select id="author-select" value={author} onChange={e => handleAuthorSelector(e.target.value)}>
            <option value="" disabled="true" selected="true" hidden="true">Selecione um CV</option>
            {authors.map(op => <option value={op.link}>{op.name}</option>)}
          </select>
          { author != "" && <>
            <button id="clear-data-button" title="Remover dados do CV" onClick={() => setAuthor("")}>
              <FaTrashAlt color='#415e98'/>
            </button>
            <button id="clear-data-button" title="Exportar dados do CV" onClick={() => exportCV()}>
              <FaFileExport color='#415e98'/>
            </button>
          </>}
        </div>
        { author != "" ? <>
          <p id="total-pubs-div">{totalPubs} artigos em periódicos entre {initYear} e {endYear}</p>
          <div class="select-icon">
            <FaChartBar color='#415e98'/>
            <select id="area-select" value={area} onChange={e => handleAreaChange(e)}>
              <option value="" disabled="true" selected="true" hidden="true">Selecione uma Área do Conhecimento</option>
              <option value="undefined">Sem Área do Conhecimento</option>
              {allQualisScores.map(greatArea => <optgroup label={greatArea.label}>
                {Object.keys(greatArea.areas).map(area => <option value={area}>{greatArea.areas[area].label}</option>)}
                </optgroup>)}
            </select>
          </div>
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
          <div class="year-selection">
            <input id="init-year-input" class="year-input" type="number" min={initYear} max={endYear} value={initYearInput} required="required" onChange={e => setInitYearInput(e.target.value)}/>
            <p> a </p>
            <input id="end-year-input" class="year-input" type="number" min={initYear} max={endYear} value={endYearInput} required="required" onChange={e => setEndYearInput(e.target.value)}/>
          </div>
          <div class="select-icon">
            <FaRegCalendarCheck color='#415e98'/>
            <select id="period-select" onChange={e => handleSelectedPeriod(e.target.value)}>
              <option value="last5">Últimos 5 anos</option>
              <option value="last10">Últimos 10 anos</option>
              <option value="all" selected="true"> Todo o período do CV</option>
            </select>
          </div>
          {viewType != "top5View" && viewType != "top10View" ? (<div style={{ marginLeft: '13px' }}>
            <input id="showStatistics" type="checkbox" value={showStatistics} onChange={(e) =>setShowStatistics(!showStatistics)}/>
            <label for="showStatistics">Exibir estatísticas</label>
          </div>) : null }
        </> : null}
      </form>
      <div class="table-wrapper">
        {viewType == "qualisTableView" ? <QualisTableView init={initYearInput} end={endYearInput} stats={stats} showStatistics={showStatistics}/> : null}
        {viewType == "qualisGraphicView" ? <QualisGraphicView init={initYearInput} end={endYearInput} stats={stats} showStatistics={showStatistics}/> : null}
        {viewType == "scoreTableView" ? <ScoreTableView init={initYearInput} end={endYearInput} stats={stats} showStatistics={showStatistics} areaData={areaData}/> : null}
        {viewType == "scoreGraphicView" ? <ScoreGraphicView init={initYearInput} end={endYearInput} stats={stats} showStatistics={showStatistics} areaData={areaData}/> : null}
        {viewType == "top5View" ? <TopView topN={5} startYear={initYearInput} endYear={endYearInput} pubInfo={pubInfo}/> : null}
        {viewType == "top10View" ? <TopView topN={10} startYear={initYearInput} endYear={endYearInput} pubInfo={pubInfo}/> : null}
      </div>
    </div>
  );
}

export default Analysis;

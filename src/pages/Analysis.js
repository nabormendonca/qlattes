/*global chrome*/
import '../App.css';
import { useState, useEffect } from 'react';
import QualisTableView from '../components/QualisTableView';
import QualisGraphicView from '../components/QualisGraphicView';
import ScoreGraphicView from '../components/ScoreGraphicView';
import ScoreTableView from '../components/ScoreTableView';
import TopView from '../components/TopView';

import { FaTrashAlt, FaUserAlt, FaChartBar, FaRegCalendarCheck } from 'react-icons/fa';

// const authors = ["Stevens Kastrup Rehen", "Carlos José Pereira de Lucena", "Joel José Puga Coelho Rodrigues"];

async function updateLattesData() {
  const lattesData = await chrome.storage.local.get('lattes_data');

  let authorNameLinkList = [];
  for (const lattesDataElem of lattesData['lattes_data']) {
    authorNameLinkList.push(lattesDataElem.nameLink);
  }
  return authorNameLinkList;
}

async function getLattesAuthorStats(authorLink) {
  const lattesData = await chrome.storage.local.get('lattes_data');
  let authorStats = {
    stats: [],
    minYear: NaN,
    maxYear: NaN,
    totalPubs: NaN,
    pubInfo: [],
  };

  // get Lattes stats for author link
  var match = lattesData['lattes_data'].find(
    (elem) => elem.nameLink.link == authorLink
  );

  if (match) {
    // add missing years (if any) to author stats
    authorStats = addMissingYearsToAuthorStats(
      match.statsInfo.stats,
      match.statsInfo.pubInfo
    );
    console.log('author stats with missing years:', authorStats);

    // get min and max years from author stats
    authorStats.minYear = authorStats.stats.year.slice(-1)[0];
    authorStats.maxYear = authorStats.stats.year[0];

    // get total journal publications
    var totalPubs = 0;
    for (const key of Object.keys(authorStats.stats)) {
      if (key != 'year') {
        totalPubs += authorStats.stats[key].reduce(
          (partialSum, a) => partialSum + a,
          0
        );
      }
    }

    authorStats.totalPubs = totalPubs;
  }

  return authorStats;
}

function addMissingYearsToAuthorStats(stats, pubInfo) {
  const newStats = {};
  // reset new stats count lists
  for (const key of Object.keys(stats)) {
    newStats[key] = [];
  }
  const newPubInfo = [];

  let currYear = new Date().getFullYear() + 1;
  for (let i = 0; i < pubInfo.length; i++) {
    // add empty results for missing years (if any)
    for (let year = currYear - 1; year > pubInfo[i].year; year--) {
      // add empty counts to missing year stats
      for (const key of Object.keys(newStats)) {
        if (key == 'year') {
          newStats[key].push(year);
        } else {
          newStats[key].push(0);
        }
      }

      // add empty list to missing year publications
      newPubInfo.push({ year: year, pubList: [] });
    }

    // copy current year counts to new stats
    for (const key of Object.keys(newStats)) {
      newStats[key].push(stats[key][i]);
    }
    // copy current year publication list to new publication info
    newPubInfo.push(pubInfo[i]);

    // update current year
    currYear = pubInfo[i].year;
  }

  return {
    stats: newStats,
    minYear: NaN,
    maxYear: NaN,
    totalPubs: NaN,
    pubInfo: newPubInfo,
  };
}

function Analysis() {
  const [author, setAuthor] = useState("");
  const [authors, setAuthors] = useState([]);
  const [viewType, setViewType] = useState("");
  const [stats, setStats] = useState([]);
  const [pubInfo, setPubInfo] = useState([]);
  const [totalPubs, setTotalPubs] = useState(118);
  const [initYear, setInitYear] = useState(1993);
  const [endYear, setEndYear] = useState(2023);
  const [showStatistics, setShowStatistics] = useState(2023);
  const [initYearInput, setInitYearInput] = useState(initYear);
  const [endYearInput, setEndYearInput] = useState(endYear);

  async function handleViewTypeSelector(value) {
    setViewType(value);
  }
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
          <FaUserAlt/> 
          <select id="author-select" value={author} onChange={e => handleAuthorSelector(e.target.value)}>
            <option value="" disabled="true" selected="true" hidden="true">Selecione um CV</option>
            {authors.map(op => <option value={op.link}>{op.name}</option>)}
          </select>
        </div>
        { author != "" ? <>
          <button id="clear-data-button" title="Remover dados do CV" onClick={() => setAuthor("")}>
            <FaTrashAlt />
          </button>
          <div class="select-icon">
            <FaChartBar/>
            <select id="view-type-select" value={viewType} onChange={e => handleViewTypeSelector(e.target.value)}>
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
            <FaRegCalendarCheck/>
            <select id="period-select" onChange={e => handleSelectedPeriod(e.target.value)}>
              <option value="last5">Últimos 5 anos</option>
              <option value="last10">Últimos 10 anos</option>
              <option value="all" selected="true"> Todo o período do CV</option>
            </select>
          </div>
          <div>
            <input id="showStatistics" type="checkbox" value={showStatistics} onChange={e => setShowStatistics(e.target.value)}/>
            <label for="showStatistics">Exibir estatísticas</label>
          </div>
        </> : null}
      </form>
      { author != "" && <p id="total-pubs-div">{totalPubs} artigos em periódicos entre {initYear} e {endYear}</p> }
      <div class="table-wrapper">
        {viewType == "qualisTableView" ? <QualisTableView init={initYearInput} end={endYearInput} stats={stats} showStatistics={showStatistics}/> : null}
        {viewType == "qualisGraphicView" ? <QualisGraphicView init={initYearInput} end={endYearInput} stats={stats}/> : null}
        {viewType == "scoreTableView" ? <ScoreTableView init={initYearInput} end={endYearInput} stats={stats}/> : null}
        {viewType == "scoreGraphicView" ? <ScoreGraphicView init={initYearInput} end={endYearInput} stats={stats}/> : null}
        {viewType == "top5View" ? <TopView topN={5} startYear={initYearInput} endYear={endYearInput} pubInfo={pubInfo}/> : null}
        {viewType == "top10View" ? <TopView topN={10} startYear={initYearInput} endYear={endYearInput} pubInfo={pubInfo}/> : null}
      </div>
    </div>
  );
}

export default Analysis;

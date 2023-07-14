/*global chrome*/
import React, { useState } from 'react';

import {
  Form,
  FormGroup,
  InputGroupAddon,
  InputGroupText,
  Input,
  InputGroup,
  Label,
  Container,
} from "reactstrap";
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

import DataTable from "components/Data/DataTable";
import DataGraph from "components/Data/DataGraph";
import TopTable from "components/Data/TopTable";
import { addMissingYearsToPubInfo, getQualisStats, addMissingYearsToAuthorStats } from '../utils';


const Index = ({
  authors,
  groups,
  authorsNameLink,
  allQualisScores,
  previousArea,
  updateArea
}) => {
  const [area, setArea] = useState(previousArea?.area);
  const [areaData, setAreaData] = useState(previousArea);
  const [viewType, setViewType] = useState("");
  const [showStatistics, setShowStatistics] = useState(false);

  const [initYear, setInitYear] = useState(0);
  const [endYear, setEndYear] = useState(0);
  const [initYearInput, setInitYearInput] = useState(0);
  const [endYearInput, setEndYearInput] = useState(0);

  const [stats, setStats] = useState([]);
  const [pubInfo, setPubInfo] = useState([]);
  const [showAll, setShowAll] = useState(false);

  const cvOptions = authorsNameLink.concat(Object.values(groups));

  function handleViewTypeChange(value) {
    if ((value == "scoreTableView" || value == "scoreGraphicView") && Object.keys(areaData).length === 0) {
      alert(`Para visualizar a pontuação Qualis, é necessário selecionar uma Área do Conhecimento.`)
      return;
    }
    setViewType(value);
  }

  const handleAreaChange = async (event) => {
    // get previous area (if any)
    const prevArea = area;

    // get selected area
    const newArea = event.target.value;

    if (newArea === 'undefined') {
      // save area data to local store
      await chrome.storage.local.set({ area_data: {
        area: newArea,
        scores: {},
        label: 'Sem Área do Conhecimento',
        source: {},
        base_year: '',
      }});
      updateArea();

      if (viewType === "scoreTableView" || viewType === "scoreGraphicView") {
        alert(`Para visualizar a pontuação Qualis, é necessário selecionar uma Área do Conhecimento.`)
        setViewType("");
      }
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
          setArea(newArea);

          // save area data to local store
          await chrome.storage.local.set({ area_data: currAreaData});
          updateArea();
        } else {
          // show no scores alert and reset area select to previous area (if any)
          alert('Esta Área do Conhecimento não definiu pontuação específica para os estratos do Qualis.');
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
  
  function handleSelectedPeriod(value) {
    setEndYearInput(endYear);
    switch (value) {
      case "last5":
        setInitYearInput(endYear-4);
        break;
      case "last10":
        setInitYearInput(endYear-9);
        break;
      default:
        setInitYearInput(initYear);
        break;
    }
  }

  function handleCVsSelect(event, values) {
    // get authors links
    values = values.map(value => value.link ? value.link : value.authors)
      .flat().filter((value, index, self) => self.indexOf(value) === index);

    if (values.length === 0) {
      setShowAll(false);
      return;
    }

    // get all cvs
    const cvs = values.map(link => authors[link]);
    const pubInfos = cvs.map(cv => cv.pubInfo).flat();

    // merge pubInfos
    const mergedPubInfos = {};

    for (const pubInfo of pubInfos) {
      for (const year in pubInfo) {
        if (mergedPubInfos[year]) {
          mergedPubInfos[year] = mergedPubInfos[year].concat(pubInfo[year]);
        } else {
          mergedPubInfos[year] = pubInfo[year];
        }
      }
    }

    // GET YEARS
    const years = Object.keys(mergedPubInfos);
    const scores = areaData ? areaData.scores : {}

    // GET STATS
    let authorStats = {
      stats: [],
      minYear: years[0],
      maxYear: years[years.length-1],
      totalPubs: NaN,
      pubInfo: [],
    };
    // add missing years (if any) to author stats
    const pubInfoComplete = addMissingYearsToPubInfo(mergedPubInfos);
    authorStats = addMissingYearsToAuthorStats(getQualisStats(pubInfoComplete, 'qualis', scores), pubInfoComplete);

    // get total journal publications
    var totalPubs = 0;
    for (const key of Object.keys(authorStats.stats)) {
      if (key !== 'year' && key !== 'jcr') {
        totalPubs += authorStats.stats[key].reduce(
          (partialSum, a) => partialSum + a,
          0
        );
      }
    }
    authorStats.totalPubs = totalPubs;

    setShowAll(true);
    setStats(authorStats.stats);
    setInitYearInput(years[0]);
    setEndYearInput(years[years.length-1]);
    setInitYear(years[0]);
    setEndYear(years[years.length-1]);
    setPubInfo(pubInfoComplete);
  }

  if (previousArea?.area && !area) {
    setArea(previousArea.area);
    setAreaData(previousArea);
  }

  return (
    <>
      <Container fluid className="mt-3 mb-3" expand="md">
        <Form className="navbar-search navbar-search-dark form-inline mr-3 d-md-flex ml-lg-auto w-100">
          <FormGroup className="w-100" style={{ justifyContent: 'space-between' }}>
            {/* Select authors / groups */}
            <InputGroup className="input-group-alternative" style={{ width:"500px", border: 'none', backgroundColor: 'white' }}>
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <i className="fas fa-user" style={{ color: '#415e98' }}/>
                </InputGroupText>
              </InputGroupAddon>
              <Autocomplete
                onChange={handleCVsSelect}
                multiple
                options={cvOptions}
                getOptionLabel={(option) => option.name}
                defaultValue={[]}
                filterSelectedOptions
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Selecione um CV"
                  />
                )}
                noOptionsText="Não há CVs disponíveis"
                sx={{
                  width: '90%',
                  '& .MuiButtonBase-root': {
                    color: '#415e98',
                  },
                  '& .MuiInputBase-input': {
                    color: '#415e98',
                  },
                  '& fieldset': {
                    border: "none",
                  },
                  '& .MuiInputBase-root > .MuiButtonBase-root': {
                    border: '1px #415e98 solid',
                    backgroundColor: 'transparent',
                    '& .MuiSvgIcon-root': {
                      color: "#415e98"
                    }
                  }
                }}
              />
            </InputGroup>
            {/* Label */}
            {showAll && <Label style={{ marginLeft: "10px", marginRight: "10px", color: '#415e98' }}>
              {Object.values(pubInfo).flat().length} artigos em periódicos entre {initYear} e {endYear}
            </Label>}
          </FormGroup>
          {showAll && <>
            <FormGroup className="w-100">
              {/* área do conhecimento */}
              <InputGroup className="input-group-alternative mt-3" style={{ marginRight: "15px", border: 'none', backgroundColor: 'white' }}>
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>
                    <i className="fas fa-graduation-cap" style={{ color: '#415e98' }}/>
                  </InputGroupText>
                </InputGroupAddon>
                <Input
                  id="exampleSelect"
                  name="select"
                  type="select"
                  className="input-group-alternative"
                  style={{ marginRight: "15px", color:'#415e98' }}
                  value={area} onChange={e => handleAreaChange(e)}
                  defaultValue={area}
                >
                  <option value="" disabled={true} hidden={true}>Selecione uma Área do Conhecimento</option>
                  <option value="undefined" hidden={true}>Sem Área do Conhecimento</option>
                  {allQualisScores.map(greatArea => <optgroup label={greatArea.label}  style={{color: "black"}}>
                    {Object.keys(greatArea.areas).map(a => <option key={a} value={a}>{greatArea.areas[a].label}</option>)}
                  </optgroup>)}
                </Input>
              </InputGroup>
              {/* View type */}
              <InputGroup className="input-group-alternative mt-3" style={{ marginRight: "15px", border: 'none', backgroundColor: 'white' }}>
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>
                    <i className="fas fa-chart-bar" style={{ color: '#415e98' }}/>
                  </InputGroupText>
                </InputGroupAddon>
                <Input
                  id="exampleSelect"
                  name="select"
                  type="select"
                  className="input-group-alternative"
                  style={{ marginRight: "15px", color:'#415e98' }}
                  value={viewType} onChange={e => handleViewTypeChange(e.target.value)}
                  defaultValue=""
                >
                  <option value="" disabled={true} hidden={true}> Selecione uma visualização</option>
                  <optgroup label="Classificação" style={{color: "black"}}>
                    <option value="qualisTableView">Tabela de classificação Qualis</option>
                    <option value="qualisGraphicView">Gráfico de classificação Qualis</option>
                  </optgroup>
                  <optgroup label="Pontuação" style={{color: "black"}}>
                    <option disabled={!(areaData && areaData.scores)} value="scoreTableView">Tabela de pontuação Qualis</option>
                    <option disabled={!(areaData && areaData.scores)} value="scoreGraphicView">Gráfico de pontuação Qualis</option>
                  </optgroup>
                  <optgroup label="Publicações" style={{color: "black"}}>
                    <option value="top5View">5 melhores artigos</option>
                    <option value="top10View">10 melhores artigos</option>
                  </optgroup>
                </Input>
              </InputGroup>
              {/* Init year */}
              <InputGroup className="input-group-alternative mt-3" style={{ width:"100px", border: 'none', backgroundColor: 'white' }}>
                <Input
                  id="exampleEmail"
                  name="initYear"
                  placeholder="Ano de inicio"
                  type="number"
                  min={initYear} max={endYearInput}
                  value={initYearInput}
                  required="required"
                  onChange={e => setInitYearInput(e.target.value)}
                  style={{ color:'#415e98' }}
                />
              </InputGroup>
              <Label className="mt-3" style={{ marginLeft: "10px", marginRight: "10px", color: '#415e98' }}>
                a
              </Label>
              {/* End year */}
              <InputGroup className="input-group-alternative mt-3" style={{ width:"100px", border: 'none', backgroundColor: 'white', marginRight: "10px" }}>
                <Input
                  style={{ color:'#415e98' }}
                  id="exampleEmail"
                  name="endYear"
                  placeholder="Ano de fim"
                  type="number"
                  min={initYearInput} max={endYear}
                  value={endYearInput}
                  required="required"
                  onChange={e => setEndYearInput(e.target.value)}
                />
              </InputGroup>
              {/* Period */}
              <InputGroup className="input-group-alternative mt-3" style={{ border: 'none', backgroundColor: 'white' }}>
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>
                    <i className="fas fa-calendar-check" style={{ color:'#415e98' }} />
                  </InputGroupText>
                </InputGroupAddon>
                <Input
                  id="exampleSelect"
                  name="select"
                  type="select"
                  className="input-group-alternative"
                  style={{ marginRight: "15px", color:'#415e98' }}
                  onChange={e => handleSelectedPeriod(e.target.value)}
                  defaultValue="all"
                >
                  <option value="last5" style={{color: "black"}}>Últimos 5 anos</option>
                  <option value="last10" style={{color: "black"}}>Últimos 10 anos</option>
                  <option value="all" style={{color: "black"}}> Todo o período do CV</option>
                </Input>
              </InputGroup>
              {/* Statistics */}
              <InputGroupText className="mt-3 ml-4" style={{ backgroundColor: "transparent", border: "none" }}>
                <Input
                  addon
                  aria-label="Checkbox for following text input"
                  type="checkbox"
                  value={showStatistics}
                  onChange={(e) =>setShowStatistics(!showStatistics)}
                />
                <Label style={{ color:'#415e98' }} className="ml-2">
                  Exibir estatísticas
                </Label>
              </InputGroupText>
            </FormGroup>
          </>}
        </Form>
      </Container>
      {/* Page content */}
      <Container className="mb-5" fluid>
        {showAll && <>
          {viewType === "qualisTableView" && <DataTable tableName="Tabela de classificação Qualis" init={initYearInput} end={endYearInput} stats={stats} showStatistics={showStatistics}/>}
          {viewType === "qualisGraphicView" && <DataGraph graphName="Gráfico de classificação Qualis" init={initYearInput} end={endYearInput} stats={stats} showStatistics={showStatistics}/>}
          {viewType === "scoreTableView" && <DataTable tableName="Tabela de pontuação Qualis" init={initYearInput} end={endYearInput} stats={stats} showStatistics={showStatistics} areaData={areaData}/>}
          {viewType === "scoreGraphicView" && <DataGraph graphName="Gráfico de pontuação Qualis" init={initYearInput} end={endYearInput} stats={stats} showStatistics={showStatistics} areaData={areaData}/>}
          {viewType === "top5View" && <TopTable tableName="5 melhores publicações" topN={5} init={initYearInput} end={endYearInput} pubInfo={pubInfo}/>}
          {viewType === "top10View" && <TopTable tableName="10 melhores publicações" topN={10} init={initYearInput} end={endYearInput} pubInfo={pubInfo}/>}
        </>}
      </Container>
    </>
  );
};

export default Index;

import { useEffect } from 'react';
import '../App.css';
import {
  qualisScores,
  addStatisticFromTotal,
  updateTotalStats,
  getTableClass,
  adjustColumnWidths
} from '../Utils/utils.js';

function ScoreTableView({init, end, stats, showStatistics, areaData}) {
  useEffect(()=> {
    adjustColumnWidths();
  }, []);

  if (!areaData || Object.keys(areaData).length === 0) {
    alert(`Para visualizar a pontuação Qualis, é necessário selecionar uma Área do Conhecimento.`);
    return;
  }
  const dataCols = Object.keys(qualisScores);
  const totalCols = {
    keys: ['totA', 'totB', 'totABC', '%A', '%B'],
    labels: ['Tot A', 'Tot B', 'Total', '%A', '%B'],
    type: 'total',
  };

  // reset data counts
  let dataCounts = {};
  for (const key of dataCols) {
    dataCounts[key] = 0;
  }

  // reset total counts
  let totalCounts = {};
  for (const key of [...dataCols, ...totalCols.keys]) {
    totalCounts[key] = 0;
  }

  // reset total stats
  let totalStats = {};
  for (const key of totalCols.keys) {
    totalStats[key] = {
      best: { count: 0, year: 0 },
      countList: [],
      yearList: [],
    };
  }

  let rows = [];
  for (let currYear = 0; currYear < stats.year.length; currYear++) {
    if (stats.year[currYear] >= init && stats.year[currYear] <= end) {
      const newRow = [];

      newRow.push(<td type='year'>{stats.year[currYear]}</td>);

      // reset year total counts
      let yearTotalCounts = {};
      for (const key of totalCols.keys) {
        yearTotalCounts[key] = 0;
      }
      
      // create cells with data cols
      for (const key of dataCols) {
        const dataVal = qualisScores[key] * stats[key][currYear];
        const keyChar = key.slice(0, 1);

        newRow.push(<td type='data'>{dataVal.toString().indexOf('.') !== -1 ? dataVal.toFixed(1) : dataVal}</td>);
        if (keyChar == 'A') {
          yearTotalCounts['totA'] += dataVal;
        } else if (keyChar == 'B') {
          yearTotalCounts['totB'] += dataVal;
        }
        yearTotalCounts['totABC'] += dataVal;
        totalCounts[key] += dataVal;
        
        // increment data count with data val
        dataCounts[key] += dataVal;
      }

      yearTotalCounts['%A'] = yearTotalCounts['totABC']==0 ? 0 : (yearTotalCounts['totA']/yearTotalCounts['totABC']*100);
      yearTotalCounts['%B'] = yearTotalCounts['totABC']==0 ? 0 : (yearTotalCounts['totB']/yearTotalCounts['totABC']*100);
      
      for (const key of totalCols.keys) {
        newRow.push(<td type={totalCols.type}>{Math.round((yearTotalCounts[key] + Number.EPSILON) * 100) / 100}</td>);
        // increment total count
        totalCounts[key] += yearTotalCounts[key];
      }

      rows.push(<tr>{newRow}</tr>);
      
      // update total stats
      totalStats = updateTotalStats(
        totalStats,
        yearTotalCounts,
        stats.year[currYear]
      );
    }
  }
  rows = rows.reverse();

  totalCounts['%A'] = totalCounts['totABC']==0 ? 0 : (totalCounts['totA']/totalCounts['totABC']*100);
  totalCounts['%B'] = totalCounts['totABC']==0 ? 0 : (totalCounts['totB']/totalCounts['totABC']*100);

  return (
    <>
    <table class={getTableClass(rows.length)} id="score-table" tag="view">
      <thead>
        <tr>
          <th type="year">Ano</th>
          {dataCols.map(dataElem => <th type="data">{dataElem}</th>)}
          {totalCols.labels.map(totalElem => <th type={totalCols.type}>{totalElem}</th>)}
        </tr>
        <tr>
          <th type="year"></th>
          {Object.values(qualisScores).map((score) => <th type="data">{score} pts</th>)}
          {totalCols.keys.map((total) => <th type="total"></th>)}
        </tr>
      </thead>
      <tbody>{rows}</tbody>
      <tfoot>
        <tr tag="total">
          <th type="year">Total</th>
          {dataCols.map(key => <th type="data">{totalCounts[key].toString().indexOf('.') !== -1 ? totalCounts[key].toFixed(1) : totalCounts[key]}</th>)}
          {totalCols.keys.map(key => <th type={totalCols.type}>{totalCounts[key].toString().indexOf('.') !== -1 ? totalCounts[key].toFixed(1) : totalCounts[key]}</th>)}
        </tr>
        {addStatisticFromTotal(totalCols.keys, totalStats, showStatistics)}
      </tfoot>
    </table>
    <p>Fonte da pontuação: <a href={areaData.source.url} target="_blank" title={"Visualizar "+areaData.source.label}>{areaData.source.label}</a> da {areaData.label} (ano-base: {areaData.base_year})</p>
    </>
  );
}

export default ScoreTableView;

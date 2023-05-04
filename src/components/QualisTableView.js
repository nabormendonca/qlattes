import { useEffect } from 'react';
import '../App.css';
import {
  qualisScores,
  getTableClass,
  addStatisticFromTotal,
  updateTotalStats,
  adjustColumnWidths
} from '../Utils/utils.js';

function QualisTableView({init, end, stats, showStatistics}) {
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
        newRow.push(<td type='data'>{stats[key][currYear]}</td>);
        const keyChar = key.slice(0, 1);

        if (keyChar == 'A') {
          yearTotalCounts['totA'] += stats[key][currYear];
        } else if (keyChar == 'B') {
          yearTotalCounts['totB'] += stats[key][currYear];
        }
        yearTotalCounts['totABC'] += stats[key][currYear];
        totalCounts[key] += stats[key][currYear];
        
        // increment data count with data val
        dataCounts[key] += stats[key][currYear];
      }

      yearTotalCounts['%A'] = yearTotalCounts['totABC']==0 ? 0 : (yearTotalCounts['totA']/yearTotalCounts['totABC']*100);
      yearTotalCounts['%B'] = yearTotalCounts['totABC']==0 ? 0 : (yearTotalCounts['totB']/yearTotalCounts['totABC']*100);

      for (const key of totalCols.keys) {
        newRow.push(<td type={totalCols.type}>{yearTotalCounts[key].toString().indexOf('.') !== -1 ? yearTotalCounts[key].toFixed(1) : yearTotalCounts[key]}</td>);
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

  useEffect(()=>{
    adjustColumnWidths();
  }, []);

  return (
    <table class={getTableClass(rows.length)} id="qualis-table">
      <thead><tr>
        <th type="year">Ano</th>
        {dataCols.map(dataElem => <th type="data">{dataElem}</th>)}
        {totalCols.labels.map(totalElem => <th type="total">{totalElem}</th>)}
      </tr></thead>
      <tbody>{rows}</tbody>
      <tfoot>
        <tr tag="total">
          <th type="year">Total</th>
          {dataCols.map(key => <th type="data">{totalCounts[key].toString().indexOf('.') !== -1 ? totalCounts[key].toFixed(1) : totalCounts[key]}</th>)}
          {totalCols.keys.map(key => <th type="total">{totalCounts[key].toString().indexOf('.') !== -1 ? totalCounts[key].toFixed(1) : totalCounts[key]}</th>)}
        </tr>
        {addStatisticFromTotal(totalCols.keys, totalStats, showStatistics)}
      </tfoot>
    </table>
  );
}

export default QualisTableView;

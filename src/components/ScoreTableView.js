import '../App.css';
import {
  addStatisticFromTotal,
  updateTotalStats,
  getQualisScore,
  getTableClass,
  qualisScores
} from '../Utils/utils.js';

function ScoreTableView({init, end, stats, showStatistics}) {
  const dataCols = Object.keys(qualisScores);
  const totalCols = {
    keys: ['tot'],
    labels: ['Total'],
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

  const rows = [];
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
        const dataVal = getQualisScore(key, stats[key][currYear]);
        newRow.push(<td type='data'>{dataVal}</td>);
        yearTotalCounts['tot'] += dataVal;
        totalCounts[key] += dataVal;
        
        // increment data count with data val
        dataCounts[key] += stats[key][currYear];
      }

      for (const key of totalCols.keys) {
        newRow.push(<td type={totalCols.type}>{yearTotalCounts[key]}</td>);
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

  return (
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
          <th type="total"></th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
      <tfoot>
        <tr tag="total">
          <th type="year">Total</th>
          {dataCols.map(key => <th type="data">{totalCounts[key]}</th>)}
          {totalCols.keys.map(key => <th type={totalCols.type}>{totalCounts[key]}</th>)}
        </tr>
        {showStatistics ? addStatisticFromTotal(totalCols.keys, totalStats): null}
      </tfoot>
    </table>
  );
}

export default ScoreTableView;

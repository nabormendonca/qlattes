import '../App.css';

// get Qualis score for given category
function getQualisScore(qualisCategory, count) {
  const qualisScores = {
    A1: 100,
    A2: 85,
    A3: 70,
    A4: 55,
    B1: 40,
    B2: 30,
    B3: 20,
    B4: 10,
    C: 0,
    N: 0,
  };
  return qualisScores[qualisCategory] * count;
}

function ScoreTableView({init, end, stats, showStatistics}) {
  const firstCol = {
    label: 'Ano',
    type: 'year',
  };
  const dataCols = {
    keys: ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C', 'N'],
    labels: ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C', 'N'],
    type: 'data',
  };
  const totalCols = {
    keys: ['tot'],
    labels: ['Total'],
    type: 'total',
  };

  // reset total counts
  let totalCounts = {};
  for (const key of dataCols.keys) {
    totalCounts[key] = 0;
  }
  for (const key of totalCols.keys) {
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
      for (const key of dataCols.keys) {
        const dataVal = getQualisScore(key, stats[key][currYear]);
        newRow.push(<td type='data'>{dataVal}</td>);
        yearTotalCounts['tot'] += dataVal;
        totalCounts[key] += dataVal;
      }

      for (const key of totalCols.keys) {
        newRow.push(<td type={totalCols.type}>{yearTotalCounts[key]}</td>);
        // increment total count
        totalCounts[key] += yearTotalCounts[key];
      }

      rows.push(<tr>{newRow}</tr>);
    }
  }

  const rowHeight = 20.5;
  let tableClass = "styled-table";
  if (rowHeight*rows.length > window.innerHeight*0.55) {
    tableClass += ' has-scroll';
  }

  return (
    <table class={tableClass} id="score-table" tag="view">
      <thead>
        <tr>
          <th type={firstCol.type}>{firstCol.label}</th>
          {dataCols.labels.map(dataElem => <th type={dataCols.type}>{dataElem}</th>)}
          {totalCols.labels.map(totalElem => <th type={totalCols.type}>{totalElem}</th>)}
        </tr>
        <tr><th type="year"></th><th type="data">100 pts</th><th type="data">85 pts</th><th type="data">70 pts</th><th type="data">55 pts</th><th type="data">40 pts</th><th type="data">30 pts</th><th type="data">20 pts</th><th type="data">10 pts</th><th type="data">0 pts</th><th type="data">0 pts</th><th type="data"></th></tr>
      </thead>
      <tbody>{rows}</tbody>
      <tfoot>
        <tr tag="total">
          <th type="year">Total</th>
          {dataCols.keys.map(key => <th type={dataCols.type}>{totalCounts[key]}</th>)}
          {totalCols.keys.map(key => <th type={totalCols.type}>{totalCounts[key]}</th>)}
        </tr>
      </tfoot>
    </table>
  );
}

export default ScoreTableView;

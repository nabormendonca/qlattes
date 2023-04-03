import '../App.css';

function QualisTableView({init, end, stats, showStatistics}) {
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
    keys: ['totA', 'totB', 'totABC'],
    labels: ['#A', '#B', 'Total'],
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
        newRow.push(<td type='data'>{stats[key][currYear]}</td>);
        const keyChar = key.slice(0, 1);

        if (keyChar == 'A') {
          yearTotalCounts['totA'] += stats[key][currYear];
        } else if (keyChar == 'B') {
          yearTotalCounts['totB'] += stats[key][currYear];
        }
        yearTotalCounts['totABC'] += stats[key][currYear];
        totalCounts[key] += stats[key][currYear];
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
  const maxHeight = window.innerHeight*0.50;
  if (rowHeight*rows.length > maxHeight) {
    tableClass += ' has-scroll';
  }

  return (
    <table class={tableClass} id="qualis-table">
      <thead><tr>
        <th type={firstCol.type}>{firstCol.label}</th>
        {dataCols.labels.map(dataElem => <th type={dataCols.type}>{dataElem}</th>)}
        {totalCols.labels.map(totalElem => <th type={totalCols.type}>{totalElem}</th>)}
      </tr></thead>
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

export default QualisTableView;

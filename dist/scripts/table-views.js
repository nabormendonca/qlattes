//
// table views lib
//

function updateQualisTableView(stats, startYear, endYear) {
  const tableId = 'qualis-table';
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
    keys: ['totA', 'totB', 'tot', 'percA', 'percB'],
    labels: ['Tot A', 'Tot B', 'Total', '% A', '% B'],
    type: 'total',
  };

  const removeTags = ['view'];

  updateTableView(
    tableId,
    stats,
    removeTags,
    firstCol,
    dataCols,
    totalCols,
    startYear,
    endYear,
    // getKeyDataVal function
    (stats, currYear, key) => {
      // return key data in stats for the given year
      return stats[key][currYear];
      // parseFloat(
    },
    // updateYearTotalCounts function
    (yearTotalCounts, stats, currYear, key) => {
      yearTotalCounts['tot'] += stats[key][currYear];
      // increment year total counts based on col val
      const keyChar = key.slice(0, 1);
      if (keyChar == 'A') {
        yearTotalCounts['totA'] += stats[key][currYear];
      } else if (keyChar == 'B') {
        yearTotalCounts['totB'] += stats[key][currYear];
      }
      // return updated yearTotalCounts
      return yearTotalCounts;
    }
  );
  // adjust column table widths to accommodate the widest column
  const dataSelector = 'th[type="data"], td[type="data"]';
  const totalSelector =
    'th[type="total"], td[type="total"], th[type="percent"], td[type="percent"]';
  const padding = 16;
  adjustColumnWidths(tableId, dataSelector, totalSelector, padding);
}

function updateScoreTableView(stats, areaData, startYear, endYear) {
  const tableId = 'qualis-table';
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
    keys: ['totA', 'totB', 'tot', 'percA', 'percB'],
    labels: ['Tot A', 'Tot B', 'Total', '% A', '% B'],
    type: 'total',
  };

  const removeTags = ['view'];

  updateTableView(
    tableId,
    stats,
    removeTags,
    firstCol,
    dataCols,
    totalCols,
    startYear,
    endYear,
    // getKeyDataVal function
    (stats, currYear, key) => {
      // return key data in stats for the given year
      return stats[key][currYear];
    },
    // updateYearTotalCounts function
    (yearTotalCounts, stats, currYear, key) => {
      yearTotalCounts['tot'] += stats[key][currYear];
      // increment year total counts based on col val
      const keyChar = key.slice(0, 1);
      if (keyChar == 'A') {
        yearTotalCounts['totA'] += stats[key][currYear];
      } else if (keyChar == 'B') {
        yearTotalCounts['totB'] += stats[key][currYear];
      }
      // return updated yearTotalCounts
      return yearTotalCounts;
    }
  );

  // add Qualis scores to score table header

  // get score table element
  const scoreTable = document.querySelector('#qualis-table');

  // get score table header
  const scoreTableHead = scoreTable.querySelector('thead');

  // create score row and add it to score table header
  const scoreRow = document.createElement('tr');
  scoreRow.setAttribute('type', 'score');
  scoreTableHead.appendChild(scoreRow);
  // scoreTableHead.insertBefore(scoreRow, scoreTableHead.firstChild);

  // create first cell for year label
  const scoreRowFirstCell = document.createElement('th');
  scoreRowFirstCell.setAttribute('type', 'score-label');
  scoreRowFirstCell.textContent = '';
  scoreRow.appendChild(scoreRowFirstCell);

  // create qualis score data cells
  for (const key of dataCols.keys) {
    // create new score row cell
    const scoreRowCell = document.createElement('th');
    scoreRowCell.setAttribute('type', 'score');
    const cellScore = getQualisScore(key, 1, areaData.scores);
    scoreRowCell.textContent = `${cellScore} ${cellScore <= 1 ? 'pt' : 'pts'}`;
    scoreRow.appendChild(scoreRowCell);
  }

  // create qualis score total cells
  for (const key of totalCols.keys) {
    // create new score row cell
    const scoreRowCell = document.createElement('th');
    if (key.slice(0, 1) === 'p') {
      scoreRowCell.setAttribute('type', 'percent');
    } else {
      scoreRowCell.setAttribute('type', totalCols.type);
    }
    scoreRowCell.setAttribute('type', 'score');
    scoreRow.appendChild(scoreRowCell);
  }

  // adjust column table widths to accommodate the widest column
  const dataSelector =
    'th[type="data"], th[type="score"], td[type="data"], td[type="score"]';
  const totalSelector =
    'th[type="total"], th[type="score-total"], td[type="total"], td[type="score-total"], th[type="percent"], td[type="percent"]';
  const padding = 16;
  adjustColumnWidths(tableId, dataSelector, totalSelector, padding);

  // insert or update area scores source and link after score table
  const messageHTML = `Fonte da pontuação: <a href="${areaData.source.url}" target="_blank" title="Visualizar ${areaData.source.label}">${areaData.source.label}</a> da ${areaData.label} (ano-base: ${areaData.base_year})`;
  insertMessageAfter(scoreTable, messageHTML, 'area-scores-source', 'view');
}

function updateTableView(
  tableId,
  stats,
  removeTags,
  firstCol,
  dataCols,
  totalCols,
  startYear,
  endYear,
  getKeyDataVal,
  updateYearTotalCounts,
  scores = null
) {
  // get stats input state (if available)
  const statsState = getInputState('stats');
  // console.log(statsState);

  // remove elements with given tags
  for (const tag of removeTags) {
    removeElements(`[tag="${tag}"]`);
  }

  // create stats check box
  const form = document.querySelector('#form-filters');
  createCheckBoxes(
    form,
    [{ id: 'stats-input', label: 'Exibir estatísticas' }],
    'view'
  );

  // get view div element
  const div = document.querySelector('#view-div');

  // create new table element and insert it immediately after the div element
  const table = document.createElement('table');
  // table.setAttribute('class', 'styled-table');
  setAttributes(table, {
    class: 'styled-table',
    id: tableId,
    tag: 'view',
  });
  div.insertAdjacentElement('beforeend', table);

  // create table header
  const tableHead = document.createElement('thead');
  table.appendChild(tableHead);

  // create table header row
  const tableHeadRow = document.createElement('tr');
  tableHead.appendChild(tableHeadRow);

  // create the first table head row cell (for the year column)
  const tableHeadRowFirstCell = document.createElement('th');
  setAttributes(tableHeadRowFirstCell, {
    type: firstCol.type,
  });
  tableHeadRowFirstCell.textContent = firstCol.label;
  tableHeadRow.appendChild(tableHeadRowFirstCell);

  // create the header row cells for data labels
  for (const label of dataCols.labels) {
    if (label !== '') {
      // create new table head row cell
      const tableHeadRowCountCell = document.createElement('th');
      tableHeadRowCountCell.setAttribute('type', dataCols.type);
      tableHeadRowCountCell.textContent = label;
      tableHeadRow.appendChild(tableHeadRowCountCell);
    }
  }

  // create the header row cells for total labels
  for (const label of totalCols.labels) {
    // create new table head row cell
    const tableHeadRowTotalCell = document.createElement('th');
    tableHeadRowTotalCell.textContent = label;
    if (label.slice(0, 1) === '%') {
      tableHeadRowTotalCell.setAttribute('type', 'percent');
    } else {
      tableHeadRowTotalCell.setAttribute('type', totalCols.type);
    }
    tableHeadRow.appendChild(tableHeadRowTotalCell);
  }

  // reset data counts
  let dataCounts = {};
  for (const key of dataCols.keys) {
    // create data count if data col label is non empty
    if (dataCols.labels[dataCols.keys.indexOf(key)] !== '') {
      dataCounts[key] = 0;
    }
  }

  // reset total counts
  let totalCounts = {};
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

  // create table body
  const tableBody = document.createElement('tbody');
  table.appendChild(tableBody);

  // create table body rows with data and total cols grouped by year
  // (in reverse chronological order)
  for (let currYear = 0; currYear < stats.year.length; currYear++) {
    if (stats.year[currYear] >= startYear && stats.year[currYear] <= endYear) {
      // create new row for current year
      const newRow = document.createElement('tr');
      // create new cell with current year
      const newYearCell = document.createElement('td');
      newYearCell.setAttribute('type', 'year');
      newYearCell.textContent = stats.year[currYear];
      // add new cell to current row
      newRow.appendChild(newYearCell);

      // reset year total counts
      let yearTotalCounts = {};
      for (const key of totalCols.keys) {
        yearTotalCounts[key] = 0;
      }
      // create cells with data cols
      for (const key of dataCols.keys) {
        // create table cell if data col label is non empty
        if (dataCols.labels[dataCols.keys.indexOf(key)] !== '') {
          const dataVal =
            scores === null
              ? getKeyDataVal(stats, currYear, key)
              : getKeyDataVal(stats, currYear, key, scores);
          // increment data count with data val
          dataCounts[key] += dataVal;
          // create new table cell
          const newCell = document.createElement('td');
          // assign result of data val function to new cell
          newCell.textContent = formatNumber(dataVal, 3);
          newCell.setAttribute('type', dataCols.type);
          // add new cell to current row
          newRow.appendChild(newCell);
        }
        // increment year total counts
        yearTotalCounts = updateYearTotalCounts(
          yearTotalCounts,
          stats,
          currYear,
          key
        );
      }
      // update total stats
      totalStats = updateTotalStats(
        totalStats,
        yearTotalCounts,
        stats.year[currYear]
      );
      // create cells with total cols
      for (const key of totalCols.keys) {
        // create new table cell
        const newCell = document.createElement('td');
        // assign year total count to new cell
        if (key.slice(0, 1) === 'p') {
          newCell.textContent = formatNumber(
            totalStats[key].countList[currYear],
            1
          );
          newCell.setAttribute('type', 'percent');
        } else {
          // newCell.textContent = formatNumber(yearTotalCounts[key], 3);
          newCell.textContent = formatNumber(
            totalStats[key].countList[currYear],
            3
          );
          newCell.setAttribute('type', totalCols.type);
        }
        // add new cell to current row
        newRow.appendChild(newCell);
        // increment total count
        totalCounts[key] += yearTotalCounts[key];
      }
      // add current row to table body
      tableBody.appendChild(newRow);
    }
  }

  // create table footer
  const tableFoot = document.createElement('tfoot');
  table.appendChild(tableFoot);

  // add total footer row
  addTableFootRow(
    tableFoot,
    'total',
    'Total',
    dataCounts,
    totalCounts,
    totalStats,
    (col, dataCounts, totalCounts) => {
      if (Object.keys(dataCounts).includes(col)) {
        return { type: 'data', content: formatNumber(dataCounts[col], 3) };
      } else {
        const colChar = col.slice(0, 1);
        if (colChar === 'p') {
          // handle percentage total col
          const totCol = 'tot' + col.slice(4);
          const totPercVal = (totalCounts[totCol] / totalCounts.tot) * 100;
          return {
            type: 'percent',
            content: formatNumber(totPercVal, 1),
          };
        } else {
          return { type: 'total', content: formatNumber(totalCounts[col], 2) };
        }
      }
    }
  );

  addTableStatsRows(
    tableFoot,
    dataCounts,
    totalCounts,
    totalStats,
    'stats',
    'none'
  );

  // create stats checkbox input listener
  const statsInput = document.querySelector('#stats-input');
  statsInput.addEventListener('change', function () {
    if (endYear - startYear > 0) {
      if (this.checked) {
        const statsRows = document.querySelectorAll('[tag="stats"]');
        for (const statRow of statsRows) {
          statRow.style.display = '';
        }
      } else {
        const statsRows = document.querySelectorAll('[tag="stats"]');
        for (const statRow of statsRows) {
          statRow.style.display = 'none';
        }
      }
    }
  });

  // set stats input state
  if (statsState) {
    const statsInput = document.querySelector('#stats-input');
    statsInput.checked = statsState;
    statsInput.dispatchEvent(new Event('change'));
  }
}

function addTableStatsRows(
  tableFoot,
  dataCounts,
  totalCounts,
  totalStats,
  tag,
  display = ''
) {
  // mean row
  addTableFootRow(
    tableFoot,
    tag,
    'Média',
    dataCounts,
    totalCounts,
    totalStats,
    (col, dataCounts, totalCounts, totalStats) => {
      // console.log('col', col, 'totalCounts', totalCounts);
      if (Object.keys(totalCounts).includes(col)) {
        const colContent =
          col.slice(0, 1) === 'p'
            ? totalStats[col].countList.mean().toFixed(1)
            : totalStats[col].countList.mean().toFixed(2);
        return {
          type: 'total',
          content: colContent,
          // .replace('.', ','),
        };
      } else {
        return { type: 'data', content: '' };
      }
    },
    display
  );

  // median row
  addTableFootRow(
    tableFoot,
    tag,
    'Mediana',
    dataCounts,
    totalCounts,
    totalStats,
    (col, dataCounts, totalCounts, totalStats) => {
      if (Object.keys(totalCounts).includes(col)) {
        const colContent =
          col.slice(0, 1) === 'p'
            ? totalStats[col].countList.median().toFixed(1)
            : totalStats[col].countList.mean().toFixed(2);
        return {
          type: 'total',
          content: colContent,
          // .replace('.', ','),
        };
      } else {
        return { type: 'data', content: '' };
      }
    },
    display
  );

  // trend row
  addTableFootRow(
    tableFoot,
    tag,
    'Tendência',
    dataCounts,
    totalCounts,
    totalStats,
    (col, dataCounts, totalCounts, totalStats) => {
      if (Object.keys(totalCounts).includes(col)) {
        const colContent = linearRegression(
          totalStats[col].yearList,
          totalStats[col].countList
        ).slope.toFixed(2);
        return {
          type: 'total',
          content: colContent,
          // .replace('.', ','),
        };
      } else {
        return { type: 'data', content: '' };
      }
    },
    display
  );

  // best year row
  addTableFootRow(
    tableFoot,
    tag,
    'Melhor ano',
    dataCounts,
    totalCounts,
    totalStats,
    (col, dataCounts, totalCounts, totalStats) => {
      if (Object.keys(totalCounts).includes(col)) {
        return {
          type: 'total',
          content:
            totalStats[col].best.year > 0 ? totalStats[col].best.year : '',
        };
      } else {
        return { type: 'data', content: '' };
      }
    },
    display
  );
}

// function removeTableFooter(tableFoot, footTag) {
//   removeElements(`[tag='${footTag}']`);
// }

function addTableFootRow(
  tableFoot,
  footTag,
  rowLabel,
  dataCounts,
  totalCounts,
  totalStats,
  getCellContentType,
  display = ''
) {
  // create table footer row
  const tableFootRow = document.createElement('tr');
  setAttributes(tableFootRow, { tag: footTag, style: `display: ${display};` });
  tableFoot.appendChild(tableFootRow);

  // create the first footer row cell (for the row label)
  const tableFootRowFirstCell = document.createElement('th');
  tableFootRowFirstCell.textContent = rowLabel;
  tableFootRowFirstCell.setAttribute('type', 'label');
  tableFootRow.appendChild(tableFootRowFirstCell);

  for (const colBlock of [dataCounts, totalCounts]) {
    // create the footer row cells for col block
    for (const col of Object.keys(colBlock)) {
      // create new footer total row cell
      const tableFootRowCell = document.createElement('th');
      // get cell content and type
      const cellContentType = getCellContentType(
        col,
        dataCounts,
        totalCounts,
        totalStats
      );
      // set cell type
      if (col.slice(0, 1) === 'p') {
        tableFootRowCell.setAttribute('type', 'percent');
      } else {
        tableFootRowCell.setAttribute('type', cellContentType.type);
      }
      tableFootRowCell.textContent = cellContentType.content;
      // add new foot row cell to table footer row
      tableFootRow.appendChild(tableFootRowCell);
    }
  }
}

function updateTopPapersView(pubInfo, startYear, endYear, topN) {
  // delete current view it already exists
  removeElements("[tag='view']");

  // get view div element
  const div = document.querySelector('#view-div');

  // create new table element and insert it immediately after the div element
  const table = document.createElement('table');
  table.setAttribute('class', 'styled-table');
  setAttributes(table, {
    id: 'top-papers-table',
    tag: 'view',
  });
  div.insertAdjacentElement('beforeend', table);

  // create table header
  const tableHead = document.createElement('thead');
  table.appendChild(tableHead);

  // create table header row
  const tableHeadRow = document.createElement('tr');
  tableHead.appendChild(tableHeadRow);

  const tableHeadRowLabels = [
    '#',
    'Ano',
    'Título',
    'Periódico',
    'ISSN',
    'Qualis',
    'Ano-base',
  ];

  // create header row cells
  for (const label of tableHeadRowLabels) {
    // create new table head row cell
    const tableHeadRowCell = document.createElement('th');

    // set head type according to top paper attribute
    if (['Título', 'Periódico', 'ISSN'].includes(label)) {
      tableHeadRowCell.setAttribute('type', 'text');
    }

    tableHeadRowCell.textContent = label;
    tableHeadRow.appendChild(tableHeadRowCell);
  }

  // create table body
  const tableBody = document.createElement('tbody');
  table.appendChild(tableBody);

  // select top N publications from pubInfo within start and end years
  const topPubs = selectTopPublications(pubInfo, startYear, endYear, topN);

  // create paper index
  let index = 1;

  // create table body rows with top papers info
  for (const topPub of topPubs) {
    // create new row
    const newRow = document.createElement('tr');

    // create first row cell for paper index
    const newFirstCell = document.createElement('td');
    newFirstCell.setAttribute('type', 'number');

    // assign row index to first cell
    newFirstCell.textContent = index;

    // add first cell to current row
    newRow.appendChild(newFirstCell);

    // create the remaining row cells for the top paper attributes
    for (const key of Object.keys(topPub)) {
      // create new row cell
      const newCell = document.createElement('td');

      // set cell type according to top paper attribute
      if (['title', 'pubName'].includes(key)) {
        newCell.setAttribute('type', 'text');
      }

      // assign top paper attribute to new cell
      newCell.textContent = topPub[key];

      // add new cell to current row
      newRow.appendChild(newCell);
    }

    // add current row to table body
    tableBody.appendChild(newRow);

    // increment paper index
    index++;
  }
}

function selectTopPublications(pubInfo, startYear, endYear, topN = 5) {
  // create empty publication array
  var pubArray = [];

  // build publication array from PubInfo
  for (const pubInfoElem of pubInfo) {
    // select PubInfo elements within given start and end years
    if (pubInfoElem.year >= startYear && pubInfoElem.year <= endYear) {
      // process publication elements of current year
      for (const pubItem of pubInfoElem.pubList) {
        // create publication entry
        const pubEntry = {
          year: pubInfoElem.year,
          title: pubItem.title,
          pubName: pubItem.pubName,
          issn: pubItem.issn,
          qualis: pubItem.qualis,
          baseYear: pubItem.baseYear,
        };

        // insert publication entry into publication array
        pubArray.push(pubEntry);
      }
    }
  }
  // sort publication array by Qualis classification
  const sortedPubArray = pubArray.sortByKeys(['qualis']);

  // return top N publications from sorted publication array
  return sortedPubArray.slice(0, topN);
}

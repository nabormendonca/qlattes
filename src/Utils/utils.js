/*global chrome*/

/**
 * Mathematical util functions
 */

// calculate the max, sum, mean, and median of an array
Array.prototype.max = function () {
  return Math.max.apply(null, this);
};

Array.prototype.sum = function () {
  return this.reduce((a, b) => a + b, 0);
};

Array.prototype.mean = function () {
  return this.reduce((a, b) => a + b, 0) / this.length;
};

Array.prototype.median = function () {
  const mid = Math.floor(this.length / 2);
  const sorted = this.slice().sort((a, b) => a - b);
  return this.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
};

// sort an array of objects by their keys
Array.prototype.sortByKeys = function (keys) {
  var sortedArray = this.slice();

  for (const key of keys.reverse()) {
    sortedArray.sort((a, b) => (a[key] < b[key] ? -1 : 1));
  }

  return sortedArray;
};

// linear regression implementation based on code from https://github.com/heofs/trendline/
export function linearRegression(xData, yData) {
  // average of X values and Y values
  const xMean = xData.mean();
  const yMean = yData.mean();

  // Subtract X or Y mean from corresponding axis value
  const xMinusxMean = xData.map((val) => val - xMean);
  const yMinusyMean = yData.map((val) => val - yMean);

  const xMinusxMeanSq = xMinusxMean.map((val) => Math.pow(val, 2));

  const xy = [];
  for (let x = 0; x < xData.length; x++) {
    xy.push(xMinusxMean[x] * yMinusyMean[x]);
  }

  const xySum = xy.sum();

  // b1 is the slope
  const b1 = xySum / xMinusxMeanSq.sum();
  // b0 is the start of the slope on the Y axis
  const b0 = yMean - b1 * xMean;

  return {
    slope: b1,
    yStart: b0,
    calcY: (x) => b0 + b1 * x,
  };
}

/**
 * Data functions
 */


//
// Fetch URL functions
//

// fetch JSON from URL
export async function fetchJSON(url) {
  var json = [];

  // fetch url
  const response = await fetch(url);

  // check response status
  if (response.status === 200) {
    // get response contents
    json = await response.json();
  } else {
    // log response status code and text
    console.log(response.status);
    console.log(response.statusText);
  }

  return json;
}

export async function updateLattesData() {
  const lattesData = await chrome.storage.local.get('lattes_data');

  let authorNameLinkList = [];
  if (Object.keys(lattesData).length !== 0)
    for (const [link, info] of Object.entries(lattesData['lattes_data'])) {
      authorNameLinkList.push({ link, name: info.name});
    }
  return authorNameLinkList;
}

export async function getLattesAuthorStats(authorLink) {
  const lattesData = await chrome.storage.local.get('lattes_data');
  let authorStats = {
    stats: [],
    minYear: NaN,
    maxYear: NaN,
    totalPubs: NaN,
    pubInfo: [],
  };
  // If there is no data saved yet
  if (Object.keys(lattesData).length == 0) return authorStats;

  // get Lattes stats for author link
  var match = lattesData['lattes_data'][authorLink];

  if (match) {
    // add missing years (if any) to author stats
    authorStats = addMissingYearsToAuthorStats(
      match.statsInfo.stats,
      match.statsInfo.pubInfo
    );

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

export function addMissingYearsToAuthorStats(stats, pubInfo) {
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

export async function exportCV(authorLink, areaData) {
  // get Lattes data for current author
  const lattesData = await chrome.storage.local.get('lattes_data');
  if (Object.keys(lattesData).length == 0) {
    alert('Não achamos nenhum CV salvo.');
    return;
  }

  const authorData = lattesData['lattes_data'][authorLink];
  console.log('authorLink', authorLink)
  console.log('authorData', authorData)
  console.log('lattesData[lattes_data]', lattesData['lattes_data'])
  if (!authorData) {
    alert('Não achamos dados salvos sobre esse CV.');
    return;
  }

  const pubInfo =
    'statsInfo' in authorData
      ? authorData.statsInfo.pubInfo
      : authorData.pubInfo;
  if (pubInfo.length > 0) {
    // get area select
    const areaSelect = document.getElementById('area-select');
    const areaString =
      areaSelect.value !== '' && areaSelect.value !== 'undefined'
        ? ` utilizando a pontuação da ${areaData.label}`
        : '';

    // confirm export file action
    var result = window.confirm(
      `Confirma a exportação dos dados do CV de ${authorData.name} para o formato CSV${areaString}?`
    );
    if (result) {
      console.log('export CV data action confirmed!');

      // export CV data to external file
      exportCVDataToFile(authorLink, authorData.name, pubInfo, areaData);
    }
  } else {
    alert('Este CV não possui dados de publicações em periódico.');
  }
}

function exportCVDataToFile(authorLink, name, authorData, areaData) {
  // export author data in CSV format
  chrome.downloads.download({
    url:
      'data:text/csv;charset=utf-8,' +
      encodeURIComponent(convertLattesDataToCSV(authorLink, name, authorData, areaData)),
    filename: `${removeSpecialChars(authorData.name)}.csv`,
  });
}

function convertLattesDataToCSV(authorLink, name, pubInfo, areaData) {
  const headers = [
    'nome',
    'lattes_url',
    'ano_publicacao',
    'titulo_publicacao',
    'periodico',
    'issn',
    'qualis',
    'pontos',
    'area',
    'ano_base',
  ];
  // get area label and scores (if available)
  var areaLabel = '';
  var areaScores;
  if (typeof areaData !== 'undefined' && areaData.area !== 'undefined') {
    areaLabel = areaData.label;
    areaScores = areaData.scores;
  }
  
  const rows = [];
  for (const pubInfoElem of pubInfo) {
    for (const pubListElem of pubInfoElem.pubList) {
      const row = [
        `"${name}"`,
        authorLink,
        pubInfoElem.year,
        `"${pubListElem.title}"`,
        `"${pubListElem.pubName}"`,
        pubListElem.issn,
        pubListElem.qualis,
        pubListElem.qualis !== 'N'
          ? getQualisScore(pubListElem.qualis, 1, areaScores)
          : '',
        pubListElem.qualis !== 'N' ? areaLabel : '',
        pubListElem.baseYear,
      ];
      rows.push(row);
    }
  }
  const csvArray = [headers.join(','), ...rows.map((row) => row.join(','))];
  return csvArray.join('\n');
}

/**
 * String manipulation functions
 */


// normalize string so it can safely be used as a file name
function removeSpecialChars(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/gi, '')
    .replace(/ /g, '_')
    .toLowerCase();
}

/**
 * Data stats util functions
 */

// update total data stats
export function updateTotalStats(totalStats, yearCounts, year) {
  for (const key of Object.keys(yearCounts)) {
    // update total stats lists
    totalStats[key].countList.push(yearCounts[key]);
    totalStats[key].yearList.push(year);

    // update total stats best
    if (yearCounts[key] > totalStats[key].best.count) {
      totalStats[key].best.count = yearCounts[key];
      totalStats[key].best.year = year;
    }
  }
  return totalStats;
}

// get total stats max count
export function getMaxCount(totalStats) {
  return totalStats.tot.countList.max();
}

export function getBoundedTrendPoint(regression, x, xList, yBound) {
  let newX = parseFloat(x);
  let newXIndex = xList.indexOf(Math.round(newX));
  let y = regression.calcY(newX);

  if (isNaN(y)) return { x: 0, y: 0 };

  if (y < yBound.min) {
    newX = (yBound.min - regression.yStart) / regression.slope;
    newXIndex = xList.indexOf(Math.round(newX));
    return { x: newXIndex, y: yBound.min };
  } else if (y > yBound.max) {
    newX = (yBound.max - regression.yStart) / regression.slope;
    newXIndex = xList.indexOf(Math.round(newX));
    return { x: newXIndex, y: yBound.max };
  }

  return { x: newXIndex, y: y };
}

export function addStatisticFromTotal(totalCols, totalStats) {
  // add new foot row cell to table footer row
  let meanRow = []
  let medianRow = []
  let trendRow = []
  let bestYearRow = []

  // add empty cells
  for (const col of Object.keys(qualisScores)) {
    meanRow.push(<th type="data"></th>);
    medianRow.push(<th type="data"></th>);
    trendRow.push(<th type="data"></th>);
    bestYearRow.push(<th type="data"></th>);
  }

  // Best Year
  for (const col of totalCols) {
    meanRow.push(<th type='total'>{totalStats[col].countList
      .mean()
      .toFixed(2)
      .replace('.', ',')}</th>);
    medianRow.push(<th type='total'>{totalStats[col].countList
      .median()
      .toFixed(2)
      .replace('.', ',')}</th>);
    trendRow.push(<th type='total'>{linearRegression(
      totalStats[col].yearList,
      totalStats[col].countList
    )
      .slope.toFixed(2)
      .replace('.', ',')}</th>);
    bestYearRow.push(<th type='total'>{totalStats[col].best.year > 0 ? totalStats[col].best.year : ''}</th>);
  }

  return (<>
    <tr> <th type="label">Média</th> {meanRow} </tr>
    <tr> <th type="label">Mediana</th> {medianRow} </tr>
    <tr> <th type="label">Tendência</th> {trendRow} </tr>
    <tr> <th type="label">Melhor ano</th> {bestYearRow} </tr>
  </>)
}

export function getTableClass(rowsLength) {
  const rowHeight = 20.5;
  const statsTableMaxHeight = 0.5;
  const maxHeight = window.innerHeight*statsTableMaxHeight;
  const bodyHeight = rowHeight*rowsLength;
  if (bodyHeight > maxHeight) {
    return "styled-table has-scroll";
  }
  return "styled-table";
}

export function getStatisticsAnnotations(totalStats, showStatistics, end, init) {
  const lineAnnotations = [];

  if (showStatistics && end - init > 0) {
    // create mean line annotation
    const mean = totalStats.tot.countList.mean().toFixed(2);    
    lineAnnotations.push({
      id: "mean",
      type: 'line',
      mode: 'horizontal',
      borderColor: '#2c4c8c',
      value: mean,
      scaleID: "y",
      borderWidth: 1,
      borderDash: [6, 6],
      label: {
        content: 'Média ' + mean.replace('.', ','),
        position: 'end',
        padding: 4,
        backgroundColor: 'rgba(44, 76, 140, 0.7)',
        font: {
          size: 11,
        },
        z: 10,
        display: true,
      }
    });
    
    // create median line annotation
    const median = totalStats.tot.countList.median().toFixed(2);
    lineAnnotations.push({
      id: "median",
      type: 'line',
      mode: 'horizontal',
      borderColor: '#2c4c8c',
      value: median,
      scaleID: "y",
      borderWidth: 1,
      borderDash: [4, 4],
      label: {
        content: 'Mediana ' + median.replace('.', ','),
        position: '50%',
        padding: 4,
        backgroundColor: 'rgba(44, 76, 140, 0.7)',
        font: {
          size: 11,
        },
        z: 10,
        display: true,
      }
    });

    // get max counts in totalStats
    const maxCount = totalStats.tot.countList.max();

    // create trend line annotation
    const regression = linearRegression(
      totalStats.tot.yearList,
      totalStats.tot.countList
    );
    const minPoint = getBoundedTrendPoint(
      regression,
      init,
      totalStats.tot.yearList.slice().reverse(),
      {
        min: 0,
        max: maxCount,
      }
    );
    const maxPoint = getBoundedTrendPoint(
      regression,
      end,
      totalStats.tot.yearList.slice().reverse(),
      {
        min: 0,
        max: maxCount,
      }
    );
    lineAnnotations.push({
      id: "trend",
      type: 'line',
      borderColor: '#2c4c8c',
      xMin: minPoint.x,
      xMax: maxPoint.x,
      xScaleID: 'x',
      yMin: minPoint.y.toFixed(2),
      yMax: maxPoint.y.toFixed(2),
      yScaleID: 'y',
      borderWidth: 1,
      borderDash: [2, 2],
      label: {
        content: 'Tendência ' + regression.slope.toFixed(2).replace('.', ','),
        position: 'end',
        padding: 4,
        backgroundColor: 'rgba(44, 76, 140, 0.7)', // 'rgba(0, 0, 0, 0.7)',
        font: {
          size: 11,
        },
        z: 10,
        display: true,
      }
    })
  }

  return lineAnnotations;
}

export function getGraphicInfo(datasets, years, totalStats, showStatistics, end, init) {  
  const lineAnnotations = getStatisticsAnnotations(totalStats, showStatistics, end, init);
  const options = {
    plugins: {
      annotation: {
        annotations: lineAnnotations
      },
      legend: {
        position: 'top',
      },
    },
    // responsive: true,
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
      },
      y: {
        stacked: true,
        grid: {
          display: false,
        },
      },
    },
    borderWidth: 1,
    minBarThickness: 5,
    maxBarThickness: 12,
  };
  
  const data = {
    labels: years.filter(year => year >= init && year <= end).map(year => year.toString()).reverse(),
    datasets
  };

  return { options, data }
}

/**
 * Qualis util functions
 */

export const qualisScores = {
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

// get Qualis score for given category
export function getQualisScore(qualisCategory, count) {
  return qualisScores[qualisCategory] * count;
}

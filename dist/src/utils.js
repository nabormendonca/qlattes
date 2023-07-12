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

// sort an array of objects by their keys
Array.prototype.sortByKeysReverse = function (keys) {
  var sortedArray = this.slice();

  for (const key of keys.reverse()) {
    sortedArray.sort((a, b) => (a[key] > b[key] ? -1 : 1));
  }

  return sortedArray;
};

// linear regression implementation based on code from https://github.com/heofs/trendline/
export function linearRegression(xData, yData) {
  xData = xData.map(xItem => Number(xItem));
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

export const roundNumber = (number) => {
  return number.toString().indexOf('.') !== -1 ? number.toFixed(1) : number;
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
 * Fetch URL functions
 */

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


/**
 * Data functions - CRUD
 */

export async function getLattesData() {
  const lattesData = await chrome.storage.local.get('lattes_data');
  
  return lattesData['lattes_data'] || {};
}

export async function getAuthorData(author) {
  const lattesData = await getLattesData();
  
  return lattesData[author];
}

export async function getAreasData() {
  const areasData = await fetchJSON(chrome.runtime.getURL('data/qualis-scores-by-area-2017-2020.json'));
  
  return areasData || [];
}

export async function getGroups() {
  let groupsData = await chrome.storage.local.get('groupData');

  return groupsData['groupData'] || {};
}

export async function getArea() {
  const areaData = await chrome.storage.local.get(['area_data']);
  
  return areaData;
}

export async function addNewGroup(groupName, authors) {
  const groupsData = await getGroups();
  const ids = Object.keys(groupsData);

  const lastId = ids.length === 0 ? 0 : ids[Object.keys(groupsData).length-1];
  groupsData[Number(lastId)+1] = {
    name: groupName,
    authors: authors
  };

  // Save it back
  await chrome.storage.local.set({ groupData: groupsData });
}

export async function deleteGroup(group) {
  const groupsData = await getGroups();

  delete groupsData[group];

  // Save it back
  await chrome.storage.local.set({ groupData: groupsData });
}

export async function addCVinGroup(group, selectedAuthors) {
  const groupsData = await getGroups();
  const groupData = groupsData[group];
  groupData.authors = groupData.authors.concat(selectedAuthors); 
  
  await chrome.storage.local.set({ groupData: groupsData });
}

export async function removeCVfromGroup(group, author) {
  const groupsData = await getGroups();
  const groupData = groupsData[group];

  groupData.authors = groupData.authors.filter(currAuthor => currAuthor !== author);
  
  await chrome.storage.local.set({ groupData: groupsData });
}

// delete CV data from lattes data and save it back to local storage area
export async function removerCVfromDB(author) {
  const lattesData = await getLattesData();
  const groupsData = await getGroups();

  // check if there is an 
  if (Object.keys(lattesData).length == 0) {
    alert('Não achamos nenhum CV salvo.');
    return;
  }

  // delete author data from Lattes data
  delete lattesData[author];

  // remove author from all groups
  Object.keys(groupsData).forEach(async(group) => {
    await removeCVfromGroup(group, author);
  });

  // save Lattes data back to storage area
  await chrome.storage.local.set({ lattes_data: lattesData }).then(() => {
    console.log('Lattes data removed!');
  });
}

/**
 * Exports
 */
export async function exportGroupCV(authors, areaData) {
  const lattesData = await getLattesData();

  const authorsData = Object.keys(lattesData)
    .map(authorLink => authors.includes(authorLink) ? {link: authorLink, ...lattesData[authorLink]} : null)
    .filter(author => author !== null);

  let authorsName = [];
  let removedAuthors = [];
  authorsData.forEach((authorData) => {
    const pubInfo = authorData.pubInfo;
    if ((Array.isArray(pubInfo) && pubInfo.length > 0) 
      || (typeof pubInfo === 'object' && Object.entries(pubInfo).length > 0)) {
      // get area label
      
      authorsName.push(authorData.name);
    } else {
      removedAuthors.push(authorData.name);
    }
  });

  const areaString = Object.keys(areaData).length !== 0
  ? ` utilizando a pontuação da ${areaData.label}`
  : '';

  const authorsNameString = authorsName.map((authorName, index) => index === 0 ? authorName : index === authorsName.length-1 ? " e "+authorName : ", "+authorName);
  const removedAuthorsString = removedAuthors.map((authorName, index) => index === 0 ? authorName : index === authorsName.length-1 ? " e "+authorName : ", "+authorName);

  if (removedAuthors.length !== 0) 
    alert('Estes CV não possuem dados de publicações em periódico: ' + removedAuthorsString);

  if (authorsName !== 0) {
    var result = window.confirm(
      `Confirma a exportação dos dados do CV de ${authorsNameString} para o formato CSV${areaString}?`
    );
    if (result) {
      // export CV data to external file
      exportCVDataToFile(authorsData, areaData);
    }
  }
}

export async function exportCV(authorLink, areaData) {
  const authorData = await getAuthorData(authorLink);
  const pubInfo = authorData.pubInfo;

  if ((Array.isArray(pubInfo) && pubInfo.length > 0) 
    || (typeof pubInfo === 'object' && Object.entries(pubInfo).length > 0)) {
    // get area label
    const areaString = Object.keys(areaData).length !== 0
        ? ` utilizando a pontuação da ${areaData.label}`
        : '';

    var result = window.confirm(
      `Confirma a exportação dos dados do CV de ${authorData.name} para o formato CSV${areaString}?`
    );
    if (result) {
      // export CV data to external file
      exportCVDataToFile([authorData], areaData);
    }
  } else {
    alert('Este CV não possui dados de publicações em periódico.');
  }
}

function exportCVDataToFile(authorsData, areaData) {
  // export author data in CSV format
  chrome.downloads.download({
    url:
      'data:text/csv;charset=utf-8,' +
      encodeURIComponent(convertLattesDataToCSV(authorsData, areaData)),
    filename: `CVs.csv`,
  });
}

function convertLattesDataToCSV(authorsData, areaData) {
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
  if (Object.keys(areaData).length !== 0) {
    areaLabel = areaData.label;
    areaScores = areaData.scores;
  }
  
  const rows = [];
  authorsData.forEach((authorData) => {
    for (const pubInfoYear of Object.keys(authorData.pubInfo)) {
      for (const pubListElem of authorData.pubInfo[pubInfoYear]) {
        const row = [
          `"${authorData.name}"`,
          authorData.link,
          pubInfoYear,
          `"${pubListElem.title}"`,
          `"${pubListElem.pubName}"`,
          pubListElem.issn,
          pubListElem.qualis,
          pubListElem.qualis !== 'N' && areaLabel !== ''
            ? getQualisScore(pubListElem.qualis, 1, areaScores)
            : '',
          pubListElem.qualis !== 'N' ? areaLabel : '',
          pubListElem.baseYear,
        ];
        rows.push(row);
      }
    }
  });
  
  const csvArray = [headers.join(','), ...rows.map((row) => row.join(','))];
  return csvArray.join('\n');
}

/**
 * Data functions
 */

export function addMissingYearsToAuthorStats(stats, pubInfo) {
  const newStats = {};
  // reset new stats count lists
  for (const key of Object.keys(stats)) {
    newStats[key] = [];
  }

  const newPubInfo = {};
  const lastYear = new Date().getFullYear();
  const firstYear = Object.keys(pubInfo)[0];
  for (let year = lastYear; year >= firstYear; year--) {
    // add empty counts to missing year stats
    
    if (Object.keys(pubInfo).includes(year)) {
      newPubInfo[year] = pubInfo[year];
    } else {
      newPubInfo[year] = [];
    }
      
  }

  let currYear = new Date().getFullYear() + 1;
  for (const pubInfoYear of Object.keys(pubInfo).reverse()) {
    // add empty results for missing years (if any)
    for (let year = currYear - 1; year > pubInfoYear; year--) {
      // add empty counts to missing year stats
      for (const key of Object.keys(newStats)) {
        if (key === 'year') {
          newStats[key].push(year);
        } else {
          newStats[key].push(0);
        }
      }
    }

    // copy current year counts to new stats
    for (const key of Object.keys(newStats)) {
      newStats[key].push(stats[key][pubInfoYear]);
    }

    // update current year
    currYear = pubInfoYear;
  }

  return {
    stats: stats,
    minYear: NaN,
    maxYear: NaN,
    totalPubs: NaN,
    pubInfo: newPubInfo,
  };
}


export function addMissingYearsToPubInfo(pubInfo) {
  const newPubInfo = {};
  const lastYear = new Date().getFullYear();
  const firstYear = Object.keys(pubInfo)[0];
  for (let year = lastYear; year >= firstYear; year--) {
    // add empty counts to missing year stats
    if (Object.keys(pubInfo).includes(year.toString())) {
      newPubInfo[year] = pubInfo[year];
    } else {
      newPubInfo[year] = [];
    }
  }

  return newPubInfo;
}

export function getQualisStats(pubInfo, metric = 'qualis', scores = {}) {
  const qualisCats = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C', 'N'];
  const qualisCols = ['year'].concat(qualisCats);
  
  // reset Qualis stats
  const qualisStats = {};
  for (const col of qualisCols) {
    qualisStats[col] = [];
  }
  // reset year counts
  const yearCounts = {};
  for (const cat of qualisCats) {
    yearCounts[cat] = 0;
  }
  var currYear = 0;
  for (const pubInfoElem of Object.keys(pubInfo)) {
    if (currYear !== pubInfoElem) {
      if (currYear > 0) {
        // add current year counts to Qualis results
        for (const key of Object.keys(yearCounts)) {
          qualisStats[key].push(yearCounts[key]);
        }
        // reset year counts
        for (const key of Object.keys(yearCounts)) {
          yearCounts[key] = 0;
        }
      }
      // update current year
      currYear = pubInfoElem;
      // add current year to Qualis counts
      qualisStats.year.push(currYear);
    }
    // increment year counts for each publication based on given metric
    for (const pubItem of pubInfo[pubInfoElem]) {
      if (metric === 'qualis') {
        yearCounts[pubItem.qualis] += 1;
      } else if (metric === 'score' && Object.keys(scores).length > 0) {
        yearCounts[pubItem.qualis] += parseFloat(
          getQualisScore(pubItem.qualis, 1, scores)
        );
      } else if (metric === 'jcr') {
        yearCounts[pubItem.qualis] += parseFloat(pubItem.jcr);
      }
    }
  }
  if (qualisStats.year.length > qualisStats.A1.length) {
    // add year counts to Qualis stats
    for (const key of Object.keys(yearCounts)) {
      qualisStats[key].push(yearCounts[key]);
    }
  }

  return qualisStats;
}

// get Qualis score for given category
export function getQualisScore(qualisCategory, count, areaScores) {
  return areaScores[qualisCategory] * count;
}


/**
 * Graph functions
 */

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
        content: 'Média ' + mean,
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
        content: 'Mediana ' + median,
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
        content: 'Tendência ' + regression.slope.toFixed(2),
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
    responsive: true,
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
    labels: years.filter(year => year >= init && year <= end).map(year => year.toString()),
    datasets
  };

  return { options, data }
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
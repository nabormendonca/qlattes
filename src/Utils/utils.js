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

export async function updateLattesData() {
  const lattesData = await chrome.storage.local.get('lattes_data');

  let authorNameLinkList = [];
  for (const lattesDataElem of lattesData['lattes_data']) {
    authorNameLinkList.push(lattesDataElem.nameLink);
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

/**
 * Qualis util functions
 */

export const dataCols = {
  keys: ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C', 'N'],
  labels: ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C', 'N'],
  type: 'data',
};
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

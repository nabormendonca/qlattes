//
// Mathematical util functions
//

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
function linearRegression(xData, yData) {
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

//
// HTML util functions
//

// define a set of attributes for an HTML element
function setAttributes(elem, attrs) {
  for (const key of Object.keys(attrs)) {
    elem.setAttribute(key, attrs[key]);
  }
}

// insert an HTML element after a given reference element
function insertAfter(referenceNode, newNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

// remove all HTML elements matched by selector
function removeElements(selector) {
  // get all elements matching selector
  const elems = document.querySelectorAll(selector);

  // remove matched elements
  for (const elem of elems) {
    elem.remove();
  }
}

// insert a given number of line breaks before/after a given reference HTML element
function insertLineBreaks(
  referenceNode,
  where = 'before',
  number_breaks,
  attributes
) {
  for (let i = 1; i <= number_breaks; i++) {
    // create line break element
    const brElem = document.createElement('br');
    // define attributes
    setAttributes(brElem, attributes);
    // insert before or after reference node
    if (where == 'before') {
      referenceNode.parentNode.insertBefore(brElem, referenceNode);
    } else if (where == 'after') {
      insertAfter(referenceNode, brElem);
    }
  }
}

//
// Data stats util functions
//

// update total data stats
function updateTotalStats(totalStats, yearCounts, year) {
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
function getMaxCount(totalStats) {
  return totalStats.tot.countList.max();
}

//
// Qualis util functions
//

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

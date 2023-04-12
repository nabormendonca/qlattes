//
// utils lib
//

//
// Array functions
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

// insert a given element after a given reference element
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

// insert or update a message with given id, tag, and style after a given reference element
function insertMessageAfter(
  referenceNode,
  messageHTML,
  messageId,
  MessageTag,
  MessageStyle = ''
) {
  // get message  element by Id
  var messageElem = document.getElementById(messageId);
  if (messageElem === null) {
    // create message element
    messageElem = document.createElement('p');
    setAttributes(messageElem, {
      id: messageId,
      tag: MessageTag,
      style: MessageStyle,
    });
    // insert message after reference node
    insertAfter(referenceNode, messageElem);
  }
  // update message
  messageElem.innerHTML = messageHTML;
}

// insert a given number of line breaks before/after a given reference element
function insertLineBreaks(
  referenceNode,
  where = 'before',
  number_breaks,
  attributes = {}
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

function createDivElemWithIcon(
  // parentElem,
  divAttributes,
  elemType,
  elemAttributes,
  iconAttributes
) {
  // create icon div element
  const div = document.createElement('div');
  setAttributes(div, divAttributes);

  // create element
  const elem = document.createElement(elemType);
  setAttributes(elem, elemAttributes);

  // append element to div
  div.append(elem);

  if (iconAttributes) {
    // create icon element
    const iconElem = document.createElement('i');
    setAttributes(iconElem, iconAttributes);

    // prepend icon element to div
    div.prepend(iconElem);
  }

  // // append div to parent element
  // parentElem.appendChild(div);

  return {
    div: div,
    elem: elem,
  };
}

function createCheckBoxes(parentElem, boxes, tag) {
  for (const box of boxes) {
    // create box input element
    const boxInput = document.createElement('input');
    setAttributes(boxInput, {
      type: 'checkbox',
      id: box.id,
      tag: tag,
    });

    // add box input immediately after sibling element
    parentElem.insertAdjacentElement('beforeend', boxInput);

    // create box label
    const boxLabel = document.createElement('label');
    setAttributes(boxLabel, {
      for: box.id,
      id: box.id + '-label',
      tag: tag,
    });
    boxLabel.textContent = box.label;

    // add box label immediately after box input
    insertAfter(boxInput, boxLabel);
  }
}

function getInputState(tag) {
  // attempt to get input element
  const input = document.querySelector('#' + tag + '-input');

  return input ? input.checked : false;
}

function findElementsInBetween(startElem, endElem, selector) {
  const elements = [];
  let elem = startElem.nextElementSibling;
  while (elem && elem !== endElem && elem !== document.body) {
    if (elem.matches(selector)) {
      elements.push(elem);
    }
    elem = elem.nextElementSibling;
  }
  return elements;
}

function findNextElementWithClass(startElement, className) {
  let currentElement = startElement.nextElementSibling;
  while (currentElement) {
    if (currentElement.classList.contains(className)) {
      return currentElement;
    }
    currentElement = currentElement.nextElementSibling;
  }
  return null;
}

function adjustColumnWidths(tableId, dataSelector, totalSelector) {
  // Get CSS root widths
  const rootStyles = getComputedStyle(document.documentElement);
  const labelCellWidth = parseInt(
    rootStyles.getPropertyValue('--qualis-table-label-cols-width'),
    10
  ); //90
  const minDataCellWidth = parseInt(
    rootStyles.getPropertyValue('--qualis-table-data-cols-width'),
    10
  );
  const minTotalCellWidth = parseInt(
    rootStyles.getPropertyValue('--qualis-table-total-cols-width'),
    10
  );
  const percentCellWidth = parseInt(
    rootStyles.getPropertyValue('--qualis-table-percent-cols-width'),
    10
  );
  const scrollBarOffset = parseInt(
    rootStyles.getPropertyValue('--qualis-table-scroll-bar-offset'),
    10
  );

  let maxDataCellWidth = 0;
  let maxTotalCellWidth = 0;

  const table = document.getElementById(tableId);
  table.querySelectorAll('tr').forEach((row) => {
    // find max data cell width
    row.querySelectorAll(dataSelector).forEach((cell) => {
      let cellWidth = cell.offsetWidth;
      if (maxDataCellWidth < cellWidth) {
        maxDataCellWidth = cellWidth;
      }
    });
    // save row's current display property
    const display = row.style.display;
    // make row (temporarily?) visible
    row.style.display = '';
    // find max total cell width
    row.querySelectorAll(totalSelector).forEach((cell) => {
      let cellWidth = cell.offsetWidth;
      // console.log(cell.getAttribute('type'), cell.textContent, cellWidth);
      if (
        cell.getAttribute('type') === 'total' &&
        maxTotalCellWidth < cellWidth
      ) {
        maxTotalCellWidth = cellWidth;
      }
    });
    // restore row's previous display property
    row.style.display = display;
  });

  console.log(
    'maxDataCellWidth',
    maxDataCellWidth,
    'maxTotalCellWidth',
    maxTotalCellWidth
  );

  const dataCellWidth = Math.max(minDataCellWidth, maxDataCellWidth);
  const totalCellWidth = Math.max(minTotalCellWidth, maxTotalCellWidth);

  // Set the width of all cells in each data or total column to the width of the widest cell in each column category
  table.querySelectorAll('tr').forEach((row) => {
    // adjust data cell widths
    row.querySelectorAll(dataSelector).forEach((cell) => {
      cell.style = `width: ${dataCellWidth}px;`;
    });
    // adjust total cell widths
    row.querySelectorAll(totalSelector).forEach((cell) => {
      if (cell.getAttribute('type') === 'total') {
        cell.style = `width: ${totalCellWidth}px;`;
      }
    });
  });
  // get table width
  var minTableWidth = labelCellWidth + scrollBarOffset;
  const row = table.querySelector('tr');
  // add data cols widths
  row.querySelectorAll(dataSelector).forEach(() => {
    minTableWidth += dataCellWidth;
  });
  // add total cols widths
  row.querySelectorAll(totalSelector).forEach((cell) => {
    minTableWidth +=
      cell.getAttribute('type') === 'percent'
        ? percentCellWidth
        : totalCellWidth;
  });
  // adjust table width
  table.style = `min-width: ${minTableWidth}px;`;
}

//
// Data stats util functions
//

function getQualisStats(pubInfo, metric = 'qualis', scores = {}) {
  const qualisCats = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C', 'N'];
  const qualisCols = ['year'].concat(qualisCats);
  console.log(qualisCats, qualisCols);
  // reset Qualis stats
  const qualisStats = {};
  for (const col of qualisCols) {
    qualisStats[col] = [];
  }
  console.log('qualisStats:', qualisStats);
  // reset year counts
  const yearCounts = {};
  for (const cat of qualisCats) {
    yearCounts[cat] = 0;
  }
  var currYear = 0;
  for (let i = 0; i < pubInfo.length; i++) {
    // console.log('year', currYear);
    // console.log('yearCounts', yearCounts);
    if (currYear != pubInfo[i].year) {
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
      currYear = pubInfo[i].year;
      // add current year to Qualis counts
      qualisStats.year.push(currYear);
    }
    // increment year counts for each publication based on given metric
    for (const pubItem of pubInfo[i].pubList) {
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

// update total data stats
function updateTotalStats(totalStats, yearCounts, year) {
  // console.log('year counts', yearCounts);
  for (const key of Object.keys(yearCounts)) {
    const keyChar = key.slice(0, 1);
    if (keyChar === 'p') {
      // handle percentage cols
      const totalKey = 'tot' + key.slice(4);
      const percVal =
        yearCounts.tot > 0 ? (yearCounts[totalKey] / yearCounts.tot) * 100 : 0;
      // update total stats lists
      totalStats[key].countList.push(percVal);
      totalStats[key].yearList.push(year);
      // update total stats best
      if (percVal > totalStats[key].best.count) {
        totalStats[key].best.count = percVal;
        totalStats[key].best.year = year;
      }
    } else {
      // update total stats lists
      totalStats[key].countList.push(yearCounts[key]);
      totalStats[key].yearList.push(year);
      // update total stats best
      if (yearCounts[key] > totalStats[key].best.count) {
        totalStats[key].best.count = yearCounts[key];
        totalStats[key].best.year = year;
      }
    }
  }
  return totalStats;
}

// get total stats max count
function getMaxCount(totalStats) {
  return totalStats.tot.countList.max();
}

//
/// String manipulation functions
//

// normalize string so it can safely be used as a file name
function removeSpecialChars(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/gi, '')
    .replace(/ /g, '_')
    .toLowerCase();
}

//
// Fetch URL functions
//

// fetch JSON from URL
async function fetchJSON(url) {
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

//
// Qualis util functions
//
function getQualisScore(qualisCat, count, scores) {
  if (typeof scores === 'undefined') return '';
  if (qualisCat == 'N') return 0;
  return parseFloat(
    (scores[qualisCat] * count).toFixed(3).replace(/\.?0*$/, '')
  );
}

//
// Formatting functions
//

function formatNumber(num, maxDecimalPlaces) {
  if (typeof num !== 'number') return num;

  // Convert to string and remove thousand separator
  let trimmedNumber = num.toString().replace(/\,/g, '');

  // Remove trailing zeros and decimal separator if unnecessary
  trimmedNumber = parseFloat(trimmedNumber)
    .toFixed(maxDecimalPlaces)
    .replace(/\.?0+$/, '');

  return trimmedNumber;
}

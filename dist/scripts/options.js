// functions to calculate the max, sum, mean, and median of an array
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

// function to sort and array of objects by their keys
Array.prototype.sortByKeys = function (keys) {
  var sortedArray = this.slice();

  for (const key of keys.reverse()) {
    sortedArray.sort((a, b) => (a[key] < b[key] ? -1 : 1));
  }

  return sortedArray;
};

// define global view form data
var authorNameLinkList;
var viewFilters;
var lattesData;

// add listener to track changes to Lattes data in storage area
chrome.storage.onChanged.addListener((changes, area) => {
  for (let [key, { newValue }] of Object.entries(changes)) {
    if (area == 'local' && key == 'lattes_data') {
      // console.log(newValue);

      updateLattesData(newValue);
    }
  }
});

// options page main function
(async () => await main())();

async function main() {
  // change current tab name
  document.title = 'QLattes';

  // get tabLink elements
  const tabLinks = document.getElementsByClassName('tablinks');

  // add tabLink listeners
  for (const tabLink of tabLinks) {
    tabLink.addEventListener('click', (event) => openTab(event));
  }

  // open default tab
  document.getElementById('default-tab').click();

  // get form element
  const form = document.querySelector('#form-filters');

  // create author select div
  const divElem = createDivElemWithIcon(
    form,
    {
      id: 'author-div',
      class: 'Icon-inside',
    },
    'select',
    {
      id: 'author-select',
    },
    {
      id: 'author-i',
      class: 'fa-solid fa-user',
      'aria-hidden': 'true',
    }
  );

  // get author select element
  const authorSelect = divElem.elem;

  // add author select listener
  authorSelect.addEventListener('change', (event) => handleAuthorSelect(event));

  // update author select form
  updateAuthorForm();
}

function updateLattesData(newLattesData) {
  if (newLattesData) {
    // update Lattes data
    lattesData['lattes_data'] = newLattesData;

    // create new name and link list from new Lattes data
    const newAuthorNameLinkList = [];
    for (const lattesDataElem of lattesData['lattes_data']) {
      newAuthorNameLinkList.push(lattesDataElem.nameLink);
      // console.log('new author list', newAuthorNameLinkList);
    }

    // get existing author names that must remain in the author select options
    const currAuthorsIn = authorNameLinkList.filter(({ link: link1 }) =>
      newAuthorNameLinkList.some(({ link: link2 }) => link1 === link2)
    );
    // console.log('existing authors in', currAuthorsIn);

    // check whether selected author has been removed from Lattes data
    if (!currAuthorsIn.find((elem) => elem.link === viewFilters.authorLink)) {
      // reload options page
      window.location.reload(true);
    }

    // get new author names that must be included in the author select options
    const newAuthorsIn = newAuthorNameLinkList.filter(
      ({ link: link1 }) =>
        !authorNameLinkList.some(({ link: link2 }) => link1 === link2)
    );
    // console.log('new authors in', newAuthorsIn);

    // update author name link list with existing and new authors names to remain or be included in the author select options
    authorNameLinkList = currAuthorsIn.concat(newAuthorsIn);

    // remove existing author select options
    removeElements("[tag='author-select-option']");

    // get author select element
    const authorSelect = document.getElementById('author-select');

    // create author select placeholder
    const placeholder =
      authorNameLinkList.length == 0
        ? 'Nenhum CV disponível'
        : 'Selecione um CV';

    // create hidden first author option with placeholder
    const placeholderOption = document.createElement('option');
    setAttributes(placeholderOption, {
      value: '',
      disabled: true,
      selected: true,
      hidden: true,
      class: 'option-class',
      tag: 'author-select-option',
    });
    placeholderOption.textContent = placeholder;

    authorSelect.appendChild(placeholderOption);

    // create remaining author select options
    for (const authorNameLink of authorNameLinkList) {
      const authorOption = document.createElement('option');
      setAttributes(authorOption, {
        value: authorNameLink.name,
        tag: 'author-select-option',
      });
      authorOption.textContent = authorNameLink.name;
      authorSelect.appendChild(authorOption);
    }
    authorSelect.value = viewFilters.authorName;
  } else {
    // reload options page
    window.location.reload(true);
  }
}

function openTab(event) {
  const tabDivs = document.getElementsByClassName('tabcontent');

  for (const tabDiv of tabDivs) {
    tabDiv.style.display = 'none';
  }

  const tabLinks = document.getElementsByClassName('tablinks');

  for (const tabLink of tabLinks) {
    tabLink.className = tabLink.className.replace(' active', '');
  }

  const tabDivId = event.target.closest('button').getAttribute('div');
  document.getElementById(tabDivId).style.display = 'block';
  event.currentTarget.className += ' active';
}

async function updateAuthorForm() {
  // reset view form data
  resetGlobalViewFormData();

  // remove view elements
  removeElements(
    "[tag='author-select-option'], [tag='clear-data'], [tag='total-pubs'], [tag='view'], [tag='view-type-filter'], [tag='view-year-filter']"
  );

  // Retrieve Lattes data from storage area
  console.log('Retrieving Lattes data from storage area...');
  lattesData = await chrome.storage.local.get('lattes_data');

  // check whether lattes data is not empty
  if (Object.keys(lattesData).length !== 0) {
    console.log('author data', lattesData['lattes_data']);

    // update name and link lists from Lattes data
    for (const lattesDataElem of lattesData['lattes_data']) {
      authorNameLinkList.push(lattesDataElem.nameLink);
      console.log('author list', authorNameLinkList);
    }
  }

  // get author select element
  const authorSelect = document.getElementById('author-select');

  // create author select placeholder
  const placeholder =
    authorNameLinkList.length == 0 ? 'Nenhum CV disponível' : 'Selecione um CV';

  // create hidden first author option with placeholder
  const placeholderOption = document.createElement('option');
  setAttributes(placeholderOption, {
    value: '',
    disabled: true,
    selected: true,
    hidden: true,
    class: 'option-class',
    tag: 'author-select-option',
  });
  placeholderOption.textContent = placeholder;

  authorSelect.appendChild(placeholderOption);

  // create the remaining options with author names
  for (let i = 0; i < authorNameLinkList.length; i++) {
    const authorOption = document.createElement('option');
    setAttributes(authorOption, {
      value: authorNameLinkList[i].name,
      tag: 'author-select-option',
    });
    authorOption.textContent = authorNameLinkList[i].name;
    authorSelect.appendChild(authorOption);
  }
}

function resetGlobalViewFormData() {
  authorNameLinkList = [];

  viewFilters = {
    authorName: '',
    authorLink: '',
    start: 0,
    end: 0,
    viewType: '',
  };

  lattesData = [];
}

function handleAuthorSelect(event) {
  event.preventDefault();

  console.log('Changed author to:', event.target.value);

  // get author select div
  const authorDiv = document.getElementById('author-div');

  // get clear data button element if it already exists
  var clearDataButton = document.querySelector(
    "button[id='clear-data-button']"
  );

  if (!clearDataButton) {
    // create clear data button
    clearDataButton = document.createElement('button');
    setAttributes(clearDataButton, {
      id: 'clear-data-button',
      title: 'Remover dados do CV',
      tag: 'clear-data',
    });
    clearDataButton.innerHTML =
      "<i class='fa-solid fa-trash-can' id='clear-data-i'></i>";

    // add clear data button to form after author select
    insertAfter(authorDiv, clearDataButton);

    // add form clear data  button handler
    clearDataButton.addEventListener('click', function (e) {
      e.preventDefault();

      // confirm clear data action
      var result = confirm(
        `Confirma a remoção dos dados extraídos do CV de ${viewFilters.authorName}?\n\nUma vez confirmada, para visualizar esses dados novamente, será necessário (re)abrir ou atualizar a página do CV no navegador.`
      );
      if (result) {
        console.log('clear data action confirmed!');

        // delete CV data from lattes data and save it back to local storage area
        deleteLattesAuthorData(viewFilters.authorLink);

        // update author form
        // updateAuthorForm();

        // reload options page
        window.location.reload(true);
      }
    });
  }

  // find selected author's link
  const match = authorNameLinkList.find(
    (elem) => elem.name === event.target.value
  );

  viewFilters.authorName = match.name;
  viewFilters.authorLink = match.link;

  // get author Lattes stats and publication info for selected author
  const authorStats = getLattesAuthorStats(viewFilters.authorLink);

  console.log('author stats', authorStats);

  // remove all view elements
  removeElements(
    "[tag='view'], [tag='view-type-filter'], [tag='view-year-filter']"
  );

  createTotalPubsElement(authorStats);

  if (authorStats.totalPubs > 0) {
    // update start and end year filters
    viewFilters.start = authorStats.minYear;
    viewFilters.end = authorStats.maxYear;

    // create view type filter
    createViewTypeFilter();
  }
}

function createDivElemWithIcon(
  parentElem,
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

  // append div to parent element
  parentElem.appendChild(div);

  return {
    div: div,
    elem: elem,
  };
}

function setAttributes(elem, attrs) {
  for (const key of Object.keys(attrs)) {
    elem.setAttribute(key, attrs[key]);
  }
}

function insertAfter(referenceNode, newNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function deleteLattesAuthorData(authorLink) {
  // delete author data from Lattes data
  const lattesDataArray = lattesData['lattes_data'].filter(
    (elem) => elem.nameLink.link != authorLink
  );

  // save Lattes data back to storage area
  chrome.storage.local.set({ lattes_data: lattesDataArray }).then(() => {
    console.log('Lattes data saved!');
  });
}

function getLattesAuthorStats(authorLink) {
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

function addMissingYearsToAuthorStats(stats, pubInfo) {
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

function createTotalPubsElement(authorStats) {
  // remove total pubs elements if they already exist
  removeElements("[tag='total-pubs']");

  // get form elements
  const form = document.querySelector("form[id='form-filters']");
  const authorSelect = document.querySelector('#author-select');
  const authorDiv = document.querySelector("div[id='author-div']");
  const clearDataButton = document.querySelector(
    "button[id='clear-data-button']"
  );

  // get reference node for inserting line breaks
  const referenceNode = clearDataButton ? clearDataButton : authorDiv;

  // insert one line break after reference node
  insertLineBreak(referenceNode, 'after', 1, { tag: 'total-pubs' });

  // create total pubs read only input
  const divElem = createDivElemWithIcon(
    form,
    {
      id: 'total-pubs-div',
      class: 'Icon-inside',
      tag: 'total-pubs',
    },
    'input',
    {
      id: 'total-pubs-input',
      tag: 'total-pubs',
      type: 'text',
      readonly: true,
    }
    // {
    //   id: 'total-pubs-i',
    //   class: 'fa-solid fa-file-lines',
    //   'aria-hidden': 'true',
    // }
  );

  const totalPubsDiv = divElem.div;
  const totalPubsInput = divElem.elem;

  if (authorStats.totalPubs > 0) {
    const pluralChar = authorStats.totalPubs > 1 ? 's' : '';

    const periodString =
      authorStats.minYear != authorStats.maxYear
        ? `entre ${authorStats.minYear} e ${authorStats.maxYear}`
        : `em ${authorStats.minYear}`;

    totalPubsInput.value = `${authorStats.totalPubs} artigo${pluralChar} em periódico${pluralChar} ${periodString}`;
  } else {
    totalPubsInput.value = `Nenhum artigo em periódico`;
  }

  // adjust total pubs width if lesser than author select's width
  let totalPubsInputWidth = parseInt(
    getComputedStyle(totalPubsInput).minWidth,
    10
  );

  totalPubsInputWidth =
    totalPubsInputWidth < authorSelect.offsetWidth
      ? authorSelect.offsetWidth
      : totalPubsInputWidth;

  totalPubsInput.style.width = totalPubsInputWidth + 'px';

  // insert one line break after total pubs div element
  insertLineBreak(totalPubsDiv, 'after', 1, {
    tag: 'total-pubs',
  });
}

function removeElements(selector) {
  // get all elements matching selector
  const elems = document.querySelectorAll(selector);

  // remove matched elements
  for (const elem of elems) {
    elem.remove();
  }
}

function insertLineBreak(
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

function createViewTypeFilter() {
  // add filters to popup form
  addViewTypeFilter();

  // get form element
  const form = document.querySelector("form[id='form-filters']");

  const viewTypeSelect = form.querySelector("select[id='view-type-select']");

  // add form view type select handler
  viewTypeSelect.addEventListener('change', function (e) {
    e.preventDefault();

    // update view filter value
    viewFilters.viewType = viewTypeSelect.value;

    // get author stats for new author selection
    const authorStats = getLattesAuthorStats(viewFilters.authorLink);

    const viewYearFilters = document.querySelectorAll(
      "[tag='view-year-filter']"
    );

    if (viewYearFilters.length == 0) {
      createViewYearFilters();
    }

    // Update view
    console.log('Updating view...');
    console.log(authorStats, viewFilters);
    updateView(authorStats);
  });
}

function addViewTypeFilter() {
  // remove view type filter elements if they already exist
  removeElements("[tag='view-type-filter']");

  // get author stats for new author selection
  //   const authorStats = getLattesAuthorStats(viewFilters.authorLink);

  // get form element
  const form = document.querySelector("form[id='form-filters']");

  // create view type select
  const divElem = createDivElemWithIcon(
    form,
    {
      id: 'view-type-div',
      class: 'Icon-inside',
      tag: 'view-type-filter',
    },
    'select',
    {
      id: 'view-type-select',
      tag: 'view-type-filter',
    },
    {
      id: 'view-type-i',
      class: 'fa-solid fa-chart-simple',
      'aria-hidden': 'true',
      tag: 'view-type-filter',
    }
  );

  const viewTypeDiv = divElem.div;
  const viewTypeSelect = divElem.elem;

  // create view type placeholder
  const placeholder = 'Selecione uma visualização';

  // create hidden first author option with placeholder
  const placeholderOption = document.createElement('option');
  setAttributes(placeholderOption, {
    value: '',
    disabled: true,
    selected: true,
    hidden: true,
  });
  placeholderOption.textContent = placeholder;

  viewTypeSelect.appendChild(placeholderOption);

  // create the remaining view type options
  const viewTypeOptions = {
    graphic: 'Gráfico de classificação Qualis',
    table: 'Tabela de classificação Qualis',
    top5: '5 melhores publicações',
    top10: '10 melhores  publicações',
  };

  let i = 0;
  for (const key of Object.keys(viewTypeOptions)) {
    const viewTypeOption = document.createElement('option');
    setAttributes(viewTypeOption, {
      id: `view-type-option-${i}`,
      value: key,
    });
    viewTypeOption.textContent = viewTypeOptions[key];
    viewTypeSelect.appendChild(viewTypeOption);
    i++;
  }
  //form.appendChild(viewTypeSelect);

  // insert two line breaks after view type select element
  insertLineBreak(viewTypeDiv, 'after', 1, {
    tag: 'view-type-filter',
  });
}

function createViewYearFilters() {
  // add filters to popup form
  addViewYearFilters();

  // get form element
  const form = document.querySelector("form[id='form-filters']");

  // get form filter elements
  const startInput = form.querySelector('#start-year-input');
  const endInput = form.querySelector('#end-year-input');
  const periodSelect = form.querySelector('#period-select');
  const periodSelectPlaceholder = form.querySelector(
    '#period-select-placeholder'
  );

  // add form start year input handler
  startInput.addEventListener('change', function (e) {
    e.preventDefault();

    // reset period select with placeholder
    periodSelectPlaceholder.selected = true;

    // get author stats for new author selection
    const authorStats = getLattesAuthorStats(viewFilters.authorLink);

    // make sure start and end year filter values are consistent
    startInput.value =
      startInput.value > endInput.value ? endInput.value : startInput.value;

    // check whether start year field has changed
    if (startInput.value != viewFilters.start) {
      // update start filter value
      viewFilters.start = parseInt(startInput.value);

      // Update view
      console.log('Updating view...');
      console.log(authorStats, viewFilters);
      updateView(authorStats);
    }
  });

  // add form end year input handler
  endInput.addEventListener('change', function (e) {
    e.preventDefault();

    // reset period select with placeholder
    periodSelectPlaceholder.selected = true;

    // get author stats for new author selection
    const authorStats = getLattesAuthorStats(viewFilters.authorLink);

    // make sure start and end year filter values are consistent
    endInput.value =
      endInput.value < startInput.value ? startInput.value : endInput.value;

    // check whether end year field has changed
    if (endInput.value != viewFilters.end) {
      // update start filter value
      viewFilters.end = parseInt(endInput.value);

      // Update view
      console.log('Updating view...');
      console.log(authorStats, viewFilters);
      updateView(authorStats);
    }
  });

  // add period select listener
  periodSelect.addEventListener('change', function (e) {
    e.preventDefault();

    if (periodSelect.value == '') {
      return;
    }

    // get author stats for new author selection
    const authorStats = getLattesAuthorStats(viewFilters.authorLink);

    // check period select value
    var startEnd;
    if (periodSelect.value == 'last5') {
      startEnd = getLastNYearsStartEnd(authorStats, 5);

      // update start and end year input values
      startInput.value = startEnd.start;
      endInput.value = startEnd.end;
    } else if (periodSelect.value == 'last10') {
      startEnd = getLastNYearsStartEnd(authorStats, 10);

      // update start and end year input values
      startInput.value = startEnd.start;
      endInput.value = startEnd.end;
    } else if (periodSelect.value == 'all') {
      // reset start and end year input values
      startInput.value = authorStats.minYear;
      endInput.value = authorStats.maxYear;
    }

    // update start and end year filter values
    viewFilters.start = startInput.value;
    viewFilters.end = endInput.value;

    // Update view
    console.log('Updating view...');
    console.log(authorStats, viewFilters);
    updateView(authorStats);
  });
}

function addViewYearFilters() {
  // get author stats for new author selection
  const authorStats = getLattesAuthorStats(viewFilters.authorLink);

  // get form element
  const form = document.querySelector("form[id='form-filters']");

  // create start year filter
  createDivElemWithIcon(
    form,
    {
      id: 'start-year-div',
      class: 'Icon-inside',
      tag: 'view-year-filter',
    },
    'input',
    {
      id: 'start-year-input',
      tag: 'view-year-filter',
      class: 'year-input',
      type: 'number',
      min: authorStats.minYear,
      max: authorStats.maxYear,
      value: authorStats.minYear,
      required: 'required',
    }
    // {
    //   class: 'fa-regular fa-calendar',
    //   'aria-hidden': 'true',
    //   id: 'start-year-i',
    // }
  );

  viewFilters.start = authorStats.minYear;

  const toLabel = document.createElement('label');
  setAttributes(toLabel, {
    id: 'start-year-end-year-label',
    tag: 'view-year-filter',
  });
  toLabel.textContent = 'a';
  form.appendChild(toLabel);

  // create end year filter
  createDivElemWithIcon(
    form,
    {
      id: 'end-year-div',
      class: 'Icon-inside',
      tag: 'view-year-filter',
    },
    'input',
    {
      id: 'end-year-input',
      tag: 'view-year-filter',
      class: 'year-input',
      type: 'number',
      min: authorStats.minYear,
      max: authorStats.maxYear,
      value: authorStats.maxYear,
      required: 'required',
    }
    // {
    //   class: 'fa-regular fa-calendar',
    //   'aria-hidden': 'true',
    //   id: 'end-year-i',
    // }
  );

  viewFilters.end = authorStats.maxYear;

  // create period select
  const divElem = createDivElemWithIcon(
    form,
    {
      id: 'period-div',
      class: 'Icon-inside',
      tag: 'view-year-filter',
    },
    'select',
    {
      id: 'period-select',
      tag: 'view-year-filter',
    },
    {
      id: 'period-i',
      class: 'fa-regular fa-calendar-check',
      'aria-hidden': 'true',
      tag: 'view-year-filter',
    }
  );

  // const periodDiv = divElem.div;
  const periodSelect = divElem.elem;

  // create period placeholder
  const placeholder = 'Selecione um período';

  // create hidden first period option with placeholder
  const placeholderOption = document.createElement('option');
  setAttributes(placeholderOption, {
    id: 'period-select-placeholder',
    value: '',
    disabled: true,
    selected: true,
    hidden: true,
  });
  placeholderOption.textContent = placeholder;

  periodSelect.appendChild(placeholderOption);

  // create the remaining period options
  const periodOptions = {
    last5: 'Últimos 5 anos',
    last10: 'Últimos 10 anos',
    all: 'Todo o período do CV',
  };

  let i = 0;
  for (const key of Object.keys(periodOptions)) {
    const periodOption = document.createElement('option');
    setAttributes(periodOption, {
      id: `period-option-${i}`,
      value: key,
    });
    periodOption.textContent = periodOptions[key];
    periodSelect.appendChild(periodOption);
    i++;
  }
}

function getLastNYearsStartEnd(authorStats, lastN) {
  // get current year
  const currYear = new Date().getFullYear();

  // calculate start of last N years period
  var startYear = currYear - lastN + 1;

  startYear = startYear < authorStats.minYear ? authorStats.minYear : startYear;

  return { start: startYear, end: currYear };
}

// Update view with Qualis data
function updateView(authorStats) {
  // update selected view type
  switch (viewFilters.viewType) {
    case 'graphic':
      updateGraphicView(authorStats.stats, viewFilters.start, viewFilters.end);
      break;
    case 'table':
      updateTableView(authorStats.stats, viewFilters.start, viewFilters.end);
      break;
    case 'top5':
      updateTopPapersView(
        authorStats.pubInfo,
        viewFilters.start,
        viewFilters.end,
        5
      );
      break;
    case 'top10':
      updateTopPapersView(
        authorStats.pubInfo,
        viewFilters.start,
        viewFilters.end,
        10
      );
      break;
  }
  // console.log(authorStats.pubInfo);
}

function updateGraphicView(stats, startYear, endYear) {
  let totalStats = {
    A: { best: { count: 0, year: 0 }, countList: [], yearList: [] },
    B: { best: { count: 0, year: 0 }, countList: [], yearList: [] },
    C: { best: { count: 0, year: 0 }, countList: [], yearList: [] },
    N: { best: { count: 0, year: 0 }, countList: [], yearList: [] },
    tot: { best: { count: 0, year: 0 }, countList: [], yearList: [] },
  };

  // get stats input state (if available)
  const statsState = getStatsInputState('stats');
  // console.log(statsState);

  // delete current view if it already exists
  removeElements("[tag='view']");

  // create stats check box
  const form = document.querySelector('#form-filters');
  createStatsCheckboxes(form, [
    { id: 'stats-input', label: 'Exibir estatísticas' },
  ]);

  // calculate author stats for the selected period
  for (let i = 0; i < stats.year.length; i++) {
    if (stats.year[i] >= startYear && stats.year[i] <= endYear) {
      const yearCounts = {
        A: 0,
        B: 0,
        C: 0,
        N: 0,
        tot: 0,
      };

      // accumulate year counts
      for (const key of Object.keys(stats)) {
        if (key == 'year') {
          continue;
        }

        const keyChar = key.slice(0, 1);

        // increment counts
        yearCounts[keyChar] += stats[key][i];
        yearCounts.tot += stats[key][i];
      }

      // update total stats
      totalStats = updateTotalStats(totalStats, yearCounts, stats.year[i]);
    }
  }

  // get view div element
  const div = document.querySelector('#view-div');

  // create canvas element
  const canvas = document.createElement('canvas');
  canvas.setAttribute('tag', 'view');

  // add canvas to view div
  div.append(canvas);

  const lineAnnotations = {};

  if (endYear - startYear > 0) {
    // create mean line annotation
    const mean = totalStats.tot.countList.mean().toFixed(2);
    const meanLine = createAnnotationLine(
      {
        xMin: totalStats.tot.yearList.indexOf(parseInt(startYear)),
        xMax: totalStats.tot.yearList.indexOf(parseInt(endYear)),
        xScaleID: 'x',
        yMin: mean,
        yMax: mean,
        yScaleID: 'y',
        label: {
          content: 'Média ' + mean.replace('.', ','),
          position: 'end',
          padding: 4,
          backgroundColor: 'rgba(44, 76, 140, 0.7)', // 'rgba(0, 0, 0, 0.7)',
          font: {
            size: 11,
          },
          z: 10,
          display: true,
        },
      },
      '#2c4c8c', //'rgba(0, 0, 0, 0.8)',
      1,
      [6, 6],
      'mean-input'
    );
    // console.log(meanLine);
    lineAnnotations.meanLine = meanLine;

    // create median line annotation
    const median = totalStats.tot.countList.median().toFixed(2);
    const medianLine = createAnnotationLine(
      {
        xMin: totalStats.tot.yearList.indexOf(parseInt(startYear)),
        xMax: totalStats.tot.yearList.indexOf(parseInt(endYear)),
        xScaleID: 'x',
        yMin: median,
        yMax: median,
        yScaleID: 'y',
        label: {
          content: 'Mediana ' + median.replace('.', ','),
          position: '50%',
          // xAdjust: 50,
          padding: 4,
          backgroundColor: 'rgba(44, 76, 140, 0.7)', // 'rgba(0, 0, 0, 0.7)',
          font: {
            size: 11,
          },
          z: 10,
          display: true,
        },
      },
      '#2c4c8c', //'rgba(0, 0, 0, 0.8)',
      1,
      [4, 4],
      'median-input'
    );
    // console.log(medianLine);
    lineAnnotations.medianLine = medianLine;

    // get max counts in totalStats
    const maxCount = getMaxCount(totalStats);

    // create trend line annotation
    const regression = linearRegression(
      totalStats.tot.yearList,
      totalStats.tot.countList
    );
    const minPoint = getBoundedTrendPoint(
      regression,
      startYear,
      totalStats.tot.yearList.slice().reverse(),
      {
        min: 0,
        max: maxCount,
      }
    );
    const maxPoint = getBoundedTrendPoint(
      regression,
      endYear,
      totalStats.tot.yearList.slice().reverse(),
      {
        min: 0,
        max: maxCount,
      }
    );
    // console.log(regression, minPoint, maxPoint);

    const trendLine = createAnnotationLine(
      {
        xMin: minPoint.x,
        xMax: maxPoint.x,
        xScaleID: 'x',
        yMin: minPoint.y.toFixed(2),
        yMax: maxPoint.y.toFixed(2),
        yScaleID: 'y',
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
        },
      },
      '#2c4c8c', //'rgba(0, 0, 0, 0.8)',
      1,
      [2, 2],
      'trend-input'
    );
    // console.log(trendLine);
    lineAnnotations.trendLine = trendLine;
  }
  console.log('line annotations', lineAnnotations);

  // create chart
  const chart = createChart(
    canvas,
    totalStats,
    startYear,
    endYear,
    lineAnnotations
  );

  // create stats checkbox input listener
  const statsInput = document.querySelector('#stats-input');
  statsInput.addEventListener('change', function () {
    // console.log(lineAnnotations);

    if (lineAnnotations) {
      for (const line of Object.keys(lineAnnotations)) {
        lineAnnotations[line].display = this.checked;
      }

      chart.options.plugins.annotation = {
        annotations: lineAnnotations,
      };
      chart.update('none');
    }
  });

  // set stats input state
  if (statsState) {
    const statsInput = document.querySelector('#stats-input');
    statsInput.checked = statsState;
    statsInput.dispatchEvent(new Event('change'));
  }
}

function getStatsInputState(tag) {
  // attempt to get stat input element
  const statsInput = document.querySelector('#' + tag + '-input');

  return statsInput ? statsInput.checked : false;
}

function createStatsCheckboxes(parentElem, boxes) {
  for (const box of boxes) {
    // create box input element
    const boxInput = document.createElement('input');
    setAttributes(boxInput, {
      type: 'checkbox',
      id: box.id,
      tag: 'view',
    });

    // add box input immediately after sibling element
    parentElem.insertAdjacentElement('beforeend', boxInput);

    // create box label
    const boxLabel = document.createElement('label');
    setAttributes(boxLabel, {
      for: box.id,
      id: box.id + '-label',
      tag: 'view',
    });
    boxLabel.textContent = box.label;

    // add box label immediately after box input
    insertAfter(boxInput, boxLabel);
  }
}

function getMaxCount(totalStats) {
  return totalStats.tot.countList.max();
}

function createAnnotationLine(
  annotationAttributes,
  color,
  borderWidth = 1,
  borderDash = []
) {
  const annotationLine = {
    type: 'line',
    borderColor: color,
    borderWidth: borderWidth,
    borderDash: borderDash,
    drawTime: 'afterDatasetsDraw',
    display: false,
    // enter: function ({ element }) {
    //   element.label.options.display = true;
    //   return true;
    // },
    // leave: function ({ element }) {
    //   element.label.options.display = false;
    //   return true;
    // },
  };

  // add annotation attributes
  for (const key of Object.keys(annotationAttributes)) {
    annotationLine[key] = annotationAttributes[key];
  }

  return annotationLine;
}

function getBoundedTrendPoint(regression, x, xList, yBound) {
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

// implementation based on code from https://github.com/heofs/trendline/
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

function createChart(canvas, totalStats, startYear, endYear, lineAnnotations) {
  Chart.defaults.backgroundColor = '#9BD0F5';
  Chart.defaults.borderColor = '#000';
  Chart.defaults.color = '#000';

  // category colors
  const categoryColors = {
    A: {
      // #415e98 (10% white over #2c4c8c)
      background: '#415e98',
      border: 'white',
      // // #2c4c8c
      // background: 'rgba(44, 76, 140, 0.5)',
      // border: 'rgba(44, 76, 140, 1.0)',
    },
    B: {
      // #8094ba (40% white over #2c4c8c)
      background: '#8094ba',
      border: 'white',
      // // #637ca9
      // background: 'rgba(99, 124, 169, 0.3)',
      // border: 'rgba(99, 124, 169, 1.0)',
    },
    C: {
      // ##c0c9dd (70% white over #2c4c8c)
      background: '#c0c9dd',
      border: 'white',
      // // #9babc5
      // background: 'rgba(155, 171, 197, 0.2)',
      // border: 'rgba(155, 171, 197, 1.0)',
    },
    N: {
      // ##eaedf4 (90% white over #2c4c8c)
      background: '#eaedf4',
      border: 'white',
      // // #d2dbe2 rgb(210,219,226)
      // background: 'rgba(210, 219, 226, 0.3)',
      // border: 'rgba(210, 219, 226, 1.0)',
    },
  };

  // create graphic datasets
  const datasets = [];
  for (const key of Object.keys(totalStats)) {
    if (key == 'tot') {
      continue;
    }

    datasets.push({
      label: key,
      data: totalStats[key].countList.slice().reverse(),
      backgroundColor: categoryColors[key].background,
      borderColor: categoryColors[key].border,
    });
  }

  // create graphic
  // eslint-disable-next-line no-undef
  const chart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: totalStats.A.yearList.slice().reverse(),
      datasets: datasets,
    },
    options: {
      plugins: {
        annotation: {
          annotations: lineAnnotations,
        },
        legend: {
          title: {
            display: true,
            text: 'Estrato',
            font: {
              size: 14,
              // color: 'rgba(0, 0, 0, 1.0)',
              family: 'sans-serif',
              // weight: 'bold',
            },
          },
          labels: {
            padding: 20,
          },
          position: 'top',
        },
      },
      scales: {
        x: {
          stacked: true,
          grid: {
            display: false,
          },
          ticks: {
            stepSize: 1,
            maxRotation: 80,
            font: {
              size: 11,
            },
          },
        },
        y: {
          stacked: true,
          grid: {
            display: false,
          },
          ticks: {
            stepSize: 1,
            font: {
              size: 11,
            },
          },
          beginAtZero: true,
        },
      },
      // indexAxis: 'y', // make the chart horizontal
      borderWidth: 1,
      // barThickness: 10,
      minBarThickness: 5,
      maxBarThickness: 12,
      responsive: false,
      // barPercentage: 1.0, //
      // categoryPercentage: 0.5, //
    },
  });

  return chart;
}

function updateTableView(stats, startYear, endYear) {
  // console.log(stats);

  const totalCounts = {
    A1: 0,
    A2: 0,
    A3: 0,
    A4: 0,
    B1: 0,
    B2: 0,
    B3: 0,
    B4: 0,
    C: 0,
    N: 0,
    totA: 0,
    totB: 0,
    tot: 0,
  };

  let totalStats = {
    totA: { best: { count: 0, year: 0 }, countList: [], yearList: [] },
    totB: { best: { count: 0, year: 0 }, countList: [], yearList: [] },
    tot: { best: { count: 0, year: 0 }, countList: [], yearList: [] },
  };

  // get stats input state (if available)
  const statsState = getStatsInputState('stats');
  // console.log(statsState);

  // delete current view if it already exists
  removeElements("[tag='view']");

  // create stats check box
  const form = document.querySelector('#form-filters');
  createStatsCheckboxes(form, [
    { id: 'stats-input', label: 'Exibir estatísticas' },
  ]);

  // get view div element
  const div = document.querySelector('#view-div');

  // create new table element and insert it immediately after the div element
  const table = document.createElement('table');
  // table.setAttribute('class', 'styled-table');
  setAttributes(table, {
    class: 'styled-table',
    id: 'stats-table',
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
  tableHeadRowFirstCell.setAttribute('type', 'year');
  tableHeadRowFirstCell.textContent = 'Ano';
  tableHeadRow.appendChild(tableHeadRowFirstCell);

  const tableHeadRowCountLabels = [
    'A1',
    'A2',
    'A3',
    'A4',
    'B1',
    'B2',
    'B3',
    'B4',
    'C',
    'N',
  ];

  const tableHeadRowTotalLabels = ['#A', '#B', '#Ano'];

  // create the header row count cells
  for (const label of tableHeadRowCountLabels) {
    // create new table head row cell
    const tableHeadRowCountCell = document.createElement('th');
    tableHeadRowCountCell.setAttribute('type', 'count');
    tableHeadRowCountCell.textContent = label;
    tableHeadRow.appendChild(tableHeadRowCountCell);
  }

  // create the header row total cells
  for (const label of tableHeadRowTotalLabels) {
    // create new table head row cell
    const tableHeadRowTotalCell = document.createElement('th');
    // if (label != 'last') {
    tableHeadRowTotalCell.setAttribute('type', 'total');
    tableHeadRowTotalCell.textContent = label;
    // } else {
    //   tableHeadRowTotalCell.setAttribute('type', 'last');
    //   tableHeadRowTotalCell.textContent = '';
    // }
    tableHeadRow.appendChild(tableHeadRowTotalCell);
  }

  // create table body
  const tableBody = document.createElement('tbody');
  table.appendChild(tableBody);

  // create table body rows with Qualis counts grouped by year (in reverse chronological order)
  for (let i = 0; i < stats.year.length; i++) {
    if (stats.year[i] >= startYear && stats.year[i] <= endYear) {
      // create new row for current year
      const newRow = document.createElement('tr');

      // create new cell with current year
      const newYearCell = document.createElement('td');
      newYearCell.setAttribute('type', 'year');
      newYearCell.textContent = stats.year[i];
      // add new cell to current row
      newRow.appendChild(newYearCell);

      const yearCounts = {
        totA: 0,
        totB: 0,
        tot: 0,
      };

      // create cells with year's Qualis and total counts
      for (const key of Object.keys(totalCounts)) {
        // create new table cell
        const newCell = document.createElement('td');

        const keyChar = key.slice(0, 1);
        if (
          keyChar == 'A' ||
          keyChar == 'B' ||
          keyChar == 'C' ||
          keyChar == 'N'
        ) {
          // assign Qualis count to new cell
          newCell.textContent = stats[key][i];
          newCell.setAttribute('type', 'count');

          // increment year counts
          if (keyChar == 'A') {
            yearCounts.totA += stats[key][i];
          } else if (keyChar == 'B') {
            yearCounts.totB += stats[key][i];
          }
          yearCounts.tot += stats[key][i];

          // increment total counts
          totalCounts[key] += stats[key][i];
        } else {
          // assign year count to new cell
          newCell.textContent = yearCounts[key];
          newCell.setAttribute('type', 'total');

          // increment total count
          totalCounts[key] += yearCounts[key];
        }

        // add new cell to current row
        newRow.appendChild(newCell);
      }

      // add current row to table body
      tableBody.appendChild(newRow);

      // update total stats
      totalStats = updateTotalStats(totalStats, yearCounts, stats.year[i]);
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
    totalCounts,
    totalStats,
    (key, totalCounts) => {
      if (key.slice(0, 3) == 'tot') {
        return { type: 'total', content: totalCounts[key] };
      } else {
        return { type: 'count', content: totalCounts[key] };
      }
    }
  );

  // create stats checkbox input listener
  const statsInput = document.querySelector('#stats-input');
  statsInput.addEventListener('change', function () {
    if (endYear - startYear > 0) {
      if (this.checked) {
        addTableStatsRows(tableFoot, totalCounts, totalStats, 'stats');
      } else {
        removeTableFooter(tableFoot, 'stats');
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

function addTableStatsRows(tableFoot, totalCounts, totalStats, tag) {
  // mean row
  addTableFootRow(
    tableFoot,
    tag,
    'Média',
    totalCounts,
    totalStats,
    (key, totalCounts, totalStats) => {
      if (key.slice(0, 3) == 'tot') {
        return {
          type: 'total',
          content: totalStats[key].countList
            .mean()
            .toFixed(2)
            .replace('.', ','),
        };
      } else {
        return { type: 'count', content: '' };
      }
    }
  );

  // median row
  addTableFootRow(
    tableFoot,
    tag,
    'Mediana',
    totalCounts,
    totalStats,
    (key, totalCounts, totalStats) => {
      if (key.slice(0, 3) == 'tot') {
        return {
          type: 'total',
          content: totalStats[key].countList
            .median()
            .toFixed(2)
            .replace('.', ','),
        };
      } else {
        return { type: 'count', content: '' };
      }
    }
  );

  // trend row
  addTableFootRow(
    tableFoot,
    tag,
    'Tendência',
    totalCounts,
    totalStats,
    (key, totalCounts, totalStats) => {
      if (key.slice(0, 3) == 'tot') {
        return {
          type: 'total',
          content: linearRegression(
            totalStats[key].yearList,
            totalStats[key].countList
          )
            .slope.toFixed(2)
            .replace('.', ','),
        };
      } else {
        return { type: 'count', content: '' };
      }
    }
  );

  // best year row
  addTableFootRow(
    tableFoot,
    tag,
    'Melhor ano',
    totalCounts,
    totalStats,
    (key, totalCounts, totalStats) => {
      if (key.slice(0, 3) == 'tot') {
        return {
          type: 'year',
          content:
            totalStats[key].best.year > 0 ? totalStats[key].best.year : '',
        };
      } else {
        return { type: 'count', content: '' };
      }
    }
  );
}

function removeTableFooter(tableFoot, footTag) {
  removeElements(`[tag='${footTag}']`);
}

function addTableFootRow(
  tableFoot,
  footTag,
  rowLabel,
  totalCounts,
  totalStats,
  footRowFunction
) {
  // create table footer row
  const tableFootRow = document.createElement('tr');
  tableFootRow.setAttribute('tag', footTag);
  tableFoot.appendChild(tableFootRow);

  // create the first footer row cell (for the row label)
  const tableFootRowFirstCell = document.createElement('th');
  tableFootRowFirstCell.textContent = rowLabel;
  tableFootRowFirstCell.setAttribute('type', 'label');
  tableFootRow.appendChild(tableFootRowFirstCell);

  // create the footer row cells for the total values
  for (const key of Object.keys(totalCounts)) {
    // create new footer total row cell
    const tableFootRowCell = document.createElement('th');
    // get cell content and type from foot row function
    const cellContentType = footRowFunction(key, totalCounts, totalStats);
    // set cell type
    tableFootRowCell.setAttribute('type', cellContentType.type);
    // set cell content
    tableFootRowCell.textContent = cellContentType.content;
    // add new foot row cell to table footer row
    tableFootRow.appendChild(tableFootRowCell);
  }

  // // create footer row last cell
  // const tableFootRowLastCell = document.createElement('th');
  // // set last cell type
  // tableFootRowLastCell.setAttribute('type', 'last');
  // // set last cell content
  // tableFootRowLastCell.textContent = '';
  // // add foot row last cell to table footer row
  // tableFootRow.appendChild(tableFootRowLastCell);
}

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
    'ISSN',
    'Periódico',
    'Qualis',
    'Ano-base',
  ];

  // create header row cells
  for (const label of tableHeadRowLabels) {
    // create new table head row cell
    const tableHeadRowCell = document.createElement('th');
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
      if (key == 'title') {
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
          issn: pubItem.issn,
          title: pubItem.title,
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

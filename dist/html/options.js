// define function to calculate the median of an array
Array.prototype.median = function () {
  return this.slice().sort((a, b) => a - b)[Math.floor(this.length / 2)];
};

// define global view form data
var authorNameLinkList;
var viewFilters;
var lattesData;

// add listener to track changes to Lattes data in storage area
chrome.storage.onChanged.addListener((changes, area) => {
  for (let [key, { newValue }] of Object.entries(changes)) {
    if (area == 'local' && key == 'lattes_data') {
      console.log(newValue);

      updateLattesData(newValue);
    }
  }
});

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

  // get author select element
  const authorSelect = document.getElementById('author-select');

  // add author select listeners
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
      console.log('new author list', newAuthorNameLinkList);
    }

    // get existing author names that must remain in the author select options
    const currAuthorsIn = authorNameLinkList.filter(({ link: link1 }) =>
      newAuthorNameLinkList.some(({ link: link2 }) => link1 === link2)
    );
    console.log('existing authors in', currAuthorsIn);

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
    console.log('new authors in', newAuthorsIn);

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
  console.log({ tabDivId });
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
    viewType: 'table',
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
        `Confirma a remoção dos dados extraídos do CV de ${viewFilters.authorName}?\n\nUma vez confirmada, para visualizar esses dados novamente, será necessário (re)abrir ou atualizar a página do CV.`
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

  //   let i = -1; // to adjust index for select place holder
  //   for (const childNode of authorSelect.childNodes) {
  //     // console.log(childNode.textContent, childNode.selected)
  //     if (childNode.selected) {
  //       viewFilters.authorName = childNode.textContent;
  //       viewFilters.authorLink = authorNameLinkList[i].link;
  //     }
  //     i++;
  //   }

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
  div.appendChild(elem);

  // create icon element
  const iconElem = document.createElement('i');
  setAttributes(iconElem, iconAttributes);

  // append icon element to div
  div.appendChild(iconElem);

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
  const authorStats = {
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
    authorStats.stats = match.statsInfo.stats;
    authorStats.pubInfo = match.statsInfo.pubInfo;

    // get min and max years from Lattes stats
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
    },
    {
      id: 'total-pubs-i',
      class: 'fa-solid fa-file-lines',
      'aria-hidden': 'true',
    }
  );

  const totalPubsDiv = divElem.div;
  const totalPubsInput = divElem.elem;

  if (authorStats.totalPubs > 0) {
    const pluralChar = authorStats.totalPubs > 1 ? 's' : '';

    const periodString =
      authorStats.minYear != authorStats.maxYear
        ? `entre ${authorStats.minYear} e ${authorStats.maxYear}`
        : `em ${authorStats.minYear}`;

    totalPubsInput.value = `${authorStats.totalPubs} artigo${pluralChar} publicado${pluralChar} ${periodString}`;
  } else {
    totalPubsInput.value = `Nenhum artigo encontrado`;
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

    // Update popup view
    console.log('Updating popup view...');
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
      class: 'fa-solid fa-table',
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
    table: 'Totais e estatísticas no período',
    // "table": "Tabela",
    //"plot": "Totais por ano (gráfico)",
    'top-5': '5 melhores publicações no período',
    // "top-5": "Top 5 no período",
    'top-10': '10 melhores  publicações no período',
    // "top-5": "Top 10 no período",
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
  const startInput = form.querySelector("input[id='start-year-input']");
  const endInput = form.querySelector("input[id='end-year-input']");
  const last5Button = form.querySelector("button[id='last5-button']");
  const last10Button = form.querySelector("button[id='last10-button']");
  const resetButton = form.querySelector("button[id='reset-button']");

  // add form start year input handler
  startInput.addEventListener('change', function (e) {
    e.preventDefault();

    // get author stats for new author selection
    const authorStats = getLattesAuthorStats(viewFilters.authorLink);

    // make sure start and end year filter values are consistent
    startInput.value =
      startInput.value > endInput.value ? endInput.value : startInput.value;

    // check whether start year field has changed
    if (startInput.value != viewFilters.start) {
      // update start filter value
      viewFilters.start = startInput.value;

      // Update popup view
      console.log('Updating popup view...');
      console.log(authorStats, viewFilters);
      updateView(authorStats);
    }
  });

  // add form end year input handler
  endInput.addEventListener('change', function (e) {
    e.preventDefault();

    // get author stats for new author selection
    const authorStats = getLattesAuthorStats(viewFilters.authorLink);

    // make sure start and end year filter values are consistent
    endInput.value =
      endInput.value < startInput.value ? startInput.value : endInput.value;

    // check whether end year field has changed
    if (endInput.value != viewFilters.end) {
      // update start filter value
      viewFilters.end = endInput.value;

      // Update popup view
      console.log('Updating popup view...');
      console.log(authorStats, viewFilters);
      updateView(authorStats);
    }
  });

  // add form last 5 years button handler
  last5Button.addEventListener('click', function (e) {
    e.preventDefault();

    // get author stats for new author selection
    const authorStats = getLattesAuthorStats(viewFilters.authorLink);

    // get start and end of last 5 years period
    const startEnd = getLastNYearsStartEnd(authorStats, 5);

    // update start and end year input values
    startInput.value = startEnd.start;
    endInput.value = startEnd.end;

    // update start and end year filter values
    viewFilters.start = startEnd.start;
    viewFilters.end = startEnd.end;

    // Update popup view
    console.log('Updating popup view...');
    console.log(authorStats, viewFilters);
    updateView(authorStats);
  });

  // add form last 10 years button handler
  last10Button.addEventListener('click', function (e) {
    e.preventDefault();

    // get author stats for new author selection
    const authorStats = getLattesAuthorStats(viewFilters.authorLink);

    // get start and end of last 10 years period
    const startEnd = getLastNYearsStartEnd(authorStats, 10);

    // update start and end year input values
    startInput.value = startEnd.start;
    endInput.value = startEnd.end;

    // update start and end year filter values
    viewFilters.start = startEnd.start;
    viewFilters.end = startEnd.end;

    // Update popup view
    console.log('Updating popup view...');
    console.log(authorStats, viewFilters);
    updateView(authorStats);
  });

  // add form reset button handler
  resetButton.addEventListener('click', function (e) {
    e.preventDefault();

    // get author stats for new author selection
    const authorStats = getLattesAuthorStats(viewFilters.authorLink);

    // reset start and end year input and filter values if necessary
    if (
      startInput.value != authorStats.minYear ||
      endInput.value != authorStats.maxYear
    ) {
      // reset start and end year input values
      startInput.value = authorStats.minYear;
      endInput.value = authorStats.maxYear;

      // reset start and end year filter values
      viewFilters.start = authorStats.minYear;
      viewFilters.end = authorStats.maxYear;

      // Update popup view
      console.log('Updating popup view...');
      console.log(authorStats, viewFilters);
      updateView(authorStats);
    }
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
      type: 'number',
      min: authorStats.minYear,
      max: authorStats.maxYear,
      value: authorStats.minYear,
      required: 'required',
    },
    {
      class: 'fa-solid fa-calendar',
      'aria-hidden': 'true',
      id: 'start-year-i',
    }
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
      type: 'number',
      min: authorStats.minYear,
      max: authorStats.maxYear,
      value: authorStats.maxYear,
      required: 'required',
    },
    {
      class: 'fa-solid fa-calendar',
      'aria-hidden': 'true',
      id: 'end-year-i',
    }
  );

  viewFilters.end = authorStats.maxYear;

  // create last 5 years button
  const last5Button = document.createElement('button');
  setAttributes(last5Button, {
    id: 'last5-button',
    tag: 'view-year-filter',
    type: 'submit',
    title: 'Últimos 5 anos',
  });
  last5Button.innerHTML =
    "<i class='fa-solid fa-backward-fast' id='last5-i'></i> 5";

  // add last 5 years button to form
  form.insertAdjacentElement('beforeend', last5Button);

  // create last 10 years button
  const last10Button = document.createElement('button');
  setAttributes(last10Button, {
    id: 'last10-button',
    tag: 'view-year-filter',
    type: 'submit',
    title: 'Últimos 10 anos',
  });
  last10Button.innerHTML =
    "<i class='fa-solid fa-backward-fast' id='last10-i'></i> 10";

  // add last 10 years button to form
  form.insertAdjacentElement('beforeend', last10Button);

  // create reset years button
  const resetButton = document.createElement('button');
  setAttributes(resetButton, {
    id: 'reset-button',
    tag: 'view-year-filter',
    type: 'reset',
    title: 'Todos os anos',
  });
  resetButton.innerHTML =
    // "<i class='fa-solid fa-backward-step' id='reset-i'></i> <i class='fa-solid fa-forward-step' id='reset-i'></i>";
    "<i class='fa-solid fa-arrow-rotate-right' id='reset-i'></i>";

  // add reset years button to form
  form.insertAdjacentElement('beforeend', resetButton);
}

function getLastNYearsStartEnd(authorStats, lastN) {
  // get current year
  const currYear = new Date().getFullYear();

  // calculate start of last N years period
  var startYear = currYear - lastN + 1;

  startYear = startYear < authorStats.minYear ? authorStats.minYear : startYear;

  return { start: startYear, end: currYear };
}

// Update view with QUALIS results
function updateView(authorStats) {
  // update popup selected view
  if (viewFilters.viewType === 'table') {
    updateTableView(authorStats.stats, viewFilters.start, viewFilters.end);
  } else if (viewFilters.viewType === 'top-5') {
    // update top 5 papers view
    updateTopPapersView(
      authorStats.pubInfo,
      viewFilters.start,
      viewFilters.end,
      5
    );
  } else if (viewFilters.viewType === 'top-10') {
    // update top 5 papers view
    updateTopPapersView(
      authorStats.pubInfo,
      viewFilters.start,
      viewFilters.end,
      10
    );
  }
  console.log(authorStats.pubInfo);
}

// Update popup table with QUALIS results
function updateTableView(stats, startYear, endYear) {
  //console.log(qualisStats);

  const totalCounts = {
    A1: 0,
    A2: 0,
    A3: 0,
    A4: 0,
    B1: 0,
    B2: 0,
    B3: 0,
    B4: 0,
    B5: 0,
    C: 0,
    NC: 0,
    totA: 0,
    totB: 0,
    tot: 0,
  };

  let totalStats = {
    totA: { best: { count: 0, year: 0 }, list: [] },
    totB: { best: { count: 0, year: 0 }, list: [] },
    tot: { best: { count: 0, year: 0 }, list: [] },
  };

  // delete current view if it already exists
  removeElements("[tag='view']");

  // get view div element
  const div = document.querySelector('#view-div');

  // create new table element and insert it immediately after the div element
  const table = document.createElement('table');
  table.setAttribute('class', 'styled-table');
  setAttributes(table, {
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
  tableHeadRowFirstCell.textContent = 'Ano';
  tableHeadRow.appendChild(tableHeadRowFirstCell);

  const tableHeadRowLabels = [
    'A1',
    'A2',
    'A3',
    'A4',
    'B1',
    'B2',
    'B3',
    'B4',
    'B5',
    'C',
    'NC',
    '#A',
    '#B',
    '#Ano',
  ];

  // create the remaining header row cells (for the year count columns)
  for (const label of tableHeadRowLabels) {
    // create new table head row cell
    const tableHeadRowCell = document.createElement('th');
    tableHeadRowCell.textContent = label;
    tableHeadRow.appendChild(tableHeadRowCell);
  }

  // create table body
  const tableBody = document.createElement('tbody');
  table.appendChild(tableBody);

  // create table body rows with QUALIS stats grouped by year (in reverse chronological order)
  for (let i = 0; i < stats.year.length; i++) {
    if (stats.year[i] >= startYear && stats.year[i] <= endYear) {
      //   years++;
      console.log(stats.year[i]);
      // create new row for current year
      const newRow = document.createElement('tr');

      // create new cell with current year
      const newYearCell = document.createElement('td');
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
          newCell.setAttribute('type', 'number');

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
          newCell.setAttribute('type', 'tot');

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

  // create table footer total row
  const tableFootTotalRow = document.createElement('tr');
  tableFoot.appendChild(tableFootTotalRow);

  // create the first footer total row cell (for the total label)
  const tableFootTotalRowFirstCell = document.createElement('th');
  tableFootTotalRowFirstCell.textContent = 'Total';
  // tableFootTotalRowFirstCell.setAttribute('type', 'tot');
  tableFootTotalRow.appendChild(tableFootTotalRowFirstCell);

  // create the remaining footer row cells (for the total counts)
  for (const key of Object.keys(totalCounts)) {
    // create new table footer row cell
    const tableFootTotalRowCell = document.createElement('td');
    tableFootTotalRowCell.setAttribute('type', 'tot');
    tableFootTotalRowCell.textContent = totalCounts[key];
    // add new cell to table footer row
    tableFootTotalRow.appendChild(tableFootTotalRowCell);
  }

  // stats (median and best) rows

  // create table footer median row
  const tableFootMedianRow = document.createElement('tr');
  tableFoot.appendChild(tableFootMedianRow);

  // create the first footer median row cell (for the median label)
  const tableFootMedianRowFirstCell = document.createElement('th');
  tableFootMedianRowFirstCell.textContent = 'Mediana';
  // tableFootMedianRowFirstCell.setAttribute('type', 'tot');
  tableFootMedianRow.appendChild(tableFootMedianRowFirstCell);

  // create the footer row cells for the median counts
  for (const key of Object.keys(totalCounts)) {
    // create new table footer average total row cell
    const tableFootMedianRowCell = document.createElement('td');
    tableFootMedianRowCell.setAttribute('type', 'tot');

    if (key.slice(0, 3) == 'tot') {
      tableFootMedianRowCell.textContent = totalStats[key].list
        .median()
        .toFixed(1);
    } else {
      tableFootMedianRowCell.textContent = '';
    }

    // add new cell to table footer row
    tableFootMedianRow.appendChild(tableFootMedianRowCell);
  }

  // create table footer best year row
  const tableFootBestRow = document.createElement('tr');
  tableFoot.appendChild(tableFootBestRow);

  // create the first footer best row cell (for the best year label)
  const tableFootBestRowFirstCell = document.createElement('th');
  tableFootBestRowFirstCell.textContent = 'Melhor Ano';
  // tableFootBestRowFirstCell.setAttribute('type', 'tot');
  tableFootBestRow.appendChild(tableFootBestRowFirstCell);

  // create the footer row cells for the best years
  for (const key of Object.keys(totalCounts)) {
    // create new table footer best row cell
    const tableFootBestRowCell = document.createElement('td');
    tableFootBestRowCell.setAttribute('type', 'tot');

    if (key.slice(0, 3) == 'tot' && totalStats[key].best.year > 0) {
      tableFootBestRowCell.textContent = totalStats[key].best.year;
    } else {
      tableFootBestRowCell.textContent = '';
    }

    // add new cell to table footer row
    tableFootBestRow.appendChild(tableFootBestRowCell);
  }
}

function updateTotalStats(totalStats, yearCounts, year) {
  for (const key of Object.keys(yearCounts)) {
    // update total stats list
    totalStats[key].list.push(yearCounts[key]);

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
    '%',
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
          percentil: pubItem.percentil ? pubItem.percentil : '--',
          baseYear: pubItem.baseYear,
        };

        // insert publication entry into publication array
        pubArray.push(pubEntry);
      }
    }
  }
  // sort publication array by QUALIS and percentil
  const sortedPubArray = sortQualisArray(pubArray);

  // return top N publications from sorted publication array
  return sortedPubArray.slice(0, topN);
}

function sortQualisArray(qualisArray) {
  qualisArray.sort(
    (pubA, pubB) =>
      pubA.qualis.localeCompare(pubB.qualis) || pubB.percentil - pubA.percentil
  );

  return qualisArray;
}

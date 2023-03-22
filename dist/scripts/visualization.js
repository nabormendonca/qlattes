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
  insertLineBreaks(referenceNode, 'after', 1, { tag: 'total-pubs' });

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
  insertLineBreaks(totalPubsDiv, 'after', 1, {
    tag: 'total-pubs',
  });
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

  // create the remaining view type options and sub options
  const viewTypeOptions = {
    qualisView: {
      label: 'Classificação',
      options: {
        qualisTableView: 'Tabela de classificação Qualis',
        qualisGraphicView: 'Gráfico de classificação Qualis',
      },
    },
    scoreView: {
      label: 'Pontuação',
      options: {
        scoreTableView: 'Tabela de pontuação Qualis',
        scoreGraphicView: 'Gráfico de pontuação Qualis',
      },
    },
    topNView: {
      label: 'Publicações',
      options: {
        top5View: '5 melhores artigos',
        top10View: '10 melhores artigos',
      },
    },
  };

  for (const option of Object.keys(viewTypeOptions)) {
    // simple option (string) check
    if (typeof viewTypeOptions[option] == 'string') {
      // create simple option element
      const viewTypeOption = document.createElement('option');
      setAttributes(viewTypeOption, {
        value: option,
      });
      viewTypeOption.textContent = viewTypeOptions[option];
      // add simple option element to view type select
      viewTypeSelect.appendChild(viewTypeOption);
    }
    // composite option (object) check
    else if (typeof viewTypeOptions[option] == 'object') {
      // create composite option element
      const viewTypeOptGroup = document.createElement('optgroup');
      setAttributes(viewTypeOptGroup, {
        label: viewTypeOptions[option].label,
      });
      // create sub option elements
      for (const subOption of Object.keys(viewTypeOptions[option].options)) {
        // create sub option element
        const viewTypeSubOption = document.createElement('option');
        setAttributes(viewTypeSubOption, {
          value: subOption,
        });
        viewTypeSubOption.textContent =
          viewTypeOptions[option].options[subOption];
        // add simple option element to composite option
        viewTypeOptGroup.appendChild(viewTypeSubOption);
      }
      // add composite option element to view type select
      viewTypeSelect.appendChild(viewTypeOptGroup);
    }
  }
  //form.appendChild(viewTypeSelect);

  // insert two line breaks after view type select element
  insertLineBreaks(viewTypeDiv, 'after', 1, {
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

// Update data view
function updateView(authorStats) {
  // Start the timer
  console.time('Execution time');

  // update selected view type
  switch (viewFilters.viewType) {
    case 'qualisGraphicView':
      updateQualisGraphicView(
        authorStats.stats,
        viewFilters.start,
        viewFilters.end
      );
      break;
    case 'qualisTableView':
      updateQualisTableView(
        authorStats.stats,
        viewFilters.start,
        viewFilters.end
      );
      break;
    case 'scoreGraphicView':
      updateScoreGraphicView(
        authorStats.stats,
        viewFilters.start,
        viewFilters.end
      );
      break;
    case 'scoreTableView':
      updateScoreTableView(
        authorStats.stats,
        viewFilters.start,
        viewFilters.end
      );
      break;
    case 'top5View':
      updateTopPapersView(
        authorStats.pubInfo,
        viewFilters.start,
        viewFilters.end,
        5
      );
      break;
    case 'top10View':
      updateTopPapersView(
        authorStats.pubInfo,
        viewFilters.start,
        viewFilters.end,
        10
      );
      break;
  }
  // End the timer
  console.timeEnd('Execution time');
  // console.log(authorStats.pubInfo);
}

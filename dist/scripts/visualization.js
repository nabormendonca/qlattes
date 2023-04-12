//
// visualization script
//

// define global view form data
var authorNameLinkList;
var viewFilters;
var lattesData;
var areaData;
var qualisScores;
const qualisScoresURL = 'data/qualis-scores-by-area-2017-2020.json';

// add listener to track changes to Lattes data in storage area
chrome.storage.onChanged.addListener((changes, area) => {
  for (let [key, { newValue }] of Object.entries(changes)) {
    // console.log(key, newValue);
    // handle changes to Lattes data
    if (area == 'local' && key == 'lattes_data') {
      console.log('Lattes data changed to:', newValue);
      updateLattesData(newValue);
    }
  }
});

// options page main function
(async () => await main())();

async function main() {
  // get Qualis scores data
  qualisScores = await fetchJSON(chrome.runtime.getURL(qualisScoresURL));
  console.log(
    `fetched Qualis scores from file ${qualisScoresURL}`,
    qualisScores
  );

  // update area data (if previously saved in local store)
  const data = await chrome.storage.local.get(['area_data']);
  if (Object.keys(data).length > 0) {
    console.log(`Area ${data.area_data.label} retrieved from local storage`);
    areaData = data.area_data;
  }

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
  // add author select div to form
  form.append(divElem.div);

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

    // update author name link list with existing and new authors names to remain or be included in the author select options and sort the resulting list by author name
    authorNameLinkList = currAuthorsIn
      .concat(newAuthorsIn)
      .sortByKeys(['name']);

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
    "[tag='author-select-option'], [tag='remove-cv-data'], [tag='export-cv-data'], [tag='import-data'], [tag='total-pubs'], [tag='view'], [tag='view-type-filter'], [tag='area-filter'],[tag='view-year-filter']"
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
      // console.log('author list', authorNameLinkList);
    }
  }
  // sort author list by author name
  authorNameLinkList = authorNameLinkList.sortByKeys(['name']);

  // get author select element
  const authorSelect = document.getElementById('author-select');
  // change focus to author select
  authorSelect.focus();

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

  // create remove CV data button (initially hidden)
  const removeCVDataButton = document.createElement('button');
  setAttributes(removeCVDataButton, {
    id: 'remove-cv-data-button',
    // title: 'Remover dados do CV',
    tag: 'remove-cv-data',
    style: 'visibility: hidden;',
  });
  removeCVDataButton.innerHTML =
    "<i class='fa-solid fa-trash-can' id='remove-cv-data-i'></i> Remover dados";

  // get author select div
  const authorDiv = document.getElementById('author-div');
  // add remove CV data button to form after author select
  insertAfter(authorDiv, removeCVDataButton);

  // create export CV data button
  const exportCVDataButton = document.createElement('button');
  setAttributes(exportCVDataButton, {
    id: 'export-cv-data-button',
    // title: 'Exportar dados do CV (.csv)',
    tag: 'export-cv-data',
    style: 'visibility: hidden;',
  });
  exportCVDataButton.innerHTML =
    "<i class='fa-solid fa-download' id='export-cv-data-i'></i> Exportar dados";

  // add export file button to form after remove CV data button
  insertAfter(removeCVDataButton, exportCVDataButton);

  // add remove CV data  button handler
  removeCVDataButton.addEventListener('click', function (e) {
    e.preventDefault();

    // confirm remove CV data action
    var result = confirm(
      `Confirma a remoção dos dados extraídos do CV de ${viewFilters.authorName}?\n\nUma vez confirmada, para visualizar os dados desde CV novamente, será necessário (re)abrir a página do CV no navegador.`
    );
    if (result) {
      console.log('remove CV data action confirmed!');

      // delete CV data from lattes data and save it back to local storage area
      deleteLattesAuthorData(viewFilters.authorLink);

      // update author form
      // updateAuthorForm();

      // reload options page
      window.location.reload(true);
    }
  });

  // add export CV data button handler
  exportCVDataButton.addEventListener('click', function (e) {
    e.preventDefault();

    // get Lattes data for current author
    var authorData = lattesData.lattes_data.find(
      (elem) => elem.nameLink.link == viewFilters.authorLink
    );

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
      var result = confirm(
        `Confirma a exportação dos dados do CV de ${viewFilters.authorName} para o formato CSV${areaString}?`
      );
      if (result) {
        console.log('export CV data action confirmed!');

        // export CV data to external file
        exportCVDataToFile(authorData.nameLink, pubInfo);
      }
    } else {
      alert('Este CV não possui dados de publicações em periódico.');
    }
  });
}

function exportCVDataToFile(nameLink, pubInfo) {
  // export author data in CSV format
  chrome.downloads.download({
    url:
      'data:text/csv;charset=utf-8,' +
      encodeURIComponent(convertLattesDataToCSV(nameLink, pubInfo)),
    filename: `${removeSpecialChars(nameLink.name)}.csv`,
  });
}

function convertLattesDataToCSV(nameLink, pubInfo) {
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
  console.log(areaLabel, areaScores);
  const rows = [];
  for (const pubInfoElem of pubInfo) {
    for (const pubListElem of pubInfoElem.pubList) {
      const row = [
        `"${nameLink.name}"`,
        nameLink.link,
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

  // // get author select div
  // const authorDiv = document.getElementById('author-div');

  // get remove CV data button element
  const removeCVDataButton = document.querySelector(
    "button[id='remove-cv-data-button']"
  );
  // get export CV data button element
  const exportCVDataButton = document.querySelector('#export-cv-data-button');

  // set remove CV data button element visible
  removeCVDataButton.style.visibility = 'visible';
  // set export CV data button element visible
  exportCVDataButton.style.visibility = 'visible';

  // find selected author's link
  const match = authorNameLinkList.find(
    (elem) => elem.name === event.target.value
  );

  viewFilters.authorName = match.name;
  viewFilters.authorLink = match.link;

  // get author Lattes stats and publication info for selected author
  const authorStats = getLattesAuthorStats(viewFilters.authorLink);

  console.log('author stats', authorStats);

  // get total pubs input
  const totalPubsInput = document.getElementById('total-pubs-input');
  if (totalPubsInput !== null) {
    updateTotalPubsElement(authorStats);
  } else {
    createTotalPubsElement(authorStats);
  }

  if (authorStats.totalPubs > 0) {
    // update start and end year filters
    viewFilters.start = authorStats.minYear;
    viewFilters.end = authorStats.maxYear;
    // get area select element
    const areaSelect = document.getElementById('area-select');
    if (areaSelect === null) {
      // create knowledge area select
      createAreaSelect();
    }
    // get view type select element
    const viewTypeSelect = document.querySelector(
      "select[id='view-type-select']"
    );
    if (viewTypeSelect !== null) {
      // // change focus to view type select
      // viewTypeSelect.focus();
      // get view year filters
      const viewYearFilters = document.querySelectorAll(
        "[tag='view-year-filter']"
      );
      if (viewYearFilters.length > 0) {
        // get form filter elements
        const startInput = document.querySelector('#start-year-input');
        const endInput = document.querySelector('#end-year-input');
        // update start and end year input values
        startInput.value = viewFilters.start;
        endInput.value = viewFilters.end;
        // get period select element
        const periodSelect = document.querySelector('#period-select');
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
        if (viewTypeSelect.value !== '') {
          // update view
          updateView();
        }
      }
    } else {
      createViewTypeFilter();
    }
  } else {
    // remove all view elements
    removeElements(
      "[tag='view'], [tag='area-filter'], [tag='view-type-filter'], [tag='view-year-filter']"
    );
  }
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

function getLattesAuthorStats(authorLink, metric = 'qualis', scores = {}) {
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
    const pubInfo =
      'statsInfo' in match ? match.statsInfo.pubInfo : match.pubInfo;
    // add missing years (if any) to author stats
    authorStats = addMissingYearsToAuthorStats(
      getQualisStats(pubInfo, metric, scores),
      pubInfo
    );
    console.log('author stats with missing years:', authorStats);
    // get min and max years from author stats
    authorStats.minYear = authorStats.stats.year.slice(-1)[0];
    authorStats.maxYear = authorStats.stats.year[0];
    // get total journal publications
    var totalPubs = 0;
    for (const key of Object.keys(authorStats.stats)) {
      if (key !== 'year' && key !== 'jcr') {
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
  // const removeCVDataButton = document.querySelector(
  //   "button[id='remove-cv-data-button']"
  // );
  const exportCVDataButton = document.querySelector(
    "button[id='export-cv-data-button']"
  );

  // get reference node for inserting line breaks
  // const referenceNode = removeCVDataButton ? removeCVDataButton : authorDiv;
  const referenceNode = exportCVDataButton ? exportCVDataButton : authorDiv;

  // insert one line break after reference node
  insertLineBreaks(referenceNode, 'after', 1, { tag: 'total-pubs' });

  // create total pubs read only input
  const divElem = createDivElemWithIcon(
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
  );

  const totalPubsDiv = divElem.div;
  const totalPubsInput = divElem.elem;

  // add total pubs div to form
  form.append(totalPubsDiv);

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

function updateTotalPubsElement(authorStats) {
  // get author select element
  const authorSelect = document.querySelector('#author-select');
  // get total pubs input element
  const totalPubsInput = document.querySelector('#total-pubs-input');

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
}

function createViewTypeFilter() {
  // add filters to popup form
  addViewTypeFilter();

  // get form element
  const form = document.querySelector("form[id='form-filters']");

  const viewTypeSelect = form.querySelector("select[id='view-type-select']");
  // change focus to view type select
  viewTypeSelect.focus();

  // add form view type select handler
  viewTypeSelect.addEventListener('change', function (e) {
    e.preventDefault();

    // // update view filter value
    // viewFilters.viewType = viewTypeSelect.value;

    // handle Qualis score views
    if (
      (viewTypeSelect.value == 'scoreTableView') |
      (viewTypeSelect.value == 'scoreGraphicView')
    ) {
      // get area select element
      const areaSelect = document.getElementById('area-select');
      if (areaSelect.value === '' || areaSelect.value === 'undefined') {
        // show alert and reset view type select to previous value
        alert(
          `Para visualizar a pontuação Qualis, é necessário selecionar uma Área do Conhecimento.`
        );
        areaSelect.focus();
        viewTypeSelect.value = viewFilters.viewType;
      } else {
        // update view filter value
        viewFilters.viewType = viewTypeSelect.value;
        updateArea();
      }
    } else {
      // update view filter value
      viewFilters.viewType = viewTypeSelect.value;
      // get or create view year filters
      const viewYearFilters = document.querySelectorAll(
        "[tag='view-year-filter']"
      );
      if (viewYearFilters.length == 0) {
        createViewYearFilters();
      }
      // Update view
      updateView();
    }
  });
}

function createAreaSelect() {
  // create area select
  const divElem = createDivElemWithIcon(
    {
      id: 'area-div',
      class: 'Icon-inside',
      tag: 'area-filter',
    },
    'select',
    {
      id: 'area-select',
      tag: 'area-filter',
    },
    {
      id: 'area-select-i',
      class: 'fa-solid fa-graduation-cap',
      'aria-hidden': 'true',
      tag: 'area-filter',
    }
  );
  const areaDiv = divElem.div;
  const areaSelect = divElem.elem;

  // get form element
  const form = document.getElementById('form-filters');
  // insert area div after author div
  form.append(areaDiv);
  insertLineBreaks(areaDiv, 'after', 1, {
    tag: 'area-div',
  });
  // change focus to area select
  // areaSelect.focus();

  // create hidden first area option with placeholder
  const placeholderOption = document.createElement('option');
  setAttributes(placeholderOption, {
    value: '',
    disabled: true,
    selected: true,
    hidden: true,
  });
  placeholderOption.textContent = 'Selecione uma Área do Conhecimento';
  areaSelect.append(placeholderOption);

  // create option for undefined area
  const undefinedAreaOption = document.createElement('option');
  setAttributes(undefinedAreaOption, {
    value: 'undefined',
  });
  undefinedAreaOption.textContent = 'Sem Área do Conhecimento';
  areaSelect.append(undefinedAreaOption);

  // create area select options
  for (const greatArea of qualisScores) {
    // create great area option group element
    const greatAreaOptGroupElem = document.createElement('optgroup');
    setAttributes(greatAreaOptGroupElem, {
      label: greatArea.label,
    });
    // create area option elements
    for (const area of Object.keys(greatArea.areas)) {
      // create area option element
      const areaOptionElem = document.createElement('option');
      setAttributes(areaOptionElem, {
        value: area,
      });
      areaOptionElem.textContent = greatArea.areas[area].label;
      // add area option to great area group option
      greatAreaOptGroupElem.append(areaOptionElem);
    }
    // add great area group option area select
    areaSelect.append(greatAreaOptGroupElem);
  }
  // set area select value to selected area (if any)
  if (typeof areaData !== 'undefined') {
    console.log(`Area ${areaData.label} set`);
    areaSelect.value = areaData.area;
    updateArea();
  }

  // add area select listener
  areaSelect.addEventListener('change', function (event) {
    event.preventDefault();

    // get previous area (if any)
    var prevArea = '';
    if (areaData !== undefined) {
      prevArea = areaData.area;
    }

    // get selected area
    const area = event.target.value;

    if (area === 'undefined') {
      areaData = {
        area: area,
        scores: {},
        label: 'Sem Área do Conhecimento',
        source: {},
        base_year: '',
      };
      // save area data to local store
      chrome.storage.local.set({ area_data: areaData }).then(() => {
        console.log(`Area ${areaData.label} saved!`);
        updateArea();
      });
    } else {
      // find selected area data in Qualis score data
      var match = qualisScores.find((elem) =>
        Object.keys(elem.areas).includes(area)
      );

      if (match) {
        if (Object.keys(match.areas[area].scores).length > 0) {
          // update area data
          areaData = {
            area: area,
            scores: match.areas[area].scores,
            label: match.areas[area].label,
            source: match.areas[area].source,
            base_year: match.areas[area].base_year,
          };
          // save area data to local store
          chrome.storage.local.set({ area_data: areaData }).then(() => {
            console.log(`Area ${areaData.label} saved!`);
            updateArea();
          });
        } else {
          // show no scores alert and reset area select to previous area (if any)
          alert(
            'Esta Área do Conhecimento não definiu pontuação específica para os estratos do Qualis.'
          );
          if (prevArea !== '') {
            // reset area select to previously selected option
            event.target.value = prevArea;
          } else {
            // reset area select to placeholder option
            event.target.selectedIndex = 0;
          }
        }
      }
    }
  });
}

function updateArea() {
  // get view type select
  const viewTypeSelect = document.getElementById('view-type-select');
  if (viewTypeSelect !== null && viewTypeSelect.value !== '') {
    // if (
    //   (viewTypeSelect.value === 'scoreTableView' ||
    //     viewTypeSelect.value === 'scoreGraphicView') &&
    //   areaData.area === 'undefined'
    // ) {
    //   // reset view type select and remove view and filter elements
    //   viewTypeSelect.selectedIndex = 0;
    //   removeElements("[tag='view'], [tag='view-year-filter']");
    // } else {
    //   // get or create view year filters
    //   const viewYearFilters = document.querySelectorAll(
    //     "[tag='view-year-filter']"
    //   );
    //   if (viewYearFilters.length == 0) {
    //     createViewYearFilters();
    //   }
    //   // Update view
    //   updateView();
    // }
    if (
      viewTypeSelect.value === 'scoreTableView' ||
      viewTypeSelect.value === 'scoreGraphicView'
    ) {
      if (areaData.area === 'undefined') {
        // reset view type select and remove view and filter elements
        viewTypeSelect.selectedIndex = 0;
        removeElements("[tag='view'], [tag='view-year-filter']");
      } else {
        // get or create view year filters
        const viewYearFilters = document.querySelectorAll(
          "[tag='view-year-filter']"
        );
        if (viewYearFilters.length == 0) {
          createViewYearFilters();
        }
        // Update view
        updateView();
      }
    }
  }
}

function addViewTypeFilter() {
  // remove view type filter elements if they already exist
  removeElements("[tag='view-type-filter']");

  // create view type select
  const divElem = createDivElemWithIcon(
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

  // change focus to view type select
  // viewTypeSelect.focus();

  // get form element
  const form = document.querySelector("form[id='form-filters']");
  // add view type div to form
  form.append(viewTypeDiv);

  // create view type placeholder
  const placeholder = 'Selecione um tipo de visualização';

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
      label: 'Classificação Qualis',
      options: {
        qualisTableView: 'Tabela de classificação Qualis',
        qualisGraphicView: 'Gráfico de classificação Qualis',
      },
    },
    scoreView: {
      label: 'Pontuação Qualis (por Área do Conhecimento)',
      options: {
        scoreTableView: 'Tabela de pontuação Qualis',
        scoreGraphicView: 'Gráfico de pontuação Qualis',
      },
    },
    // jcrView: {
    //   label: 'Pontuação JCR',
    //   options: {
    //     jcrTableView: 'Tabela de pontuação JCR',
    //     jcrGraphicView: 'Gráfico de pontuação JCR',
    //   },
    // },
    topNView: {
      label: 'Melhores publicações',
      options: {
        top5QualisView: '5 melhores publicações',
        top10QualisView: '10 melhores publicações',
        // top5JcrView: '5 melhores publicações (JCR)',
        // top10JcrView: '10 melhores publicações (JCR)',
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

  // insert one line break after view type div element
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

    // make sure start and end year filter values are consistent
    startInput.value =
      startInput.value > endInput.value ? endInput.value : startInput.value;

    // check whether start year field has changed
    if (startInput.value != viewFilters.start) {
      // update start filter value
      viewFilters.start = parseInt(startInput.value);

      // Update view
      updateView();
    }
  });

  // add form end year input handler
  endInput.addEventListener('change', function (e) {
    e.preventDefault();

    // reset period select with placeholder
    periodSelectPlaceholder.selected = true;

    // // get author stats for new author selection
    // const authorStats = getLattesAuthorStats(viewFilters.authorLink);

    // make sure start and end year filter values are consistent
    endInput.value =
      endInput.value < startInput.value ? startInput.value : endInput.value;

    // check whether end year field has changed
    if (endInput.value != viewFilters.end) {
      // update start filter value
      viewFilters.end = parseInt(endInput.value);

      // Update view
      updateView();
    }
  });

  // add period select listener
  periodSelect.addEventListener('change', function (e) {
    e.preventDefault();

    if (periodSelect.value == '') {
      return;
    }

    // get author stats
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
    updateView();
  });
}

function addViewYearFilters() {
  // get author stats for new author selection
  const authorStats = getLattesAuthorStats(viewFilters.authorLink);

  // get form element
  const form = document.querySelector("form[id='form-filters']");

  // create start year filter
  const divStartYearElem = createDivElemWithIcon(
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
  // add start year filter to form
  form.append(divStartYearElem.div);

  viewFilters.start = authorStats.minYear;

  const toLabel = document.createElement('label');
  setAttributes(toLabel, {
    id: 'start-year-end-year-label',
    tag: 'view-year-filter',
  });
  toLabel.textContent = 'a';
  form.appendChild(toLabel);

  // create end year filter
  const divEndYearElem = createDivElemWithIcon(
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
  );
  // add end year filter to form
  form.append(divEndYearElem.div);

  viewFilters.end = authorStats.maxYear;

  // create period select
  const divPeriodElem = createDivElemWithIcon(
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
      id: 'period-select-i',
      class: 'fa-regular fa-calendar-check',
      'aria-hidden': 'true',
      tag: 'view-year-filter',
    }
  );
  // add period filter to form
  form.append(divPeriodElem.div);

  const periodSelect = divPeriodElem.elem;
  // // change focus to period select
  // periodSelect.focus();

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

// Update view
function updateView() {
  var authorStats;
  console.log('Updating view...');
  // Start the timer
  console.time('Execution time');
  // update selected view type
  switch (viewFilters.viewType) {
    case 'qualisGraphicView':
      // get author stats for new author selection
      authorStats = getLattesAuthorStats(viewFilters.authorLink);
      console.log(viewFilters, authorStats.stats);
      updateQualisGraphicView(
        authorStats.stats,
        viewFilters.start,
        viewFilters.end
      );
      break;
    case 'qualisTableView':
      // get author stats for new author selection
      authorStats = getLattesAuthorStats(viewFilters.authorLink);
      console.log(viewFilters, authorStats.stats);
      updateQualisTableView(
        authorStats.stats,
        viewFilters.start,
        viewFilters.end
      );
      break;
    case 'scoreGraphicView':
      // get author stats for new author selection
      authorStats = getLattesAuthorStats(
        viewFilters.authorLink,
        'score',
        areaData.scores
      );
      console.log(viewFilters, authorStats.stats);
      updateScoreGraphicView(
        authorStats.stats,
        areaData,
        viewFilters.start,
        viewFilters.end
      );
      break;
    case 'scoreTableView':
      // get author stats for new author selection
      authorStats = getLattesAuthorStats(
        viewFilters.authorLink,
        'score',
        areaData.scores
      );
      console.log(viewFilters, authorStats.stats);
      updateScoreTableView(
        authorStats.stats,
        areaData,
        viewFilters.start,
        viewFilters.end
      );
      break;
    // case 'jcrGraphicView':
    //   // get author stats for new author selection
    //   authorStats = getLattesAuthorStats(viewFilters.authorLink, 'jcr');
    //   console.log(viewFilters, authorStats.stats);
    //   updateJcrGraphicView(
    //     authorStats.stats,
    //     viewFilters.start,
    //     viewFilters.end
    //   );
    //   break;
    // case 'jcrTableView':
    //   // get author stats for new author selection
    //   authorStats = getLattesAuthorStats(viewFilters.authorLink, 'jcr');
    //   console.log(viewFilters, authorStats.stats);
    //   updateQualisTableView(
    //     authorStats.stats,
    //     viewFilters.start,
    //     viewFilters.end
    //   );
    //   break;
    case 'top5QualisView':
      // get author stats for new author selection
      authorStats = getLattesAuthorStats(viewFilters.authorLink);
      console.log(viewFilters, authorStats.stats);
      updateTopPapersView(
        authorStats.pubInfo,
        viewFilters.start,
        viewFilters.end,
        5
      );
      break;
    case 'top10QualisView':
      // get author stats for new author selection
      authorStats = getLattesAuthorStats(viewFilters.authorLink);
      console.log(viewFilters, authorStats.stats);
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

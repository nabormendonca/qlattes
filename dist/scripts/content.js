(async () => await main())();

async function main() {
  // Data source path, text, URL and last update
  const dataSource = {
    capes: {
      path: 'data/qualis-capes-2017-2020.json',
      text: 'Qualis/CAPES',
      url: 'https://sucupira.capes.gov.br/sucupira/public/consultas/coleta/veiculoPublicacaoQualis/listaConsultaGeralPeriodicos.jsf',
      baseYear: '2020',
    },
    pucrs: {
      path: 'data/qualis-pucrs-2022.json',
      text: 'Qualis/PUC-RS',
      url: 'https://ppgcc.github.io/discentesPPGCC/pt-BR/qualis/',
      baseYear: '2021',
    },
    scopus: {
      path: 'data/scopus-citescore-2011-2020.json',
      text: 'Scopus',
      url: 'https://www.scopus.com/',
      baseYear: '2020',
    },
  };

  // attempt to get CV name and link from Lattes page
  const nameLink = getLattesNameAndLink();

  // check whether name and link were not found (if not this is not a CV Lattes!)
  if (!nameLink['name']) return;

  // get data sources url
  const pucrsUrl = chrome.runtime.getURL(dataSource.pucrs.path);
  const scopusUrl = chrome.runtime.getURL(dataSource.scopus.path);
  const capesUrl = chrome.runtime.getURL(dataSource.capes.path);

  // read PUC-RS data from url
  const pucrsData = await fetchJSON(pucrsUrl);
  console.log('fetched PUC-RS data');

  // read Scopus data from url
  const scopusData = await fetchJSON(scopusUrl);
  console.log('fetched Scopus data');

  // read CAPES data from url
  const capesData = await fetchJSON(capesUrl);
  console.log('fetched CAPES data');

  // start processing Lattes page
  processLattesPage(
    nameLink,
    {
      pucrs: pucrsData,
      scopus: scopusData,
      capes: capesData,
    },
    dataSource
  );
}

function getLattesNameAndLink() {
  // find name element
  const nameElem = document.querySelector("h2[class='nome']");

  if (!nameElem) return { name: '', link: '' };

  let link = '';
  let name = nameElem.textContent;

  // find link element
  const linkElem = document.querySelector("ul[class='informacoes-autor']");

  if (linkElem) {
    // extract URL from link element text
    link = linkElem.innerText.match(/\bhttps?:\/\/\S+/gi)[0];
  }

  return { name, link };
}

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

async function processLattesPage(nameLink, qualisData, dataSource) {
  console.log(qualisData);

  // reset Qualis data cache
  var qualisDataCache = {};

  // Annotate Lattes page with Qualis classification
  // and return annotated Lattes info
  const lattesInfo = annotateLattesPage(
    qualisData,
    qualisDataCache,
    dataSource
  );

  // Consolidate Lattes stats from Lattes info
  const statsInfo = consolidateQualisResults(lattesInfo);
  console.log(statsInfo);

  // attempt to read Lattes data from local storage area
  const lattesData = await chrome.storage.local.get('lattes_data');
  var lattesDataArray = [];

  // check whether Lattes data on local storage is not empty
  if (Object.keys(lattesData).length !== 0) {
    // get existing Lattes data items
    lattesDataArray = lattesData['lattes_data'];

    // make sure current Lattes data is not already in the existing array
    lattesDataArray = lattesDataArray.filter(
      (elem) => elem.nameLink.link != nameLink.link
    );
  }
  // add current Lattes data to Lattes data array
  lattesDataArray.push({ nameLink: nameLink, statsInfo: statsInfo });

  // Save Lattes data array to local storage area
  await chrome.storage.local.set({ lattes_data: lattesDataArray });
  console.log('Lattes name, link, stats saved!');
}

// Annotate and extract journal info form Lattes page
function annotateLattesPage(qualisData, qualisDataCache, dataSource) {
  console.log('Searching for journal publications...');
  //console.log(qualisData);

  // define annotation icon path
  const qualisImg = chrome.runtime.getURL('images/icon-16.png');

  // get search first element
  const startElem = document.querySelector("div[id='artigos-completos']");

  // may return null if the selector doesn't match anything.
  if (!startElem) return [];

  const qualisInfo = [];

  // find all full articles
  const pubElems = startElem.querySelectorAll("div[class='artigo-completo']");

  for (const pubElem of pubElems) {
    //console.log(pubElem);

    const qualisPubInfo = {
      year: NaN,
      issn: '',
      title: '',
      qualisLabels: '',
    };

    // get year of publication
    qualisPubInfo.year = parseInt(
      pubElem.querySelector(
        "span[class='informacao-artigo'][data-tipo-ordenacao='ano']"
      ).textContent
    );

    // skip current element if it has no year value
    if (isNaN(qualisPubInfo.year)) continue;

    // get last item of journal element
    const pubElemLastItem = pubElem.querySelector('div[cvuri]');

    if (pubElemLastItem) {
      // get Journal info items
      const pubInfoString = escapeHtml(pubElemLastItem.getAttribute('cvuri'));
      const pubInfoItems = pubInfoString.split(/\?(?!&)|&(?=\w+)/);

      for (const pubInfoItem of pubInfoItems) {
        // get journal ISSN
        if (pubInfoItem.includes('issn=')) {
          const issnStr = pubInfoItem.split('issn=')[1];
          qualisPubInfo.issn =
            issnStr.substring(0, 4) + '-' + issnStr.substring(4, 8);
        }

        //get journal name
        if (pubInfoItem.includes('nomePeriodico=')) {
          qualisPubInfo.title = pubInfoItem.split('nomePeriodico=')[1];
          // convert journal name to uppercase
          qualisPubInfo.title.toUpperCase();
        }
      }
      // get journal Qualis classification labels
      const qualisLabels = getQualis(
        qualisPubInfo.issn,
        qualisPubInfo.title,
        qualisData,
        qualisDataCache,
        dataSource
      );

      // use journal name in Qualis labels if available
      if (qualisLabels.title.length) {
        qualisPubInfo.title = qualisLabels.title;
      }

      // add Qualis labels to Qualis info list
      qualisPubInfo.qualisLabels = qualisLabels;

      // inject Qualis info into Lattes page
      injectQualisAnnotation(
        pubElemLastItem,
        qualisPubInfo.issn,
        qualisLabels,
        qualisImg,
        dataSource
      );
    }
    // add journal info to JourInfoList
    qualisInfo.push(qualisPubInfo);
  }

  return qualisInfo;
}

function escapeHtml(text) {
  return text
    .replace('&amp;', '&')
    .replace('&lt;', '<')
    .replace('&gt;', '>')
    .replace('&quot;', '"')
    .replace('&#039;', "'");
}

function getQualis(issn, title, qualisData, qualisDataCache, dataSource) {
  var altIssn = '';

  // check whether issn is in data cache
  if (issn in qualisDataCache) {
    return qualisDataCache[issn];
  } else {
    // check whether an alternative issn exists and is in data cache
    altIssn = getAlternativeIssn(issn, qualisData.scopus);
    if (altIssn.length && altIssn in qualisDataCache) {
      return qualisDataCache[altIssn];
    }
  }

  // search for issn in CAPES data
  qualisLabels = getQualisFromCapesData(
    issn,
    altIssn,
    qualisData.capes,
    qualisData.scopus,
    dataSource
  );

  // if not found
  if (qualisLabels.qualis == 'N') {
    // search for issn in PUC-RS data
    var qualisLabels = getQualisFromPucrsData(
      issn,
      altIssn,
      title,
      qualisData.pucrs,
      dataSource
    );

    // if not found
    if (qualisLabels.qualis == 'N') {
      // search for issn in Scopus data
      qualisLabels = getQualisFromScopusData(
        issn,
        qualisData.scopus,
        dataSource
      );
    }
  }

  // add labels to Qualis cache
  qualisDataCache.issn = qualisLabels;

  if (altIssn.length) {
    qualisDataCache.altIssn = qualisLabels;
  }

  console.log({ qualisLabels });

  return qualisLabels;
}

function getAlternativeIssn(issn, scopusData) {
  // search for issn in Scopus data
  var match = scopusData.find(
    (elem) => elem.issn == issn || elem['e-issn'] == issn
  );

  if (!match) return '';

  if (match['e-issn'].length && match['e-issn'] != issn) {
    return match['e-issn'];
  } else if (match.issn.length > 0 && match.issn != issn) {
    return match.issn;
  } else {
    return '';
  }
}

function getQualisFromCapesData(
  issn,
  altIssn,
  capesData,
  scopusData,
  dataSource
) {
  // set default labels
  const qualisLabels = {
    title: '',
    qualis: 'N',
    percentil: '',
    linkScopus: '',
    adjusted: '',
    source: '',
    baseYear: '',
  };

  // search for issn in CAPES data
  var match = capesData.find(
    (elem) => elem.issn == issn || (altIssn && elem.issn == altIssn)
  );

  if (match) {
    console.log(match);

    // assign matched CAPES data to empty Qualis labels
    qualisLabels.qualis = match.qualis;
    qualisLabels.title = match.title.toUpperCase();
    qualisLabels.source = 'capes';
    qualisLabels.baseYear = dataSource.capes.baseYear;

    // attempt to get link to Scopus for issn
    const qualisLabelsScopus = getQualisFromScopusData(
      issn,
      scopusData,
      dataSource
    );
    console.log(qualisLabelsScopus);

    if (qualisLabelsScopus.qualis != 'N') {
      qualisLabels.linkScopus = qualisLabelsScopus.linkScopus;
    }
  }

  return qualisLabels;
}

function getQualisFromPucrsData(issn, altIssn, title, pucrsData, dataSource) {
  // set default labels
  const qualisLabels = {
    title: '',
    qualis: 'N',
    percentil: '',
    linkScopus: '',
    adjusted: '',
    source: '',
    baseYear: '',
  };

  // search for issn or its alternative in PUC-RS data
  var match = pucrsData.find(
    (elem) => elem.issn == issn || (altIssn && elem.issn == altIssn)
  );

  const labels_map = {
    title: 'periodico',
    qualis: 'Qualis_Final',
    percentil: 'percentil',
    linkScopus: 'link_scopus',
    adjusted: 'Ajuste_SBC',
  };

  if (match) {
    // console.log(match);

    // assign matched PUC-RS data to Qualis labels

    for (const key of Object.keys(labels_map)) {
      if (match[labels_map[key]] && match[labels_map[key]] != 'nulo') {
        qualisLabels[key] = match[labels_map[key]];
      }
    }

    // define source label
    qualisLabels.source = 'pucrs';
    qualisLabels.baseYear = dataSource.pucrs.baseYear;
  }

  return qualisLabels;
}

function getQualisFromScopusData(issn, scopusData, dataSource) {
  // set default labels
  const qualisLabels = {
    title: '',
    qualis: 'N',
    percentil: '',
    linkScopus: '',
    adjusted: '',
    source: '',
    baseYear: '',
  };

  // search for issn in Scopus data
  var match = scopusData.find(
    (elem) => elem.issn == issn || elem['e-issn'] == issn
  );

  if (match) {
    console.log(match);

    // assign matched Scopus data to empty Qualis labels
    qualisLabels.qualis = calculateQualisFromPercentil(match.percentil);
    qualisLabels.title = match.title.toUpperCase();
    qualisLabels.percentil = match.percentil;
    qualisLabels.linkScopus = match['source-id-url'];
    qualisLabels.source = 'scopus';
    qualisLabels.baseYear = dataSource.scopus.baseYear;
  }

  return qualisLabels;
}

function calculateQualisFromPercentil(percentil) {
  if (!percentil || percentil.length == 0) {
    return 'N';
  }

  const qualisClassList = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4'];
  const qualisThresholdList = [87.5, 75, 62.5, 50, 37.5, 25, 12.5, 0];

  for (let i = 0; i < qualisThresholdList.length; i++) {
    if (percentil >= qualisThresholdList[i]) {
      return qualisClassList[i];
    }
  }

  return 'N';
}

function injectQualisAnnotation(
  elem,
  issn,
  qualisLabels,
  qualisImg,
  dataSource
) {
  // create annotation element
  const annotElem = document.createElement('p');
  // inject Qualis icon elem
  const imgElem = document.createElement('img');
  setAttributes(imgElem, {
    src: qualisImg,
    // style: "vertical-align:middle",
    style: 'margin-bottom:-4px',
  });
  annotElem.insertAdjacentElement('afterbegin', imgElem);

  // create Qualis labels annotations
  let qualisAnnot;

  if (qualisLabels.qualis == 'N') {
    qualisAnnot = ` Não classificado, ISSN ${issn}`;
  } else {
    qualisAnnot = qualisLabels.adjusted
      ? ` ${qualisLabels.qualis} (ajustado), ISSN ${issn}`
      : ` ${qualisLabels.qualis}, ISSN ${issn}`;

    qualisAnnot += qualisLabels.linkScopus
      ? ` (${createUrlHTML(
          'Scopus',
          'Clique para visualizar a página do periódico na Scopus',
          qualisLabels.linkScopus
        )}), `
      : `, `;

    qualisAnnot += `fonte ${createUrlHTML(
      dataSource[qualisLabels.source].text,
      '',
      dataSource[qualisLabels.source].url
    )}, ano-base ${dataSource[qualisLabels.source].baseYear}`;
  }
  // qualisAnnot += ")";
  annotElem.insertAdjacentHTML('beforeend', qualisAnnot);

  // inject annotation element into Lattes page
  elem.insertAdjacentElement('afterend', annotElem);
}

function setAttributes(elem, attrs) {
  for (const key of Object.keys(attrs)) {
    elem.setAttribute(key, attrs[key]);
  }
}

function createUrlHTML(text, title, url) {
  return `<a href="${url}" target="_blank" title="${title}">${text}</a>`;
}

function consolidateQualisResults(qualisInfo) {
  const qualisCounts = {
    year: [],
    A1: [],
    A2: [],
    A3: [],
    A4: [],
    B1: [],
    B2: [],
    B3: [],
    B4: [],
    C: [],
    N: [],
  };

  const currYearCounts = {
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
  };

  var pubInfoList = [];

  var pubInfoYearList = [];

  var currYear = 0;

  for (let i = 0; i < qualisInfo.length; i++) {
    // console.log(currYear);
    // console.log(currYearCounts);
    // console.log(qualisCounts);

    if (currYear != qualisInfo[i].year) {
      if (currYear > 0) {
        // add current year counts to Qualis results
        for (const key of Object.keys(currYearCounts)) {
          qualisCounts[key].push(currYearCounts[key]);
        }

        // add current year publication list to pubInfoList
        pubInfoList.push({ year: currYear, pubList: pubInfoYearList });

        // reset year counts
        for (const key of Object.keys(currYearCounts)) {
          currYearCounts[key] = 0;
        }

        // reset pubInfoYearList
        pubInfoYearList = [];
      }
      // update current year
      currYear = qualisInfo[i].year;

      // add current year to Qualis results
      qualisCounts.year.push(currYear);
    }
    // increment year counts
    currYearCounts[qualisInfo[i].qualisLabels.qualis] += 1;

    // create pubInfo
    const pubInfo = {
      issn: qualisInfo[i].issn,
      title: qualisInfo[i].title,
      qualis: qualisInfo[i].qualisLabels.qualis,
      percentil: qualisInfo[i].qualisLabels.percentil,
      baseYear: qualisInfo[i].qualisLabels.baseYear,
    };

    // add pubInfo to pubInfoYearList
    pubInfoYearList.push(pubInfo);
  }

  if (qualisCounts.year.length > qualisCounts.A1.length) {
    // add year counts to Qualis results
    for (const key of Object.keys(currYearCounts)) {
      qualisCounts[key].push(currYearCounts[key]);
    }

    // add pubInfoYearList to pubInfoList
    pubInfoList.push({ year: currYear, pubList: pubInfoYearList });
  }

  return { stats: qualisCounts, pubInfo: pubInfoList };
}

(async () => await main())();

async function main() {
  // Start the timer
  console.time('Execution time');

  // Define data source paths, texts, URLs and base years
  const dataSourceInfo = {
    capes: {
      pathList: ['data/qualis-capes-2017-2020.json'],
      text: 'Qualis/CAPES',
      url: 'https://sucupira.capes.gov.br/sucupira/public/consultas/coleta/veiculoPublicacaoQualis/listaConsultaGeralPeriodicos.jsf',
      baseYear: '2020',
    },
    pucrs: {
      pathList: ['data/qualis-pucrs-2022.json'],
      text: 'Qualis/PUC-RS',
      url: 'https://ppgcc.github.io/discentesPPGCC/pt-BR/qualis/',
      baseYear: '2021',
    },
    scopus: {
      pathList: [
        'data/scopus-citescore-2011-2020-part-1.json',
        'data/scopus-citescore-2011-2020-part-2.json',
      ],
      text: 'Scopus',
      url: 'https://www.scopus.com/',
      baseYear: '2020',
    },
  };

  const ImagesURLs = {
    qlattesIconURL: chrome.runtime.getURL('images/icon-16.png'),
    qlattesLogoURL: chrome.runtime.getURL('images/qlattes-logo.png'),
    exclamationIconURL: chrome.runtime.getURL('images/exclamation-icon.png'),
    scopusIconURL: chrome.runtime.getURL('images/scopus-icon-16.png'),
    scholarIconURL: chrome.runtime.getURL('images/scholar-hat-icon-18.png'),
  };

  // define alert message (may be blank)
  const alertMessage = `Novidades da Versão 0.1.7:</br></br>
    <ul style="margin-left: 20px; line-height: 1.5;">
    <li>As anotações no CV Lattes agora incluem o ícone <img
      src="${ImagesURLs.scholarIconURL}"
      alt="Ícone do Google Acadêmico"
      style="margin-left: 0px; margin-bottom: -4px"
    /> com um link para buscar o título dos artigos diretamente no Google Acadêmico; quando disponível, o link para a página do periódico no portal da Scopus também é incluído com o ícone <img
      src="${ImagesURLs.scopusIconURL}"
      alt="Ícone da Scopus"
      style="margin-left: 0px; margin-bottom: -4px"
    />.</li>
    <li>A ferramenta agora possibilita visualizar a pontuação do Qualis na forma de tabela e gráfico, considerando os pontos de cada estrato (A1=100, A2=85, etc.) atribuídos pela CAPES. Os pontos dos estratos estão descritos na aba "Instruções de Uso" da página de visualização de dados da ferramenta.</li>
    <li>As visualizações dos cinco e dez artigos mais bem classificados agora incluem o título dos artigos.</li>
    </ul>`;

  // attempt to get CV name and link from Lattes page
  const nameLink = getLattesNameAndLink();

  // check whether name and link were not found (if not this is not a CV Lattes!)
  if (!nameLink['name']) {
    console.log('No Lattes author name element found!');

    return;
  }

  // get data sources
  const pucrsData = await getDataArray(dataSourceInfo, 'pucrs');
  console.log('fetched PUC-RS data source', pucrsData);

  const scopusData = await getDataArray(dataSourceInfo, 'scopus');
  console.log('fetched Scopus data source', scopusData);

  const capesData = await getDataArray(dataSourceInfo, 'capes');
  console.log('fetched CAPES data source', capesData);

  // start processing Lattes page
  processLattesPage(
    nameLink,
    ImagesURLs,
    alertMessage,
    {
      pucrs: pucrsData,
      scopus: scopusData,
      capes: capesData,
    },
    dataSourceInfo
  );

  // End the timer
  console.timeEnd('Execution time');
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

async function getDataArray(dataSourceInfo, dataSourceName) {
  let dataArray = [];

  // read data source from file(s)
  for (const dataSourcePath of dataSourceInfo[dataSourceName].pathList) {
    // get data source url
    const dataSourceUrl = chrome.runtime.getURL(dataSourcePath);

    // read data source from url
    const dataSource = await fetchJSON(dataSourceUrl);
    console.log(
      `fetched file ${dataSourcePath} of data source ${dataSourceName}`
    );

    // concat data source into output data array
    dataArray = dataArray.concat(dataSource);
  }
  console.log(
    `Array ${dataSourceName} size: ${
      new Blob([JSON.stringify(dataArray)]).size
    }`
  );

  return dataArray;
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

async function processLattesPage(
  nameLink,
  ImagesURLs,
  alertMessage,
  qualisData,
  dataSourceInfo
) {
  // console.log(qualisData);

  // do not process Lattes page if already annotated
  const alertDiv = document.querySelector('#annotation-alert-div');
  if (alertDiv) return;

  // reset Qualis data cache
  var qualisDataCache = {};

  // Annotate Lattes page with Qualis classification
  // and return annotated Lattes info
  const lattesInfo = annotateLattesPage(
    ImagesURLs,
    qualisData,
    qualisDataCache,
    dataSourceInfo
  );

  // inject annotation alert into Lattes page
  if (lattesInfo) {
    injectAnnotationAlert(ImagesURLs, alertMessage);
  }

  // Consolidate Lattes stats from Lattes info
  const statsInfo = consolidateQualisResults(lattesInfo);
  // console.log(statsInfo);

  // attempt to read Lattes data from local storage area
  const lattesData = await chrome.storage.local.get('lattes_data');
  var lattesDataObject = {};

  // check whether Lattes data on local storage is not empty
  if (Object.keys(lattesData).length !== 0) {
    // get existing Lattes data items
    lattesDataObject = lattesData['lattes_data'];
  }
  // add current Lattes data to Lattes data array
  lattesDataObject[nameLink.link] = { name: nameLink.name, statsInfo};

  // Save Lattes data array to local storage area
  await chrome.storage.local.set({ lattes_data: lattesDataObject });
  console.log('Lattes name, link, stats saved!');
}

// Annotate and extract journal info form Lattes page
function annotateLattesPage(
  ImagesURLs,
  qualisData,
  qualisDataCache,
  dataSourceInfo
) {
  console.log('Searching for journal publications...');
  //console.log(qualisData);

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
      pubName: '',
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
          qualisPubInfo.issn = issnStr
            ? issnStr.substring(0, 4) + '-' + issnStr.substring(4, 8)
            : '';
        }

        // get paper title
        if (pubInfoItem.includes('titulo=')) {
          qualisPubInfo.title = pubInfoItem.split('titulo=')[1];
        }

        // get publication name
        if (pubInfoItem.includes('nomePeriodico=')) {
          qualisPubInfo.pubName = pubInfoItem.split('nomePeriodico=')[1];
          // convert journal name to uppercase
          qualisPubInfo.pubName = qualisPubInfo.pubName.toUpperCase();
        }
      }

      // get journal Qualis classification labels
      const qualisLabels = getQualis(
        qualisPubInfo.issn,
        qualisPubInfo.pubName,
        qualisData,
        qualisDataCache,
        dataSourceInfo
      );

      // // use journal name in Qualis labels if available
      // if (qualisLabels.pubName) {
      //   qualisPubInfo.pubName = qualisLabels.pubName;
      // }

      // add Qualis labels to Qualis info list
      qualisPubInfo.qualisLabels = qualisLabels;

      // inject Qualis info into Lattes page
      injectQualisAnnotation(
        pubElemLastItem,
        qualisPubInfo,
        ImagesURLs,
        dataSourceInfo
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

function getQualis(issn, pubName, qualisData, qualisDataCache, dataSourceInfo) {
  var qualisLabels = {
    pubName: '',
    qualis: 'N',
    percentil: '',
    linkScopus: '',
    adjusted: '',
    source: '',
    baseYear: '',
  };

  if (!issn) return qualisLabels;

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

  // search for issn in CAPES data source
  qualisLabels = getQualisFromCapesData(
    issn,
    altIssn,
    qualisData.capes,
    qualisData.scopus,
    dataSourceInfo
  );

  // if not found
  if (qualisLabels.qualis == 'N') {
    // search for issn in PUC-RS data source
    qualisLabels = getQualisFromPucrsData(
      issn,
      altIssn,
      pubName,
      qualisData.pucrs,
      dataSourceInfo
    );

    // if not found
    if (qualisLabels.qualis == 'N') {
      // search for issn in Scopus data source
      qualisLabels = getQualisFromScopusData(
        issn,
        qualisData.scopus,
        dataSourceInfo
      );
    }
  }

  // add labels to Qualis cache
  qualisDataCache.issn = qualisLabels;

  if (altIssn.length) {
    qualisDataCache.altIssn = qualisLabels;
  }

  // console.log({ qualisLabels });

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
  dataSourceInfo
) {
  // set default labels
  const qualisLabels = {
    pubName: '',
    qualis: 'N',
    percentil: '',
    linkScopus: '',
    adjusted: '',
    source: '',
    baseYear: '',
  };

  // search for issn in CAPES data source
  var match = capesData.find(
    (elem) => elem.issn == issn || (altIssn && elem.issn == altIssn)
  );

  if (match) {
    // console.log(match);

    // assign matched CAPES data to empty Qualis labels
    qualisLabels.qualis = match.qualis;
    qualisLabels.pubName = match.title.toUpperCase();
    qualisLabels.source = 'capes';
    qualisLabels.baseYear = dataSourceInfo.capes.baseYear;

    // attempt to get link to Scopus for issn
    const qualisLabelsScopus = getQualisFromScopusData(
      issn,
      scopusData,
      dataSourceInfo
    );
    // console.log(qualisLabelsScopus);

    if (qualisLabelsScopus.qualis != 'N') {
      qualisLabels.linkScopus = qualisLabelsScopus.linkScopus;
    }
  }

  return qualisLabels;
}

function getQualisFromPucrsData(
  issn,
  altIssn,
  pubName,
  pucrsData,
  dataSourceInfo
) {
  // set default labels
  const qualisLabels = {
    pubName: '',
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
    pubName: 'periodico',
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
    qualisLabels.baseYear = dataSourceInfo.pucrs.baseYear;
  }

  return qualisLabels;
}

function getQualisFromScopusData(issn, scopusData, dataSourceInfo) {
  // set default labels
  const qualisLabels = {
    pubName: '',
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
    // console.log(match);

    // assign matched Scopus data to empty Qualis labels
    qualisLabels.qualis = calculateQualisFromPercentil(match.percentil);
    qualisLabels.pubName = match.title.toUpperCase();
    qualisLabels.percentil = match.percentil;
    qualisLabels.linkScopus = match['source-id-url'];
    qualisLabels.source = 'scopus';
    qualisLabels.baseYear = dataSourceInfo.scopus.baseYear;
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

function injectQualisAnnotation(elem, pubInfo, ImagesURLs, dataSourceInfo) {
  // create annotation element
  const annotElem = document.createElement('p');

  // create QLattes icon elem
  const qlattesImgElem = document.createElement('img');
  setAttributes(qlattesImgElem, {
    src: ImagesURLs.qlattesIconURL,
    // style: "vertical-align:middle",
    style: 'margin-bottom:-4px',
  });
  // inject QLattes icon elem
  annotElem.insertAdjacentElement('afterbegin', qlattesImgElem);

  // create Qualis labels annotations
  let qualisAnnot;

  const issnLabel = pubInfo.issn ? `, ISSN ${pubInfo.issn}` : pubInfo.issn;

  if (pubInfo.qualisLabels.qualis == 'N') {
    qualisAnnot = ` Não classificado${issnLabel}`;
  } else {
    // add ISSN label
    qualisAnnot = ` ${pubInfo.qualisLabels.qualis}${issnLabel}`;

    // add Data source label
    qualisAnnot += `, fonte ${createTextLinkHTML(
      dataSourceInfo[pubInfo.qualisLabels.source].text,
      '',
      dataSourceInfo[pubInfo.qualisLabels.source].url
    )} (ano-base ${dataSourceInfo[pubInfo.qualisLabels.source].baseYear})`;
  }

  // add icon with link to search for paper title in Google Scholar
  const baseUrl = 'https://scholar.google.com/scholar?q=';
  const titleParam =
    'intitle%3A%22' +
    encodeURIComponent(pubInfo.title).replace(/%20/g, '+') +
    '%22';
  const linkScholar = `${baseUrl}${titleParam}`;

  qualisAnnot += ` ${createIconLinkHTML(
    ImagesURLs.scholarIconURL,
    'margin-bottom:-4px',
    'Clique para buscar a publicação no Google Acadêmico',
    linkScholar
  )}`;

  // add icon with link to Scopus page (if available)
  qualisAnnot += pubInfo.qualisLabels.linkScopus
    ? ` ${createIconLinkHTML(
        ImagesURLs.scopusIconURL,
        'margin-bottom:-4px',
        'Clique para visualizar a página do periódico na Scopus',
        pubInfo.qualisLabels.linkScopus
      )}`
    : '';

  annotElem.insertAdjacentHTML('beforeend', qualisAnnot);

  // inject annotation element into Lattes page
  elem.insertAdjacentElement('afterend', annotElem);
}

function injectAnnotationAlert(ImagesURLs, alertMessage) {
  // create link to font awesome stylesheet
  const linkElem = document.createElement('link');
  setAttributes(linkElem, {
    rel: 'stylesheet',
    href: 'https://use.fontawesome.com/releases/v6.2.1/css/all.css',
  });

  // get page head element
  const headElem = document.querySelector('head');

  // inject font awesome link into page head
  headElem.append(linkElem);

  // get main content div
  const mainContentDiv = document.getElementsByClassName('main-content')[0];

  // get visualization page URL
  const visualizationURL = chrome.runtime.getURL('index.html');

  // create alert HTML element (class="rodape-cv" style="margin: 0px 5px; color: #326C94; font-size: 1.2em;")
  const alertHeaderHTML = `
  <div class="layout-cell-pad-main" style="padding: 10px 10px">
    <div class="rodape-cv" style="margin: 0px 5px; color: #666666; font-size: 12px;">
      <a href="${visualizationURL}" target="_blank" id="qlattes-logo" style="margin: 0px 0px;" title="Abrir QLattes">
        <img src="${ImagesURLs.qlattesLogoURL}" width="70" style="margin-left: -3px; margin-bottom: -4px;">
      </a>
      anotou o Qualis dos artigos em periódicos nesta página.
      </br>`;
  // <i class="fa-solid fa-circle-exclamation" style="color: #FAB005; font-size: 1.6em; padding-bottom: 10px"></i>
  // <img src="${exclamationIconURL}" width="20" style="margin-left: 0px; margin-bottom: -2px;">
  const alertMessageHTML = alertMessage
    ? `
      </br> 
      <img src="${ImagesURLs.exclamationIconURL}" width="18" style="margin-left: 0px; margin-bottom: -1px;"> ${alertMessage}
      </br>`
    : '';
  const alertButtonsHTML = `
      <a href="#artigos-completos">
        <button style="color: #edf2f7; background-color: #3569a7; box-shadow: 1px 1px 1px #2e5469; padding: 4px 0.5em 3px; font-size: 12px; border-radius: 4px; cursor: pointer; width: 120px; text-align: left; margin-top: 10px; margin-bottom: 5px;">
          <i class="fa-solid fa-book-open" style="font-size: 1em;"></i> Visualizar artigos
        </button>
      </a> 
      <a href="${visualizationURL}" target="_blank" id="qlattes-link">
        <button style="color: #edf2f7; background-color: #3569a7; box-shadow: 1px 1px 1px #2e5469; padding: 4px 0.5em 3px; font-size: 12px; border-radius: 4px; cursor: pointer; width: 120px; text-align: left; margin-top: 10px; margin-bottom: 5px; margin-left: 5px;">
          <i class="fa-solid fa-square-poll-vertical" style="font-size: 1.1em;"></i>
          Visualizar dados
        </button>
      </a>
    </div>
  </div>`;

  // create new alert div
  const alertDiv = document.createElement('div');
  setAttributes(alertDiv, {
    class: 'main-content max-width min-width',
    id: 'annotation-alert-div',
  });
  alertDiv.innerHTML = alertHeaderHTML + alertMessageHTML + alertButtonsHTML;

  // inject alert div into Lattes page just before the main content div
  mainContentDiv.parentNode.insertBefore(alertDiv, mainContentDiv);
}

function setAttributes(elem, attrs) {
  for (const key of Object.keys(attrs)) {
    elem.setAttribute(key, attrs[key]);
  }
}

function createTextLinkHTML(text, tooltip, targetUrl) {
  return `<a href="${targetUrl}" target="_blank" title="${tooltip}">
            ${text}
          </a>`;
}

function createIconLinkHTML(iconUrl, iconStyle, tooltip, targetUrl) {
  return `<a href="${targetUrl}" target="_blank" title="${tooltip}">
            <img src="${iconUrl}" style="${iconStyle}">
          </a>`;
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
      pubName: qualisInfo[i].pubName,
      qualis: qualisInfo[i].qualisLabels.qualis,
      // percentil: qualisInfo[i].qualisLabels.percentil,
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

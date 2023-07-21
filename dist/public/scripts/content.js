// Wait for all images to load
window.addEventListener('load', function () {
  // Execute content script
  (async () => await main())();
});

async function main() {
  // Start the timer
  console.time('Execution time');

  // inject dependencies into Lattes page
  const dependencies = [
    {
      type: 'css',
      url: 'https://use.fontawesome.com/releases/v6.2.1/css/all.css',
    },
  ];
  injectDependencies(dependencies);

  // Define Qualis data source paths, texts, URLs and base years
  const qualisDataSourceInfo = {
    capes: {
      pathList: ['data/qualis-capes-2017-2020.json'],
      label: 'Qualis/CAPES',
      url: 'https://sucupira.capes.gov.br/sucupira/public/consultas/coleta/veiculoPublicacaoQualis/listaConsultaGeralPeriodicos.jsf',
      baseYear: '2020',
    },
    capes_alt: {
      pathList: ['data/qualis-capes-2017-2020-complemento.json'],
      label: 'Qualis/CAPES (via ISSN alternativo)',
      url: 'https://sucupira.capes.gov.br/sucupira/public/consultas/coleta/veiculoPublicacaoQualis/listaConsultaGeralPeriodicos.jsf',
      baseYear: '2020',
    },
    pucrs: {
      pathList: ['data/qualis-pucrs-2022.json'],
      label: 'Qualis/PUC-RS',
      url: 'https://ppgcc.github.io/discentesPPGCC/pt-BR/qualis/',
      baseYear: '2021',
    },
    scopus: {
      pathList: [
        'data/scopus-citescore-2011-2020-part-1.json',
        'data/scopus-citescore-2011-2020-part-2.json',
      ],
      label: 'Scopus',
      url: 'https://www.scopus.com/',
      baseYear: '2020',
    },
  };

  const imagesURLs = {
    qlattesIconURL: chrome.runtime.getURL('images/icon-16.png'),
    qlattesLogoURL: chrome.runtime.getURL('images/qlattes-logo.png'),
    scopusIconURL: chrome.runtime.getURL('images/scopus-icon-16.png'),
    scholarIconURL: chrome.runtime.getURL('images/scholar-hat-icon-18.png'),
  };

  const recentUpdatesURL = 'https://github.com/nabormendonca/qlattes/releases/tag/v0.2.0';

  // attempt to get CV name and link from Lattes page
  const nameLink = getLattesNameAndLink();

  // check whether name and link were not found (if not this is not a CV Lattes!)
  if (!nameLink['name']) {
    console.log('No Lattes author name element found!');
    return;
  }

  // get data sources from extension's local files
  const qualisData = {};
  for (const dataSource of Object.keys(qualisDataSourceInfo)) {
    qualisData[dataSource] = await getQualisDataSourceFromFile(
      qualisDataSourceInfo[dataSource]
    );
  }
  // start processing Lattes page
  processLattesPage(
    nameLink,
    imagesURLs,
    recentUpdatesURL,
    qualisData,
    qualisDataSourceInfo
  );
  // End the timer
  console.timeEnd('Execution time');
}

function injectDependencies(dependencies) {
  // get page head element
  const headElem = document.querySelector('head');

  for (const dependency of dependencies) {
    if (dependency.type == 'css') {
      const linkElem = document.createElement('link');
      setAttributes(linkElem, {
        rel: 'stylesheet',
        href: dependency.url,
      });
      // inject link element into page head
      headElem.append(linkElem);
    }
  }
}

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

async function getQualisDataSourceFromFile(dataSource) {
  let outputData = [];

  // read data source from file(s)
  for (const dataSourcePath of dataSource.pathList) {
    // get data source url
    const dataSourceUrl = chrome.runtime.getURL(dataSourcePath);

    // read data source from url
    const data = await fetchJSON(dataSourceUrl);
    console.log(
      `fetched file ${dataSourcePath} of data source ${dataSource.label}`
    );

    // concat data source into output data array
    outputData = outputData.concat(data);
  }
  console.log(
    `Data source "${dataSource.label}" has size ${
      new Blob([JSON.stringify(outputData)]).size
    }`
  );

  return outputData;
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

async function processLattesPage(
  nameLink,
  imagesURLs,
  recentUpdatesURL,
  qualisData,
  dataSourceInfo
) {
  console.log(qualisData);

  // // do not process Lattes page if already annotated
  // get visualization page URL
  const visualizationURL = chrome.runtime.getURL('index.html');

  // inject alert div into Lattes page
  injectAnnotationDiv(imagesURLs, visualizationURL);

  // reset Qualis data cache
  var qualisDataCache = {};

  // Annotate Lattes page with Qualis classification
  // and return annotated Lattes info
  const lattesInfo = annotateLattesPage(
    imagesURLs,
    qualisData,
    qualisDataCache,
    dataSourceInfo
  );

  // inject annotation alert into Lattes page
  if (lattesInfo) {
    injectAnnotationMessage(
      imagesURLs,
      visualizationURL,
      recentUpdatesURL,
      lattesInfo.length
    );
  }

  // Consolidate publication data from Lattes info
  const pubInfo = consolidateQualisData(lattesInfo);
  console.log('pubInfo:', pubInfo);

  // attempt to read Lattes data from local storage area
  const lattesData = await chrome.storage.local.get('lattes_data');
  var lattesDataObject = {};

  // check whether Lattes data on local storage is not empty
  if (Object.keys(lattesData).length !== 0) {
    // get existing Lattes data items
    lattesDataObject = lattesData['lattes_data'];
  }
  // add current Lattes data to Lattes data array
  lattesDataObject[nameLink.link] = { name: nameLink.name, pubInfo};
  console.log('lattesDataObject: ', lattesDataObject)

  // Save Lattes data array to local storage area
  await chrome.storage.local.set({ lattes_data: lattesDataObject });
  console.log('Lattes name, link, publication info saved!');
}

// Annotate and extract journal info form Lattes page
function annotateLattesPage(
  imagesURLs,
  qualisData,
  qualisDataCache,
  dataSourceInfo
) {
  console.log('Searching for journal publications...');
  //console.log(qualisData);
  var qualisInfo = [];
  qualisInfo = annotatePublishedArticles(
    imagesURLs,
    qualisData,
    qualisDataCache,
    dataSourceInfo
  );
  return qualisInfo;
}

function annotatePublishedArticles(
  imagesURLs,
  qualisData,
  qualisDataCache,
  dataSourceInfo
) {
  // get first published paper element
  const startElem = document.querySelector("div[id='artigos-completos']");

  // return empty array if there is no published paper in the CV
  if (!startElem) return [];

  const qualisInfo = [];

  // find all published articles
  const pubElems = startElem.querySelectorAll("div[class='artigo-completo']");

  for (const pubElem of pubElems) {
    //console.log(pubElem);
    const qualisPubInfo = {
      year: NaN,
      issn: '',
      title: '',
      pubName: '',
      qualisLabels: '',
      jcrData: {},
    };
    // get year of publication
    qualisPubInfo.year = parseInt(
      pubElem.querySelector(
        "span[class='informacao-artigo'][data-tipo-ordenacao='ano']"
      ).textContent
    );
    // skip current element if it has no year value
    if (isNaN(qualisPubInfo.year)) continue;
    // get publication data
    const pubElemData = pubElem.querySelector('div[cvuri]');
    if (pubElemData) {
      // get Journal info items
      const pubInfoString = escapeHtml(pubElemData.getAttribute('cvuri'))
        .split('?')
        .slice(1)
        .join('?')
        .replace(/<\/?monospace>/gi, '');
      const pubInfoItems = pubInfoString.split(/&(?=\w+)/);
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
          // console.log('title:', qualisPubInfo.title);
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
      // add Qualis labels to Qualis info list
      qualisPubInfo.qualisLabels = qualisLabels;
      // get JCR data
      const jcrData = pubElem.querySelector('img[class="ajaxJCR jcrTip"]');
      // console.log('JCR data:', jcrData);
      if (jcrData) {
        const jcrRegex = /JCR\s+(\d{4})\):\s+([\d.]+)/;
        const match = jcrRegex.exec(jcrData.getAttribute('original-title'));
        // console.log('JCR match:', match);
        if (match && match.length == 3) {
          qualisPubInfo.jcrData = {
            jcr: match[2],
            baseYear: match[1],
          };
        } else {
          console.log('No JCR match found');
        }
      }

      // inject Qualis info into Lattes page
      injectQualisAnnotation(
        pubElemData,
        qualisPubInfo,
        imagesURLs,
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
    altIssn = getAlternativeIssn(issn, qualisData.capes_alt, qualisData.scopus);
    if (altIssn !== '' && altIssn in qualisDataCache) {
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
        altIssn,
        qualisData.scopus,
        dataSourceInfo
      );
    }
  }
  // add labels to Qualis cache
  qualisDataCache.issn = qualisLabels;

  if (altIssn !== '') {
    qualisDataCache.altIssn = qualisLabels;
  }

  // console.log({ qualisLabels });

  return qualisLabels;
}

function getAlternativeIssn(issn, capesAltData, scopusData) {
  // search for issn in Capes complementary data
  var match = capesAltData.find(
    (elem) => elem.issn === issn || elem.alt_issn === issn
  );
  if (match) {
    if (match.alt_issn !== issn) {
      return match.alt_issn;
    } else if (match.issn !== issn) {
      return match.issn;
    } else {
      return '';
    }
  } else {
    // search for issn in Scopus data
    match = scopusData.find(
      (elem) => elem.issn === issn || elem['e-issn'] === issn
    );
    if (match) {
      if (match['e-issn'].length && match['e-issn'] !== issn) {
        return match['e-issn'];
      } else if (match.issn.length > 0 && match.issn !== issn) {
        return match.issn;
      } else {
        return '';
      }
    } else {
      return '';
    }
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
  var match = capesData.find((elem) => elem.issn === issn);
  if (match) {
    qualisLabels.source = 'capes';
  } else if (altIssn !== '') {
    match = capesData.find((elem) => elem.issn === altIssn);
    if (match) {
      qualisLabels.source = 'capes_alt';
    }
  }

  if (match) {
    // console.log(match);
    // assign matched CAPES data to empty Qualis labels
    qualisLabels.qualis = match.qualis;
    qualisLabels.pubName = match.title.toUpperCase();
    qualisLabels.baseYear = dataSourceInfo[qualisLabels.source].baseYear;

    // attempt to get link to Scopus for issn
    const qualisLabelsScopus = getQualisFromScopusData(
      issn,
      altIssn,
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

function getQualisFromScopusData(issn, altIssn, scopusData, dataSourceInfo) {
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
  if (!match && altIssn !== '') {
    match = scopusData.find(
      (elem) => elem.issn == altIssn || elem['e-issn'] == altIssn
    );
  }

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

function injectQualisAnnotation(elem, pubInfo, imagesURLs, dataSourceInfo) {
  // create annotation element
  const annotElem = document.createElement('p');

  // create QLattes icon elem
  const qlattesImgElem = document.createElement('img');
  setAttributes(qlattesImgElem, {
    src: imagesURLs.qlattesIconURL,
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
    // add Qualis category and ISSN
    qualisAnnot = ` ${pubInfo.qualisLabels.qualis}${issnLabel}`;
    // add Data source and base year
    const dataSourceLabel =
      pubInfo.qualisLabels.source == 'capes_alt'
        ? `${createTextLinkHTML(
            dataSourceInfo.capes.label,
            '',
            dataSourceInfo.capes.url
          )} (${
            dataSourceInfo[pubInfo.qualisLabels.source].baseYear
          }) via ISSN alternativo`
        : `${createTextLinkHTML(
            dataSourceInfo[pubInfo.qualisLabels.source].label,
            '',
            dataSourceInfo[pubInfo.qualisLabels.source].url
          )} (${dataSourceInfo[pubInfo.qualisLabels.source].baseYear})`;
    qualisAnnot += `, fonte ${dataSourceLabel}`;
  }
  // add icon with link to search for paper title in Google Scholar
  const baseUrl = 'https://scholar.google.com/scholar?q=';
  const titleParam =
    'intitle%3A%22' +
    encodeURIComponent(pubInfo.title).replace(/%20/g, '+') +
    '%22';
  const linkScholar = `${baseUrl}${titleParam}`;
  qualisAnnot += ` ${createIconLinkHTML(
    imagesURLs.scholarIconURL,
    'margin-bottom:-4px',
    'Buscar o título da publicação no Google Acadêmico',
    linkScholar
  )}`;
  // add icon with link to Scopus page (if available)
  qualisAnnot += pubInfo.qualisLabels.linkScopus
    ? ` ${createIconLinkHTML(
        imagesURLs.scopusIconURL,
        'margin-bottom:-4px',
        'Visualizar a página do periódico na Scopus',
        pubInfo.qualisLabels.linkScopus
      )}`
    : '';

  annotElem.insertAdjacentHTML('beforeend', qualisAnnot);

  // inject annotation element into Lattes page
  elem.insertAdjacentElement('afterend', annotElem);
}

function injectAnnotationDiv(imagesURLs, visualizationURL) {
  // get main content div
  const mainContentDiv = document.getElementsByClassName('main-content')[0];

  // create new alert div
  const alertDiv = document.createElement('div');
  setAttributes(alertDiv, {
    class: 'main-content max-width min-width',
    id: 'annot-div',
  });

  // inject alert div into Lattes page just before the main content div
  mainContentDiv.parentNode.insertBefore(alertDiv, mainContentDiv);

  console.log('Alert div injected!');
}

function injectAnnotationMessage(
  imagesURLs,
  visualizationURL,
  recentUpdatesURL,
  pubCount
) {
  var annotHeaderHTML;
  var annotButtonsHTML = '';
  var pubCountString;
  if (pubCount > 0) {
    // define number of publications string
    const sChar = pubCount > 1 ? 's' : '';
    pubCountString = `anotou o Qualis de ${pubCount} artigo${sChar} em periódico${sChar}  neste CV.`;
    annotButtonsHTML = `
    <a href="#artigos-completos">
      <button style="color: #edf2f7; background-color: #3569a7; box-shadow: 1px 1px 1px #2e5469; padding: 4px 0.5em 3px; font-size: 12px; border-radius: 4px; cursor: pointer; width: 142px; text-align: left; margin-top: 15px; margin-bottom: 10px;  margin-right: 5px;">
        <i class="fa-solid fa-note-sticky fa-flip-vertical" style="font-size: 1.1em; margin-top: 0px; margin-right: 2px;"></i> Ver anotações
      </button>
    </a>`;
  } else {
    pubCountString = `não anotou nenhum artigo em periódico neste CV.`;
  }
  annotHeaderHTML = `
    <a href="${visualizationURL}" target="_blank" id="qlattes-logo" style="margin: 0px 0px;" title="Abrir QLattes">
      <img src="${imagesURLs.qlattesLogoURL}" width="70" style="margin-left: -3px; margin-bottom: -4px;">
    </a>${pubCountString}
    </br>`;

  annotButtonsHTML += `
  <a href="${visualizationURL}" target="_blank" id="qlattes-visualization">
    <button style="color: #edf2f7; background-color: #3569a7; box-shadow: 1px 1px 1px #2e5469; padding: 4px 0.5em 3px; font-size: 12px; border-radius: 4px; cursor: pointer; width: 142px; text-align: left; margin-top: 10px; margin-bottom: 10px; margin-right: 5px;">
      <i class="fa-solid fa-chart-simple" style="font-size: 1.1em; margin-top: 0px; margin-right: 2px;"></i>
      Visualizar dados
    </button>
  </a>
  <a href="${recentUpdatesURL}" target="_blank" id="recent-updates">
  <button style="color: #edf2f7; background-color: #3569a7; box-shadow: 1px 1px 1px #2e5469; padding: 4px 0.5em 3px; font-size: 12px; border-radius: 4px; cursor: pointer; width: 142px; text-align: left; margin-top: 10px; margin-bottom: 10px;">
    <i class="fa-solid fa-bullhorn" style="font-size: 1.1em; margin-top: 0px; margin-right: 2px;"></i>
    Últimas atualizações
  </button>
  </a>
  `;

  // get alert div element
  const annotDiv = document.getElementById('annot-div');
  // define alert div contents
  annotDiv.innerHTML = `
  <div class="layout-cell-pad-main" style="padding: 10px 10px">
    <div class="rodape-cv" style="margin: 0px 5px; color: #666666; font-size: 13px;">
    ${annotHeaderHTML}${annotButtonsHTML}   
    </div>
  </div>`;
}

function setAttributes(elem, attrs) {
  for (const key of Object.keys(attrs)) {
    elem.setAttribute(key, attrs[key]);
  }
}

function createTextLinkHTML(text, tooltip, targetUrl) {
  return `<a href="${targetUrl}" target="_blank" title="${tooltip}">${text}</a>`;
}

function createIconLinkHTML(iconUrl, iconStyle, tooltip, targetUrl) {
  return `<a href="${targetUrl}" target="_blank" title="${tooltip}">
            <img src="${iconUrl}" style="${iconStyle}">
          </a>`;
}

function consolidateQualisData(qualisInfo) {
  var pubData = {};
  var pubDataYear = [];
  var currYear = 0;
  for (let i = 0; i < qualisInfo.length; i++) {
    if (currYear !== qualisInfo[i].year) {
      if (currYear > 0) {
        // add current year publication list to pubInfoList
        pubData[currYear] = pubDataYear;
        // reset pubInfoYearList
        pubDataYear = [];
      }
      // update current year
      currYear = qualisInfo[i].year;
    }
    // create pubInfo
    const pubDataItem = {
      issn: qualisInfo[i].issn,
      title: qualisInfo[i].title,
      pubName: qualisInfo[i].pubName,
      qualis: qualisInfo[i].qualisLabels.qualis,
      // percentil: qualisInfo[i].qualisLabels.percentil,
      baseYear: qualisInfo[i].qualisLabels.baseYear,
      jcr:
        Object.keys(qualisInfo[i].jcrData).length > 0
          ? qualisInfo[i].jcrData.jcr
          : 0,
      jcrYear:
        Object.keys(qualisInfo[i].jcrData).length > 0
          ? qualisInfo[i].jcrData.baseYear
          : '',
    };
    // add pubInfo to pubInfoYearList
    pubDataYear.push(pubDataItem);
  }
  if (currYear > 0) pubData[currYear] = pubDataYear;
  return pubData;
}
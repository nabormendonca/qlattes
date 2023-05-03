import '../App.css';
import '../Utils/utils.js';

function TopView({pubInfo, startYear, endYear, topN}) {
  let topPubs = [];

  // build publication array from PubInfo
  for (const pubInfoElem of Object.keys(pubInfo)) {
    // select PubInfo elements within given start and end years
    if (pubInfoElem >= startYear && pubInfoElem <= endYear) {
      // process publication elements of current year
      for (const pubItem of pubInfo[pubInfoElem]) {
        // create publication entry
        const pubEntry = {
          year: pubInfoElem,
          title: pubItem.title,
          pubName: pubItem.pubName,
          issn: pubItem.issn,
          qualis: pubItem.qualis,
          baseYear: pubItem.baseYear,
        };

        // insert publication entry into publication array
        topPubs.push(pubEntry);
      }
    }
  }
  // return top N publications from sorted publication array sorted by Qualis classification
  topPubs = topPubs.sortByKeysReverse(['year']).sortByKeys(['qualis']).slice(0, topN);

  return (
    <table class="styled-table" id="top-papers-table" tag="view">
      <thead>
        <tr>
          <th type="number">#</th>
          <th type="year">Ano</th>
          <th type="text">Título</th>
          <th type="text">Periódico</th>
          <th type="issn">ISSN</th>
          <th type="qualis">Qualis</th>
          <th type="year">Ano base</th>
        </tr>
      </thead>
      <tbody>
        {topPubs.map((elem, index) => <tr>
          <td type="number">{index+1}</td>
          <td type="year">{elem.year}</td>
          <td type="text">{elem.title}</td>
          <td type="text">{elem.pubName}</td>
          <td type="issn">{elem.issn}</td>
          <td type="qualis">{elem.qualis}</td>
          <td type="year">{elem.baseYear}</td>
        </tr>)}
      </tbody>
    </table>
  );
}

export default TopView;

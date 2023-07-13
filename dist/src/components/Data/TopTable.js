
// reactstrap components
import {
  Card,
  CardHeader,
  Table,
  Row,
  Col,
} from "reactstrap";

// core components

const TopTable = ({
  tableName,
  init,
  end,
  pubInfo,
  topN
}) => {

  init = Number(init);
  end = Number(end);

  // Init data arrays
  // const years = stats.year.filter(year => year >= init && year <= end).map(year => year.toString());
  
  // Create header from data arrays
  const header = ["#", "Ano", "Título", "Periódico", "ISSN", "Qualis", "Ano-base"];

  let topPubs = [];

  // build publication array from PubInfo
  for (const pubInfoElem of Object.keys(pubInfo)) {
    // select PubInfo elements within given start and end years
    if (pubInfoElem >= init && pubInfoElem <= end) {
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
    <Row>
      <Col className="mb-5 mb-xl-0" xl="10">
        <Card className="shadow">
          <CardHeader className="border-0">
            <Row className="align-items-center">
              <div className="col">
                <h3 className="mb-0">{tableName}</h3>
              </div>
            </Row>
          </CardHeader>
          <Table className="align-items-center table-flush" responsive>
            <thead className="thead-light">
              <tr>
                {header.map(item => <th scope="col">{item}</th>)}
              </tr>
            </thead>
            <tbody>
              {topPubs.map((topPub, index) => <tr>
                <td>{index+1}</td>
                <td>{topPub.year}</td>
                <td style={{
                  whiteSpace: 'break-spaces'
                }}>{topPub.title}</td>
                <td style={{
                  whiteSpace: 'break-spaces'
                }}>{topPub.pubName}</td>
                <td>{topPub.issn}</td>
                <td>{topPub.qualis}</td>
                <td>{topPub.baseYear}</td>
              </tr>)}
            </tbody>
          </Table>
        </Card>
      </Col>
    </Row>
  );
};

export default TopTable;

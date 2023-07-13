
// reactstrap components
import {
  Card,
  CardHeader,
  Table,
  Row,
  Col,
} from "reactstrap";

// core components

import {
  linearRegression,
  roundNumber
} from "../../utils"

const DataTable = ({
  tableName,
  init,
  end,
  stats,
  showStatistics,
  areaData
}) => {
  const qualisScores = {
    A1: 100,
    A2: 85,
    A3: 70,
    A4: 55,
    B1: 40,
    B2: 30,
    B3: 20,
    B4: 10,
    C: 0,
    N: 0,
  };

  init = Number(init);
  end = Number(end);

  // Init data arrays
  const years = stats.year.filter(year => year >= init && year <= end).map(year => year.toString());
  const qualis = {
    A1: Array(years.length).fill(0),
    A2: Array(years.length).fill(0),
    A3: Array(years.length).fill(0),
    A4: Array(years.length).fill(0),
    B1: Array(years.length).fill(0),
    B2: Array(years.length).fill(0),
    B3: Array(years.length).fill(0),
    B4: Array(years.length).fill(0),
    C: Array(years.length).fill(0),
    N: Array(years.length).fill(0),
  }
  const totals = {
    A: Array(years.length).fill(0),
    B: Array(years.length).fill(0),
    all: Array(years.length).fill(0)
  };
  const percentages = {
    A: Array(years.length).fill(0),
    B: Array(years.length).fill(0),
  };
  const totalStats = {
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
    '#A': 0,
    '#B': 0,
    '#all': 0,
    '%A': 0,
    '%B': 0,
  }

  // CHANGE - reset total stats
  let statistics = {};
  for (const key of ['#A', '#B', '#all', '%A', '%B']) {
    statistics[key] = {
      best: { count: 0, year: 0 },
      countList: [],
      yearList: [],
    };
  }

  // Get row datas
  for (let currYear = 0; currYear < years.length; currYear++) {
    // se o ano do stats nao estiver no meio do intervalo, pula
    if (stats.year[currYear] < init && stats.year[currYear] > end) continue;
    
    // create cells with data cols
    for (const key of Object.keys(qualis)) {
      const keyChar = key.slice(0, 1);

      // value
      const currentValue = (areaData && areaData.scores && key in areaData.scores)
        ? areaData.scores[key]*stats[key][currYear] : stats[key][currYear];

      // Qualis columns
      qualis[key][currYear] = currentValue;

      // Total columns
      totals.all[currYear] += currentValue;
      if (['A', 'B'].includes(keyChar)) {
        totals[keyChar][currYear] += currentValue;
        percentages[keyChar][currYear] += currentValue;
      }

      // Total row
      totalStats[key] += currentValue;
      totalStats['#all'] += currentValue;
      if (['A', 'B'].includes(keyChar)) {
        totalStats['#'+keyChar] += currentValue;
        totalStats['%'+keyChar] += currentValue;
      }
    }

    percentages.A[currYear] = totals.all[currYear]===0 ? 0 : (percentages.A[currYear]/totals.all[currYear]*100);
    percentages.B[currYear] = totals.all[currYear]===0 ? 0 : (percentages.B[currYear]/totals.all[currYear]*100);

    // CHANGE - 
    const yearCounts = {
      '#A': totals.A[currYear],
      '#B': totals.B[currYear],
      '#all': totals.all[currYear],
      '%A': percentages.A[currYear],
      '%B': percentages.B[currYear]
    };
    
    // CHANGE - 
    for (const key of Object.keys(statistics)) {
      // update total stats lists
      statistics[key].countList.push(yearCounts[key]);
      statistics[key].yearList.push(stats.year[currYear]);

      // update total stats best
      if (yearCounts[key] >= statistics[key].best.count) {
        statistics[key].best.count = yearCounts[key];
        statistics[key].best.year = stats.year[currYear];
      }
    }
  }
  
  // Create header from data arrays
  const header = ["Ano"].concat(Object.keys(qualis))
    .concat(Object.keys(totals).map(item => item === "all" ? "Total" : "Tot " + item))
    .concat(Object.keys(percentages).map(item => "% " + item));
  const headerLegend = areaData && areaData.scores && [""].concat(Object.keys(qualis).map(item => qualisScores[item]))
    .concat(Object.keys(totals).map(item => ""))
    .concat(Object.keys(percentages).map(item => ""));

  // Create footer from data arrays
  const footer = ["Total"].concat(Object.values(totalStats).map(number => roundNumber(number)));

  // Get statistics
  const mean = ["Média"].concat(Object.keys(qualis).map(item => ""));
  const median = ["Mediana"].concat(Object.keys(qualis).map(item => ""));
  const trend = ["Tendência"].concat(Object.keys(qualis).map(item => ""));
  const bestYear = ["Melhor ano"].concat(Object.keys(qualis).map(item => ""));

  // CHANGE - 
  for (const col of Object.keys(statistics)) {
    mean.push(statistics[col].countList == 0 ? 0 : statistics[col].countList.mean().toFixed(2));
    median.push(statistics[col].countList == 0 ? 0 : statistics[col].countList.median().toFixed(2));
    trend.push(statistics[col].countList == 0 ? 0 : linearRegression(statistics[col].yearList, statistics[col].countList).slope.toFixed(2));
    bestYear.push(statistics[col].best.year > 0 ? statistics[col].best.year : '');
  }

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
              <tr style={{
                  // display: 'table',
                  width: '98.5%'
                }}>
                {header.map(item => <th scope="col" style={typeof areaData !== 'undefined' ? { borderBottom: 'none'} : {}}>{item}</th>)}
              </tr>
              {typeof areaData !== 'undefined' &&
                <tr style={{
                  // display: 'table',
                  width: '98.5%'
                }}>
                {Array.isArray(headerLegend) && headerLegend.map(item => <th scope="col" style={{borderTop: 'none'}}>{item}</th>)}
                </tr>
              }
            </thead>
            <tbody 
              // style={{ display: 'block', maxHeight: '40vh', overflowY: 'auto' }}
            >
              {years.map((year, index) => 
                <tr style={{
                  // display: 'table',
                  width: '100%'
                }}>
                  <th scope="row">{year}</th>
                  {Object.values(qualis).map(item => <td>{roundNumber(item[index])}</td>)}
                  {Object.values(totals).map(item => <td>{roundNumber(item[index])}</td>)}
                  {Object.values(percentages).map(item => <td>{roundNumber(item[index])}</td>)}
                </tr>
              ).reverse()}
            </tbody>
            <tfoot className="thead-light">
              <tr style={{
                  // display: 'table',
                  width: '98.5%'                  
                }}>
                {footer.map(item => <th scope="col" style={{ borderBottom: 'none' }}>{item}</th>)}
              </tr>
              {showStatistics && (<>
                <tr style={{
                    // display: 'table',
                    width: '98.5%'
                  }}>
                  {mean.map(item => <th scope="col" style={{ borderTop: 'none', borderBottom: 'none' }}>{item}</th>)}
                </tr>
                <tr style={{
                    // display: 'table',
                    width: '98.5%'
                  }}>
                  {median.map(item => <th scope="col" style={{ borderTop: 'none', borderBottom: 'none' }}>{item}</th>)}
                </tr>
                <tr style={{
                    // display: 'table',
                    width: '98.5%'
                  }}>
                  {trend.map(item => <th scope="col" style={{ borderTop: 'none', borderBottom: 'none' }}>{item}</th>)}
                </tr>
                <tr style={{
                    // display: 'table',
                    width: '98.5%'
                  }}>
                  {bestYear.map(item => <th scope="col" style={{ borderTop: 'none', borderBottom: 'none' }}>{item}</th>)}
                </tr>
              </>)}
            </tfoot>
          </Table>
        </Card>
      </Col>
    </Row>
  );
};

export default DataTable;
